import { describe, it, expect, vi, beforeEach } from 'vitest';

type StreamCallbacks = {
  onData: (chunk: unknown) => void;
  onError?: (err: unknown) => void;
  onComplete?: () => void;
};

let lastSubscribeArgs: {
  input: { chatId: string; model: string; userMessage: string };
  callbacks: StreamCallbacks;
} | null = null;
const unsubscribe = vi.fn();

vi.mock('./trpc', () => ({
  trpcClient: {
    chat: {
      stream: {
        subscribe: (
          input: { chatId: string; model: string; userMessage: string },
          callbacks: StreamCallbacks,
        ) => {
          lastSubscribeArgs = { input, callbacks };
          return { unsubscribe };
        },
      },
    },
  },
}));

import { createTRPCChatTransport } from './trpcChatTransport';
import type { UIMessage } from 'ai';

function makeMessages(userText: string): UIMessage[] {
  return [
    {
      id: 'u1',
      role: 'user',
      parts: [{ type: 'text', text: userText }],
    },
  ];
}

async function readAllChunks(stream: ReadableStream<unknown>): Promise<unknown[]> {
  const reader = stream.getReader();
  const chunks: unknown[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

beforeEach(() => {
  lastSubscribeArgs = null;
  unsubscribe.mockReset();
});

describe('createTRPCChatTransport', () => {
  it('emits start + text-start chunks before any server data', async () => {
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');

    const stream = await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: makeMessages('hi'),
      trigger: 'submit-message',
      metadata: undefined,
    });

    // Emit a finish right away to close the stream
    lastSubscribeArgs!.callbacks.onData({ type: 'finish' });

    const chunks = await readAllChunks(stream);

    expect(chunks[0]).toMatchObject({ type: 'start' });
    expect(chunks[1]).toMatchObject({ type: 'text-start' });
  });

  it('forwards text-delta chunks to the reader', async () => {
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');
    const stream = await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: makeMessages('hi'),
      trigger: 'submit-message',
      metadata: undefined,
    });

    lastSubscribeArgs!.callbacks.onData({ type: 'text-delta', text: 'hel' });
    lastSubscribeArgs!.callbacks.onData({ type: 'text-delta', text: 'lo' });
    lastSubscribeArgs!.callbacks.onData({ type: 'finish' });

    const chunks = await readAllChunks(stream);
    const deltas = chunks.filter((c): c is { type: string; delta: string } =>
      Boolean(c) && (c as { type: string }).type === 'text-delta',
    );
    expect(deltas.map((c) => c.delta)).toEqual(['hel', 'lo']);
  });

  it('forwards reasoning lifecycle', async () => {
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');
    const stream = await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: makeMessages('hi'),
      trigger: 'submit-message',
      metadata: undefined,
    });

    lastSubscribeArgs!.callbacks.onData({ type: 'reasoning-start' });
    lastSubscribeArgs!.callbacks.onData({ type: 'reasoning-delta', text: 'thinking...' });
    lastSubscribeArgs!.callbacks.onData({ type: 'reasoning-end' });
    lastSubscribeArgs!.callbacks.onData({ type: 'text-delta', text: 'answer' });
    lastSubscribeArgs!.callbacks.onData({ type: 'finish' });

    const chunks = (await readAllChunks(stream)) as { type: string }[];
    const types = chunks.map((c) => c.type);
    expect(types).toContain('reasoning-start');
    expect(types).toContain('reasoning-delta');
    expect(types).toContain('reasoning-end');
    // text-end is emitted on finish, before finish itself
    expect(types).toContain('text-end');
    expect(types[types.length - 1]).toBe('finish');
  });

  it('passes the latest model from getModel at send time', async () => {
    let currentModel = 'llama3';
    const transport = createTRPCChatTransport('chat-1', () => currentModel);

    await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: makeMessages('one'),
      trigger: 'submit-message',
      metadata: undefined,
    });
    expect(lastSubscribeArgs!.input.model).toBe('llama3');

    currentModel = 'gemma';
    await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm2',
      abortSignal: new AbortController().signal,
      messages: makeMessages('two'),
      trigger: 'submit-message',
      metadata: undefined,
    });
    expect(lastSubscribeArgs!.input.model).toBe('gemma');
  });

  it('extracts the last user message text to send to the server', async () => {
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');
    await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: [
        { id: 'm0', role: 'user', parts: [{ type: 'text', text: 'old' }] },
        { id: 'a0', role: 'assistant', parts: [{ type: 'text', text: 'reply' }] },
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'newest' }] },
      ],
      trigger: 'submit-message',
      metadata: undefined,
    });

    expect(lastSubscribeArgs!.input.userMessage).toBe('newest');
  });

  it('surfaces errors from onError as an error chunk and closes', async () => {
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');
    const stream = await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: new AbortController().signal,
      messages: makeMessages('hi'),
      trigger: 'submit-message',
      metadata: undefined,
    });

    lastSubscribeArgs!.callbacks.onError?.(new Error('ollama down'));

    const chunks = (await readAllChunks(stream)) as { type: string; errorText?: string }[];
    const errorChunk = chunks.find((c) => c.type === 'error');
    expect(errorChunk?.errorText).toBe('ollama down');
  });

  it('unsubscribes from the tRPC stream when aborted', async () => {
    const abort = new AbortController();
    const transport = createTRPCChatTransport('chat-1', () => 'llama3');
    const stream = await transport.sendMessages({
      chatId: 'chat-1',
      messageId: 'm1',
      abortSignal: abort.signal,
      messages: makeMessages('hi'),
      trigger: 'submit-message',
      metadata: undefined,
    });

    abort.abort();
    expect(unsubscribe).toHaveBeenCalledTimes(1);

    // Reading the now-closed stream should complete without hanging
    const chunks = await readAllChunks(stream);
    // We still get the initial start + text-start chunks
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });
});
