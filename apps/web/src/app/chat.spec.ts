import '@angular/compiler';
import { DOCUMENT, Injector, signal } from '@angular/core';
import { injectStream, StreamApi, UseStreamOptions } from '@langchain/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Chat } from './chat';
import { ChatState, messageText } from './chat.model';

vi.mock('@langchain/angular', () => ({ injectStream: vi.fn() }));
vi.mock('@angular/core', async (original) => ({
  ...(await original<typeof import('@angular/core')>()),
  // Unit tests drive the render boundary; the real binding is checked in browser.
  afterNextRender: (callback: () => void) => queueMicrotask(callback),
}));

const cleanups: (() => void)[] = [];
function setup() {
  const error = signal<unknown>(undefined);
  const loading = signal(false);
  const messages = signal<ChatState['messages']>([]);
  let nextThread = 0;
  const client = {
    threads: {
      create: vi.fn(async () => ({ thread_id: `thread-${++nextThread}` })),
      search: vi.fn().mockResolvedValue([]),
      getState: vi.fn().mockResolvedValue({ values: { messages: [] } }),
    },
  };
  let options!: UseStreamOptions<ChatState>;
  const submit = vi.fn<StreamApi<ChatState>['submit']>(async () => {
    options.onThreadId?.('thread-1');
    error.set(undefined);
  });
  const stop = vi.fn().mockResolvedValue(undefined);
  vi.mocked(injectStream).mockImplementation((value) => {
    options = value as UseStreamOptions<ChatState>;
    return {
      client,
      messages,
      error,
      isLoading: loading,
      isThreadLoading: signal(false),
      submit,
      stop,
    } as unknown as StreamApi;
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
  return { chat, client, submit, stop, error, loading, options: () => options };
}

afterEach(() => {
  cleanups
    .splice(0)
    .reverse()
    .forEach((cleanup) => cleanup());
  vi.clearAllMocks();
});

describe('chat service with Angular SDK 1.x', () => {
  it('binds conversation selection through the public threadId signal', () => {
    const { chat, options } = setup();
    const threadId = options().threadId as () => string | null;
    chat.selectConversation('earlier');
    expect(threadId()).toBe('earlier');
    chat.newChat();
    expect(threadId()).toBeNull();
  });

  it('sends only a new turn and prevents concurrent submissions', async () => {
    const { chat, submit } = setup();
    let finish!: () => void;
    submit.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const sending = chat.send('  Hello  ');
    await chat.send('Second question');
    expect(submit).toHaveBeenCalledOnce();
    const [input, options] = vi.mocked(submit).mock.calls[0] as unknown as [
      ChatState,
      { multitaskStrategy: string },
    ];
    expect(input.messages.map((message) => message.content)).toEqual(['Hello']);
    expect(options.multitaskStrategy).toBe('reject');
    finish();
    await sending;
    expect(chat.busy()).toBe(false);
  });

  it('continues a checkpointed failed turn with null input', async () => {
    const { chat, submit, error, client, options } = setup();
    submit.mockImplementationOnce(async () => {
      options().onThreadId?.('thread-1');
      error.set(new Error('Provider unavailable'));
    });
    await chat.send('Hello');
    const original = submit.mock.calls[0] as unknown as [
      { messages: ChatState['messages'] },
    ];
    client.threads.getState.mockResolvedValueOnce({
      values: { messages: original[0].messages },
    });
    await chat.retry();
    expect(submit.mock.lastCall?.[0]).toBeNull();
  });

  it('reuses the original message ID when a failed turn was not checkpointed', async () => {
    const { chat, submit, error, options } = setup();
    submit.mockImplementationOnce(async () => {
      options().onThreadId?.('thread-1');
      error.set(new Error('Offline'));
    });
    await chat.send('Hello');
    const original = submit.mock.calls[0]?.[0];
    await chat.retry();
    expect(submit.mock.lastCall?.[0]).toEqual(original);
  });

  it('keeps the pending turn when its retry state check fails', async () => {
    const { chat, submit, error, client, options } = setup();
    submit.mockImplementationOnce(async () => {
      options().onThreadId?.('thread-1');
      error.set(new Error('Offline'));
    });
    await chat.send('Hello');
    client.threads.getState.mockRejectedValueOnce(new Error('State offline'));
    await chat.retry();
    expect(chat.error()).toBe('State offline');
    expect(submit).toHaveBeenCalledOnce();
    await chat.retry();
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it('retries history by clearing selection across a render, without submitting a run', async () => {
    const { chat, submit, options } = setup();
    chat.selectConversation('earlier');
    const retrying = chat.retry();
    const threadId = options().threadId as () => string | null;
    expect(threadId()).toBeNull();
    expect(chat.busy()).toBe(true);
    await retrying;
    expect(threadId()).toBe('earlier');
    expect(submit).not.toHaveBeenCalled();
  });

  it('retries the conversation list without resubmitting a completed turn', async () => {
    const { chat, client, submit } = setup();
    await chat.send('Hello');
    client.threads.search.mockRejectedValueOnce(new Error('Sidebar offline'));
    await chat.loadConversations();
    expect(chat.error()).toBe('Sidebar offline');
    await chat.retry();
    expect(client.threads.search).toHaveBeenCalledTimes(2);
    expect(submit).toHaveBeenCalledOnce();
    expect(chat.error()).toBe('');
  });

  it('starts a fresh SDK thread when New chat and send happen before the signal effect', async () => {
    const { chat, submit } = setup();
    await chat.send('Old conversation');
    chat.newChat();
    await chat.send('New conversation');
    expect(submit.mock.lastCall?.[1]).toMatchObject({ threadId: 'thread-2' });
  });

  it('stores the application marker and title on the thread, not just the run', async () => {
    const { chat, client } = setup();
    await chat.send('Tokyo trip');
    expect(client.threads.create).toHaveBeenCalledWith({
      metadata: { app: 'angular-chat', title: 'Tokyo trip' },
      signal: expect.any(AbortSignal),
    });
  });

  it('does not submit after Stop while thread creation is pending', async () => {
    const { chat, client, submit } = setup();
    let finish!: (thread: { thread_id: string }) => void;
    client.threads.create.mockImplementationOnce(
      () => new Promise((resolve) => (finish = resolve)),
    );
    const sending = chat.send('Do not start this');
    const [request] = client.threads.create.mock.calls[0] as unknown as [
      { signal: AbortSignal },
    ];
    chat.stop();
    expect(request.signal.aborted).toBe(true);
    finish({ thread_id: 'cancelled-thread' });
    await sending;
    expect(submit).not.toHaveBeenCalled();
    expect(chat.activeId()).toBeNull();
    expect(chat.error()).toBe('');
    expect(chat.busy()).toBe(false);
    await chat.send('Start a different request');
    expect(submit).toHaveBeenCalledOnce();
  });

  it('does not resume a failed turn after Stop during its state check', async () => {
    const { chat, client, submit, error } = setup();
    submit.mockImplementationOnce(async () => error.set(new Error('Offline')));
    await chat.send('Hello');
    let finish!: (state: { values: { messages: never[] } }) => void;
    client.threads.getState.mockImplementationOnce(
      () => new Promise((resolve) => (finish = resolve)),
    );
    const retrying = chat.retry();
    chat.stop();
    finish({ values: { messages: [] } });
    await retrying;
    expect(submit).toHaveBeenCalledOnce();
    expect(chat.busy()).toBe(false);
  });

  it('treats an aborted create request as cancellation rather than an error', async () => {
    const { chat, client, submit } = setup();
    let fail!: (error: Error) => void;
    client.threads.create.mockImplementationOnce(
      () => new Promise((_resolve, reject) => (fail = reject)),
    );
    const sending = chat.send('Cancel this request');
    chat.stop();
    fail(new DOMException('Aborted', 'AbortError'));
    await sending;
    expect(chat.error()).toBe('');
    expect(submit).not.toHaveBeenCalled();
    expect(chat.busy()).toBe(false);
  });

  it('keeps the first question as the conversation title on later turns', async () => {
    const { chat, submit } = setup();
    await chat.send('Tokyo trip');
    await chat.send('And Nairobi?');
    expect(submit.mock.lastCall?.[1]).toMatchObject({
      metadata: { title: 'Tokyo trip' },
    });
  });

  it('uses explicit SDK cancellation and stops on service destruction', () => {
    const { chat, stop } = setup();
    chat.stop();
    expect(stop).toHaveBeenCalledWith();
    cleanups.pop()?.();
    expect(stop).toHaveBeenCalledTimes(2);
  });

  it('maps a graph configuration failure to an actionable error', () => {
    const { chat, error } = setup();
    error.set(
      new Error('Failed to import graph module: missing model configuration'),
    );
    expect(chat.error()).toContain('Check its model configuration');
  });

  it('renders text blocks without exposing other provider content', () => {
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
});
