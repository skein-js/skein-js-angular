import {
  computed,
  DestroyRef,
  DOCUMENT,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { injectStream } from '@langchain/angular';
import { HumanMessage } from '@langchain/core/messages';
import { ChatState, Conversation } from './chat.model';

@Injectable()
export class Chat {
  private readonly conversationState = signal<Conversation[]>([]);
  private readonly activeIdState = signal<string | null>(null);
  readonly conversations = this.conversationState.asReadonly();
  readonly activeId = this.activeIdState.asReadonly();
  private readonly pending = signal(false);
  private readonly requestError = signal<unknown>(undefined);
  private retryMessage: HumanMessage | undefined;
  private retryTarget: 'list' | 'history' | 'message' = 'list';

  // The Angular integration owns token assembly, thread hydration, and stream state.
  private readonly stream = injectStream<ChatState>({
    apiUrl: inject(DOCUMENT).location.origin + '/agent',
    assistantId: 'chat',
    fetchStateHistory: false,
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
    onFinish: () => {
      this.retryMessage = undefined;
      this.retryTarget = 'list';
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
    inject(DestroyRef).onDestroy(() => this.stream.stop());
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
    // Clear first so selecting the same thread also retries its history request.
    this.stream.switchThread(null);
    this.stream.switchThread(id);
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
    else if (this.retryTarget === 'history')
      this.selectConversation(this.activeId());
    else await this.loadConversations();
  }

  stop() {
    this.stream.stop();
  }

  private async submit(message: HumanMessage, retry = false) {
    this.pending.set(true);
    this.requestError.set(undefined);
    this.retryMessage = message;
    this.retryTarget = 'message';
    try {
      const id = this.activeId();
      const saved =
        retry && id
          ? await this.stream.client.threads.getState<ChatState>(id)
          : undefined;
      const checkpointed = saved?.values?.messages?.some(
        (item) => item.id === message.id,
      );
      // Send only the new turn. Skein supplies the checkpointed conversation history.
      // Resume saved turns; resend unsaved turns with their original ID.
      await this.stream.submit(checkpointed ? null : { messages: [message] }, {
        metadata: {
          app: 'angular-chat',
          title: String(message.content).slice(0, 48),
        },
        onDisconnect: 'cancel',
        optimisticValues: checkpointed
          ? undefined
          : (state) => ({
              messages: state.messages?.some((item) => item.id === message.id)
                ? state.messages
                : [...(state.messages ?? []), message],
            }),
      });
    } catch (error) {
      this.requestError.set(error);
    } finally {
      this.pending.set(false);
    }
  }
}
