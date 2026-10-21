import '@angular/compiler';
import { computed, DOCUMENT, Injector, signal } from '@angular/core';
import { injectStream, UseStreamOptions } from '@langchain/angular';
import { Client, ThreadState } from '@langchain/langgraph-sdk';
import {
  ensureMessageInstances,
  StreamOrchestrator,
} from '@langchain/langgraph-sdk/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Chat } from './chat';
import { ChatMessage, ChatState, messageText } from './chat.model';

vi.mock('@langchain/angular', () => ({ injectStream: vi.fn() }));

type RunOptions = NonNullable<Parameters<Client['runs']['stream']>[2]>;
const cleanups: (() => void)[] = [];

function threadState(messages: ChatMessage[] = []): ThreadState<ChatState> {
  return {
    values: { messages },
    next: [],
    tasks: [],
    metadata: {},
    checkpoint: {
      thread_id: 'thread-1',
      checkpoint_ns: '',
      checkpoint_id: 'checkpoint-1',
      checkpoint_map: {},
    },
    parent_checkpoint: null,
    created_at: '2026-10-22T09:00:00Z',
  };
}

function wire(message: ChatMessage): ChatMessage {
  return { id: message.id, type: message.type, content: message.content };
}

function setup() {
  let savedMessages: ChatMessage[] = [];
  const client = {
    threads: {
      create: vi.fn().mockResolvedValue({ thread_id: 'thread-1' }),
      search: vi.fn().mockResolvedValue([]),
      getState: vi.fn(async () => threadState(savedMessages)),
    },
    runs: {
      stream: vi.fn(async function* (
        threadId: string,
        _assistant: string,
        options: RunOptions,
      ): ReturnType<Client['runs']['stream']> {
        options.onRunCreated?.({ thread_id: threadId, run_id: 'run-1' });
        const input = options.input as ChatState | null;
        const messages = input?.messages ?? savedMessages;
        if (!messages.length) {
          yield {
            event: 'error',
            data: { error: 'EmptyInputError', message: 'EmptyInputError' },
          };
          return;
        }
        yield {
          event: 'values',
          data: {
            messages: [
              ...messages.map(wire),
              { id: 'reply-1', type: 'ai', content: 'Hello there' },
            ],
          },
        };
      }),
    },
  };

  // Use the real SDK controller; only its HTTP calls and Angular effect bridge are faked.
  let controller!: StreamOrchestrator<ChatState>;
  const stop = vi.fn(() => controller.stop());
  vi.mocked(injectStream).mockImplementation((options) => {
    controller = new StreamOrchestrator<ChatState>(
      options as unknown as UseStreamOptions<ChatState>,
      {
        getClient: () => client as unknown as Client,
        getAssistantId: () => 'chat',
        getMessagesKey: () => 'messages',
      },
    );
    const version = signal(0);
    const unsubscribe = controller.subscribe(() =>
      version.update((value) => value + 1),
    );
    cleanups.push(() => {
      unsubscribe();
      controller.dispose();
    });
    controller.initThreadId(undefined);
    const read = <T>(get: () => T) =>
      computed(() => {
        version();
        return get();
      });
    return {
      client,
      messages: read(() => ensureMessageInstances(controller.messages)),
      error: read(() => controller.error),
      isLoading: read(() => controller.isLoading),
      isThreadLoading: read(() => controller.isThreadLoading),
      submit: controller.submit.bind(controller),
      switchThread: controller.switchThread.bind(controller),
      stop,
    } as unknown as ReturnType<typeof injectStream>;
  });
  const injector = Injector.create({
    providers: [
      Chat,
      {
        provide: DOCUMENT,
        useValue: { location: { origin: 'http://localhost:4200' } },
      },
    ],
  });
  const chat = injector.get(Chat);
  cleanups.push(() => injector.destroy());
  return {
    chat,
    client,
    stop,
    save: (messages: ChatMessage[]) => {
      savedMessages = messages;
    },
  };
}

beforeEach(() =>
  vi.spyOn(console, 'error').mockImplementation(() => undefined),
);
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('chat integration', () => {
  it('sends one new turn and guards against concurrent sends', async () => {
    const { chat, client } = setup();
    let finish!: () => void;
    const waiting = new Promise<void>((resolve) => {
      finish = resolve;
    });
    client.runs.stream.mockImplementationOnce(async function* () {
      await waiting;
      yield { event: 'values', data: { messages: [] } };
    });
    const sending = chat.send('  Hello  ');
    expect(chat.busy()).toBe(true);
    await chat.send('Another question');
    await vi.waitFor(() => expect(client.runs.stream).toHaveBeenCalledOnce());
    const [threadId, assistant, options] = client.runs.stream.mock.calls[0];
    expect([threadId, assistant]).toEqual(['thread-1', 'chat']);
    expect((options.input as ChatState).messages[0].content).toBe('Hello');
    expect(options.onDisconnect).toBe('cancel');
    finish();
    await sending;
    expect(chat.busy()).toBe(false);
  });

  it('loads a conversation and clears its messages for a new chat', async () => {
    const { chat, client } = setup();
    client.threads.search.mockResolvedValueOnce([
      { thread_id: 'old-thread', metadata: { title: 'Earlier chat' } },
    ]);
    client.threads.getState.mockResolvedValueOnce(
      threadState([
        { id: 'old-question', type: 'human', content: 'Earlier question' },
      ]),
    );
    await chat.loadConversations();
    chat.selectConversation('old-thread');
    await vi.waitFor(() => expect(chat.messages()).toHaveLength(1));
    expect(chat.activeId()).toBe('old-thread');
    expect(chat.conversations()).toEqual([
      { id: 'old-thread', title: 'Earlier chat' },
    ]);
    chat.newChat();
    expect(chat.activeId()).toBeNull();
    expect(chat.messages()).toEqual([]);
  });

  it('resumes a checkpointed failed turn without submitting the question again', async () => {
    const { chat, client, save } = setup();
    client.runs.stream.mockImplementationOnce(
      async function* (
        threadId,
        _assistant,
        options,
      ): ReturnType<Client['runs']['stream']> {
        options.onRunCreated?.({ thread_id: threadId, run_id: 'failed-run' });
        save((options.input as ChatState).messages.map(wire));
        yield {
          event: 'values',
          data: { messages: (options.input as ChatState).messages.map(wire) },
        };
        yield {
          event: 'error',
          data: { error: 'Error', message: 'Provider unavailable' },
        };
      },
    );
    await chat.send('Hello');
    expect(chat.error()).toBe('Provider unavailable');
    await chat.retry();
    expect(client.runs.stream.mock.lastCall?.[2].input).toBeNull();
    expect(
      chat.messages().filter((message) => message.type === 'human'),
    ).toHaveLength(1);
    expect(chat.error()).toBe('');
  });

  it('keeps the question when an accepted run fails before creating a checkpoint', async () => {
    const { chat, client } = setup();
    client.runs.stream.mockImplementationOnce(
      async function* (
        threadId,
        _assistant,
        options,
      ): ReturnType<Client['runs']['stream']> {
        options.onRunCreated?.({ thread_id: threadId, run_id: 'failed-run' });
        yield {
          event: 'error',
          data: {
            error: 'SkeinConfigError',
            message:
              'Failed to import graph module: missing model configuration',
          },
        };
      },
    );
    await chat.send('Hello');
    const original = client.runs.stream.mock.lastCall?.[2].input;
    expect(chat.error()).toContain('Check its model configuration');
    await chat.retry();
    expect(client.runs.stream.mock.lastCall?.[2].input).toEqual(original);
    expect(chat.messages().map((message) => message.content)).toEqual([
      'Hello',
      'Hello there',
    ]);
    expect(chat.error()).toBe('');
  });

  it('does not duplicate the optimistic question across rejected retries', async () => {
    const { chat, client } = setup();
    const offline = () =>
      ({
        async *[Symbol.asyncIterator]() {
          yield await Promise.reject(new Error('Offline'));
        },
      }) as ReturnType<Client['runs']['stream']>;
    client.runs.stream
      .mockImplementationOnce(offline)
      .mockImplementationOnce(offline);
    await chat.send('Hello');
    expect(chat.error()).toBe('Offline');
    expect(chat.messages()).toHaveLength(1);
    const original = client.runs.stream.mock.lastCall?.[2].input;
    await chat.retry();
    expect(chat.messages()).toHaveLength(1);
    expect(client.runs.stream.mock.lastCall?.[2].input).toEqual(original);
    await chat.retry();
    expect(
      chat.messages().filter((message) => message.type === 'human'),
    ).toHaveLength(1);
    expect(chat.error()).toBe('');
  });

  it('retries the selected conversation history after a transient failure', async () => {
    const { chat, client } = setup();
    client.threads.getState
      .mockRejectedValueOnce(new Error('History offline'))
      .mockResolvedValueOnce(
        threadState([
          { id: 'old', type: 'human', content: 'Earlier question' },
        ]),
      );
    chat.selectConversation('old-thread');
    await vi.waitFor(() => expect(chat.error()).toBe('History offline'));
    await chat.retry();
    await vi.waitFor(() =>
      expect(chat.messages().map((message) => message.content)).toEqual([
        'Earlier question',
      ]),
    );
    expect(client.threads.getState).toHaveBeenCalledTimes(2);
    expect(client.threads.getState).toHaveBeenLastCalledWith('old-thread');
    expect(client.threads.search).not.toHaveBeenCalled();
    expect(chat.activeId()).toBe('old-thread');
    expect(chat.error()).toBe('');
  });

  it('keeps the pending question if the retry state check fails', async () => {
    const { chat, client } = setup();
    client.runs.stream.mockImplementationOnce(
      () =>
        ({
          async *[Symbol.asyncIterator]() {
            yield await Promise.reject(new Error('Offline'));
          },
        }) as ReturnType<Client['runs']['stream']>,
    );
    await chat.send('Hello');
    const original = client.runs.stream.mock.lastCall?.[2].input;
    client.threads.getState.mockRejectedValueOnce(new Error('State offline'));
    await chat.retry();
    expect(chat.error()).toBe('State offline');
    expect(client.runs.stream).toHaveBeenCalledOnce();
    await chat.retry();
    expect(client.runs.stream.mock.lastCall?.[2].input).toEqual(original);
    expect(
      chat.messages().filter((message) => message.type === 'human'),
    ).toHaveLength(1);
    expect(chat.error()).toBe('');
  });

  it('retries sidebar loading without resubmitting a successful turn', async () => {
    const { chat, client, stop } = setup();
    await chat.send('Hello');
    client.threads.search.mockRejectedValueOnce(new Error('Offline'));
    await chat.loadConversations();
    expect(chat.error()).toBe('Offline');
    await chat.retry();
    expect(client.threads.search).toHaveBeenCalledTimes(2);
    expect(client.runs.stream).toHaveBeenCalledOnce();
    expect(chat.error()).toBe('');
    chat.stop();
    expect(stop).toHaveBeenCalledOnce();
  });

  it('renders text blocks without exposing non-text provider content', () => {
    expect(
      messageText({
        type: 'ai',
        content: [
          { type: 'text', text: 'Hello ' },
          { type: 'image_url', image_url: 'https://example.com/image.png' },
          { type: 'text', text: 'there' },
        ],
      }),
    ).toBe('Hello there');
  });

  it('stops streaming when the chat provider is destroyed', () => {
    const { stop } = setup();
    cleanups.pop()?.();
    expect(stop).toHaveBeenCalledOnce();
  });
});
