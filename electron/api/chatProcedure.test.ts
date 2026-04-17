import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'node:path';
import { DatabaseService } from '../db/service';

const MIGRATIONS = path.resolve(__dirname, '../../drizzle');

// Shared DB instance across mocks, recreated per test via resetDb().
let testDb: DatabaseService;
function resetDb() {
  testDb = new DatabaseService(':memory:', MIGRATIONS);
}

// Mock the singleton so the procedure uses our in-memory DB.
vi.mock('../db/singleton', () => ({
  get dbService() {
    return testDb;
  },
}));

// Mock electron-store-backed settings.
vi.mock('../setting-store', () => ({
  settingStore: {
    get: (key: string) => {
      if (key === 'ollamaServer') return { custom: false, url: 'http://mock' };
      return undefined;
    },
  },
}));

// Mock the Ollama provider factory.
vi.mock('ai-sdk-ollama', () => ({
  createOllama: () => (model: string) => ({ __model: model }),
}));

// Mock the AI SDK. The procedure uses `streamText({...}).fullStream` and
// `generateText({...}).text`.
type Chunk =
  | { type: 'text-delta'; text: string }
  | { type: 'reasoning-start' }
  | { type: 'reasoning-delta'; text: string }
  | { type: 'reasoning-end' }
  | { type: 'error'; error: unknown };

let nextStreamChunks: Chunk[] = [];
let nextStreamThrows: Error | null = null;
let nextStreamUsage: { inputTokens?: number; outputTokens?: number } = {
  inputTokens: 10,
  outputTokens: 20,
};
let nextTitle = 'Generated Title';

vi.mock('ai', () => ({
  streamText: () => {
    if (nextStreamThrows) {
      throw nextStreamThrows;
    }
    return {
      fullStream: (async function* () {
        for (const chunk of nextStreamChunks) {
          yield chunk;
        }
      })(),
      usage: Promise.resolve(nextStreamUsage),
    };
  },
  generateText: async () => ({ text: nextTitle }),
}));

import { appRouter } from './index';

beforeEach(() => {
  resetDb();
  nextStreamChunks = [];
  nextStreamThrows = null;
  nextStreamUsage = { inputTokens: 10, outputTokens: 20 };
  nextTitle = 'Generated Title';
});

function caller() {
  return appRouter.createCaller({});
}

async function collect<T>(iter: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = [];
  for await (const v of iter) out.push(v);
  return out;
}

describe('chatProcedure basic queries and mutations', () => {
  it('chatList returns empty for a fresh db', async () => {
    expect(await caller().chat.chatList()).toEqual([]);
  });

  it('createChat persists a chat and chatList returns it', async () => {
    await caller().chat.createChat({ id: 'c1', model: 'llama3', title: 'hi' });
    const chats = await caller().chat.chatList();
    expect(chats).toHaveLength(1);
    expect(chats[0].id).toBe('c1');
    expect(chats[0].title).toBe('hi');
  });

  it('updateChat modifies an existing chat', async () => {
    await caller().chat.createChat({ id: 'c1', model: 'llama3' });
    await caller().chat.updateChat({ id: 'c1', title: 'renamed' });
    const chats = await caller().chat.chatList();
    expect(chats[0].title).toBe('renamed');
  });

  it('deleteChat removes the chat', async () => {
    await caller().chat.createChat({ id: 'c1', model: 'llama3' });
    await caller().chat.deleteChat({ id: 'c1' });
    expect(await caller().chat.chatList()).toEqual([]);
  });

  it('chatMessages returns messages for a chat id', async () => {
    await caller().chat.createChat({ id: 'c1', model: 'llama3' });
    await caller().chat.addMessage({
      id: 'm1',
      chat_id: 'c1',
      role: 'user',
      content: 'hi',
      created_at: 1,
    });
    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toBe('hi');
  });
});

describe('chatProcedure.generateTitle', () => {
  it('persists the trimmed title on the chat and returns it', async () => {
    await caller().chat.createChat({ id: 'c1', model: 'llama3' });
    nextTitle = '  My Title  \n';

    const result = await caller().chat.generateTitle({
      chatId: 'c1',
      model: 'llama3',
      messages: [{ role: 'user', content: 'hello' }],
    });

    expect(result.title).toBe('My Title');
    const chats = await caller().chat.chatList();
    expect(chats[0].title).toBe('My Title');
  });
});

describe('chatProcedure.stream happy path', () => {
  it('persists user + assistant messages and emits finish', async () => {
    nextStreamChunks = [
      { type: 'text-delta', text: 'Hel' },
      { type: 'text-delta', text: 'lo' },
    ];

    const sub = await caller().chat.stream({
      chatId: 'c1',
      model: 'llama3',
      userMessage: 'hi there',
    });
    const chunks = await collect(sub);

    expect(chunks.map((c) => c.type)).toEqual(['text-delta', 'text-delta', 'finish']);
    const finish = chunks.find((c) => c.type === 'finish');
    expect(finish).toMatchObject({
      finishReason: 'stop',
      usage: { inputTokens: 10, outputTokens: 20 },
    });

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toMatchObject({ role: 'user', content: 'hi there' });
    expect(msgs[1]).toMatchObject({ role: 'assistant', content: 'Hello', eval_count: 20 });
  });

  it('wraps reasoning with <think> tags in the persisted assistant row', async () => {
    nextStreamChunks = [
      { type: 'reasoning-start' },
      { type: 'reasoning-delta', text: 'pondering' },
      { type: 'reasoning-end' },
      { type: 'text-delta', text: 'the answer' },
    ];

    const sub = await caller().chat.stream({
      chatId: 'c1',
      model: 'llama3',
      userMessage: 'q',
    });
    await collect(sub);

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    const assistant = msgs.find((m) => m.role === 'assistant');
    expect(assistant?.content).toBe('<think>pondering</think>the answer');
  });

  it('creates the chat row if it does not already exist', async () => {
    nextStreamChunks = [{ type: 'text-delta', text: 'ok' }];

    await collect(
      await caller().chat.stream({
        chatId: 'new-chat',
        model: 'llama3',
        userMessage: 'hi',
      }),
    );

    const chats = await caller().chat.chatList();
    expect(chats.map((c) => c.id)).toContain('new-chat');
  });

  it('includes prior chat history as context when streaming', async () => {
    // Seed the DB with an earlier turn
    await caller().chat.createChat({ id: 'c1', model: 'llama3' });
    await caller().chat.addMessage({
      id: 'u0',
      chat_id: 'c1',
      role: 'user',
      content: 'first',
      created_at: 1,
    });
    await caller().chat.addMessage({
      id: 'a0',
      chat_id: 'c1',
      role: 'assistant',
      content: 'reply',
      created_at: 2,
    });

    nextStreamChunks = [{ type: 'text-delta', text: 'ok' }];

    await collect(
      await caller().chat.stream({
        chatId: 'c1',
        model: 'llama3',
        userMessage: 'second',
      }),
    );

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant', 'user', 'assistant']);
    expect(msgs[2].content).toBe('second');
  });
});

describe('chatProcedure.stream abort/error safety', () => {
  it('persists the partial assistant response when the stream errors mid-flight', async () => {
    nextStreamChunks = [
      { type: 'text-delta', text: 'partial' },
      { type: 'error', error: new Error('ollama crashed') },
    ];

    const sub = await caller().chat.stream({
      chatId: 'c1',
      model: 'llama3',
      userMessage: 'hi',
    });

    await expect(collect(sub)).rejects.toThrow('ollama crashed');

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant']);
    const assistant = msgs[1];
    expect(assistant.content).toBe('partial');
  });

  it('persists an empty assistant row when stream setup fails so user row is not orphaned', async () => {
    nextStreamThrows = new Error('connect ECONNREFUSED');

    const sub = await caller().chat.stream({
      chatId: 'c1',
      model: 'llama3',
      userMessage: 'hi',
    });

    await expect(collect(sub)).rejects.toThrow('connect ECONNREFUSED');

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    expect(msgs.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(msgs[1].content).toBe('');
  });

  it('persists partial reasoning even without any text output', async () => {
    nextStreamChunks = [
      { type: 'reasoning-start' },
      { type: 'reasoning-delta', text: 'halfway' },
      { type: 'error', error: new Error('boom') },
    ];

    const sub = await caller().chat.stream({
      chatId: 'c1',
      model: 'llama3',
      userMessage: 'hi',
    });
    await expect(collect(sub)).rejects.toThrow('boom');

    const msgs = await caller().chat.chatMessages({ chatId: 'c1' });
    const assistant = msgs.find((m) => m.role === 'assistant');
    expect(assistant?.content).toBe('<think>halfway</think>');
  });
});
