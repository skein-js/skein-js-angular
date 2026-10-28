import {
  afterNextRender,
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  Injectable,
  Injector,
  signal,
} from '@angular/core';
import { injectStream } from '@langchain/angular';
import { HumanMessage } from '@langchain/core/messages';
import { ChatState, Conversation } from './chat.model';

@Injectable()
export class Chat {
  private readonly injector = inject(Injector);
  private readonly conversationState = signal<Conversation[]>([]);
  private readonly activeIdState = signal<string | null>(null);
  readonly conversations = this.conversationState.asReadonly();
  readonly activeId = this.activeIdState.asReadonly();
  private readonly pending = signal(false);
  private readonly requestError = signal<unknown>(undefined);
  private retryMessage: HumanMessage | undefined;
  private retryTarget: 'list' | 'history' | 'message' = 'list';
  private submissionAbort: AbortController | undefined;

  // The Angular integration owns token assembly, thread hydration, and stream state.
  private readonly stream = injectStream<ChatState>({
    apiUrl: inject(DOCUMENT).location.origin + '/agent',
    assistantId: 'chat',
    threadId: this.activeIdState,
    onThreadId: (id) => {
      this.activeIdState.set(id);
      if (!this.conversations().some((item) => item.id === id)) {
        const title = String(this.retryMessage?.content ?? 'New chat').slice(
          0,
          48,
        );
        this.conversationState.update((items) => [{ id, title }, ...items]);
      }
    },
  });

  readonly messages = this.stream.messages;
  readonly busy = computed(
    () =>
      this.pending() ||
      this.stream.isLoading() ||
      this.stream.isThreadLoading(),
  );
  readonly error = computed(() => {
    const error = this.requestError() ?? this.stream.error();
    if (!error) return '';
    const message = error instanceof Error ? error.message : String(error);
    return message.startsWith('Failed to import graph module')
      ? 'The agent could not load. Check its model configuration in the backend terminal.'
      : message;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  async loadConversations() {
    this.pending.set(true);
    this.requestError.set(undefined);
    this.retryMessage = undefined;
    this.retryTarget = 'list';
    try {
      const threads = await this.stream.client.threads.search({
        metadata: { app: 'angular-chat' },
        limit: 50,
      });
      this.conversationState.set(
        threads.map((thread) => ({
          id: thread.thread_id,
          title: String(thread.metadata?.['title'] ?? 'New chat'),
        })),
      );
    } catch (error) {
      this.requestError.set(error);
    } finally {
      this.pending.set(false);
    }
  }

  newChat() {
    this.selectConversation(null);
  }

  selectConversation(id: string | null) {
    if (this.busy()) return;
    this.activeIdState.set(id);
    this.requestError.set(undefined);
    this.retryMessage = undefined;
    this.retryTarget = id ? 'history' : 'list';
  }

  async send(text: string) {
    const content = text.trim();
    if (!this.busy() && content)
      await this.submit(new HumanMessage({ content, id: crypto.randomUUID() }));
  }

  async retry() {
    if (this.busy()) return;
    if (this.retryTarget === 'message' && this.retryMessage)
      await this.submit(this.retryMessage, true);
    else if (this.retryTarget === 'history') {
      // v1 binds thread selection to a signal. Let the clear render before
      // reselecting the same ID so the binding performs a fresh hydration.
      const id = this.activeId();
      this.activeIdState.set(null);
      this.pending.set(true);
      await new Promise<void>((resolve) => {
        afterNextRender(
          () => {
            this.activeIdState.set(id);
            this.pending.set(false);
            resolve();
          },
          { injector: this.injector },
        );
      });
    } else await this.loadConversations();
  }

  stop() {
    this.submissionAbort?.abort();
    void this.stream.stop();
  }

  private async submit(message: HumanMessage, retry = false) {
    const abort = new AbortController();
    this.submissionAbort = abort;
    this.pending.set(true);
    this.requestError.set(undefined);
    this.retryMessage = message;
    this.retryTarget = 'message';
    try {
      let id = this.activeId();
      const title =
        this.conversations().find((item) => item.id === id)?.title ??
        String(message.content).slice(0, 48);
      // The current SDK's command metadata belongs to the run. Create the
      // thread explicitly so sidebar filtering and titles survive a refresh.
      if (!id) {
        const thread = await this.stream.client.threads.create({
          metadata: { app: 'angular-chat', title },
          signal: abort.signal,
        });
        abort.signal.throwIfAborted();
        id = thread.thread_id;
        this.activeIdState.set(id);
        this.conversationState.update((items) => [
          { id: thread.thread_id, title },
          ...items,
        ]);
      }

      const saved =
        retry && id
          ? await this.stream.client.threads.getState<ChatState>(
              id,
              undefined,
              {
                signal: abort.signal,
              },
            )
          : undefined;
      abort.signal.throwIfAborted();
      const checkpointed = saved?.values?.messages?.some(
        (item) => item.id === message.id,
      );
      // Send only the new turn. Skein supplies the checkpointed conversation history.
      // Resume saved turns; resend unsaved turns with their original ID.
      await this.stream.submit(checkpointed ? null : { messages: [message] }, {
        metadata: {
          app: 'angular-chat',
          title,
        },
        threadId: id,
        multitaskStrategy: 'reject',
      });
      if (!this.stream.error()) {
        this.retryMessage = undefined;
        this.retryTarget = 'list';
      }
    } catch (error) {
      if (!abort.signal.aborted) this.requestError.set(error);
    } finally {
      if (this.submissionAbort === abort) this.submissionAbort = undefined;
      this.pending.set(false);
    }
  }
}
