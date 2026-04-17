import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/chatApi', () => ({
  getAllChats: vi.fn(),
  deleteChat: vi.fn(),
  updateChatTitle: vi.fn(),
  updateChatModel: vi.fn(),
  generateChatTitle: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import chatReducer, {
  chatSelectors,
  chatUpserted,
  chatRemoved,
  chatUpdated,
  allChatsLoaded,
  generateTitleThunk,
  updateModelThunk,
  getAllChatsThunk,
  deleteChatThunk,
  updateChatTitleThunk,
} from './chatSlice';
import * as chatApi from '../../lib/chatApi';
import type { Chat } from '../../lib/types';

function makeStore() {
  return configureStore({ reducer: { chats: chatReducer } });
}

beforeEach(() => {
  vi.mocked(chatApi.getAllChats).mockReset();
  vi.mocked(chatApi.deleteChat).mockReset();
  vi.mocked(chatApi.updateChatTitle).mockReset();
  vi.mocked(chatApi.updateChatModel).mockReset();
  vi.mocked(chatApi.generateChatTitle).mockReset();
});

describe('chatSlice reducers', () => {
  it('allChatsLoaded replaces entities', () => {
    const store = makeStore();
    const chats: Chat[] = [
      { id: 'a', model: 'm', created_at: 1 },
      { id: 'b', model: 'm', created_at: 2 },
    ];
    store.dispatch(allChatsLoaded(chats));
    const all = chatSelectors.selectAll(store.getState().chats);
    // sorted by created_at desc
    expect(all.map((c) => c.id)).toEqual(['b', 'a']);
  });

  it('chatUpserted adds a new chat', () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'x', model: 'llama3', created_at: 10 }));
    expect(chatSelectors.selectById(store.getState().chats, 'x')?.model).toBe('llama3');
  });

  it('chatUpserted updates an existing chat', () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'x', model: 'llama3' }));
    store.dispatch(chatUpserted({ id: 'x', model: 'mistral' }));
    expect(chatSelectors.selectById(store.getState().chats, 'x')?.model).toBe('mistral');
  });

  it('chatRemoved drops the chat', () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'x', model: 'llama3' }));
    store.dispatch(chatRemoved('x'));
    expect(chatSelectors.selectById(store.getState().chats, 'x')).toBeUndefined();
  });

  it('chatUpdated applies a partial update', () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'x', model: 'llama3' }));
    store.dispatch(chatUpdated({ id: 'x', changes: { title: 'renamed' } }));
    const chat = chatSelectors.selectById(store.getState().chats, 'x');
    expect(chat?.title).toBe('renamed');
    expect(chat?.model).toBe('llama3');
  });
});

describe('generateTitleThunk', () => {
  it('writes title onto the existing chat entity on fulfilled', async () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'c1', model: 'llama3' }));
    vi.mocked(chatApi.generateChatTitle).mockResolvedValue({
      chatId: 'c1',
      title: 'Generated Title',
    });

    await store.dispatch(
      generateTitleThunk({ chatId: 'c1', model: 'llama3', messages: [] }),
    );

    const chat = chatSelectors.selectById(store.getState().chats, 'c1');
    expect(chat?.title).toBe('Generated Title');
  });

  it('is a no-op when the chat is not in the store', async () => {
    const store = makeStore();
    vi.mocked(chatApi.generateChatTitle).mockResolvedValue({
      chatId: 'missing',
      title: 'oops',
    });

    await store.dispatch(
      generateTitleThunk({ chatId: 'missing', model: 'llama3', messages: [] }),
    );

    expect(chatSelectors.selectAll(store.getState().chats)).toEqual([]);
  });
});

describe('updateModelThunk', () => {
  it('updates the model on the existing chat entity on fulfilled', async () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'c1', model: 'llama3', title: 'keep' }));
    vi.mocked(chatApi.updateChatModel).mockResolvedValue({
      id: 'c1',
      model: 'gemma',
      title: 'keep',
    });

    await store.dispatch(updateModelThunk({ chatId: 'c1', model: 'gemma' }));

    const chat = chatSelectors.selectById(store.getState().chats, 'c1');
    expect(chat?.model).toBe('gemma');
    expect(chat?.title).toBe('keep');
  });
});

describe('getAllChatsThunk', () => {
  it('dispatches allChatsLoaded with the fetched chats', async () => {
    const store = makeStore();
    const chats: Chat[] = [
      { id: 'a', model: 'm', created_at: 1 },
      { id: 'b', model: 'm', created_at: 2 },
    ];
    vi.mocked(chatApi.getAllChats).mockResolvedValue(chats);

    await store.dispatch(getAllChatsThunk());

    expect(chatSelectors.selectAll(store.getState().chats).map((c) => c.id)).toEqual([
      'b',
      'a',
    ]);
  });
});

describe('deleteChatThunk', () => {
  it('removes the chat on success', async () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'c1', model: 'm' }));
    vi.mocked(chatApi.deleteChat).mockResolvedValue();

    await store.dispatch(deleteChatThunk('c1'));

    expect(chatSelectors.selectById(store.getState().chats, 'c1')).toBeUndefined();
  });
});

describe('updateChatTitleThunk', () => {
  it('updates the title in-place after the API succeeds', async () => {
    const store = makeStore();
    store.dispatch(chatUpserted({ id: 'c1', model: 'm', title: 'old' }));
    vi.mocked(chatApi.updateChatTitle).mockResolvedValue({
      id: 'c1',
      model: 'm',
      title: 'new',
    });

    await store.dispatch(updateChatTitleThunk({ chatId: 'c1', title: 'new' }));

    const chat = chatSelectors.selectById(store.getState().chats, 'c1');
    expect(chat?.title).toBe('new');
  });
});
