import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../lib/messageApi', () => ({
  getMessagesByChatId: vi.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import messageReducer, {
  getMessagesThunk,
  newUserMessage,
  selectMessagesByChatId,
  countMessagesByChatId,
  messageSelectors,
} from './messageSlice';
import * as messageApi from '../../lib/messageApi';
import type { Message } from '../../lib/types';
import type { RootState } from '../store';

function makeStore() {
  return configureStore({ reducer: { messages: messageReducer } });
}

const asRoot = (state: unknown) => state as RootState;

beforeEach(() => {
  vi.mocked(messageApi.getMessagesByChatId).mockReset();
});

describe('messageSlice reducers', () => {
  it('newUserMessage adds a message', () => {
    const store = makeStore();
    const msg: Message = {
      id: 'm1',
      chat_id: 'c1',
      role: 'user',
      content: 'hello',
      created_at: 1,
    };
    store.dispatch(newUserMessage(msg));
    const all = messageSelectors.selectAll(store.getState().messages);
    expect(all).toHaveLength(1);
    expect(all[0].content).toBe('hello');
  });
});

describe('getMessagesThunk', () => {
  it('upserts fetched messages into state', async () => {
    const store = makeStore();
    const msgs: Message[] = [
      { id: 'm1', chat_id: 'c1', role: 'user', content: 'a', created_at: 1 },
      { id: 'm2', chat_id: 'c1', role: 'assistant', content: 'b', created_at: 2 },
    ];
    vi.mocked(messageApi.getMessagesByChatId).mockResolvedValue(msgs);

    await store.dispatch(getMessagesThunk('c1'));

    const all = messageSelectors.selectAll(store.getState().messages);
    expect(all.map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('does not duplicate messages when fetched twice', async () => {
    const store = makeStore();
    const msgs: Message[] = [
      { id: 'm1', chat_id: 'c1', role: 'user', content: 'a', created_at: 1 },
    ];
    vi.mocked(messageApi.getMessagesByChatId).mockResolvedValue(msgs);

    await store.dispatch(getMessagesThunk('c1'));
    await store.dispatch(getMessagesThunk('c1'));

    expect(messageSelectors.selectAll(store.getState().messages)).toHaveLength(1);
  });
});

describe('selectors', () => {
  it('selectMessagesByChatId filters by chat', async () => {
    const store = makeStore();
    const msgs: Message[] = [
      { id: 'm1', chat_id: 'c1', role: 'user', content: 'a', created_at: 1 },
      { id: 'm2', chat_id: 'c2', role: 'user', content: 'b', created_at: 2 },
      { id: 'm3', chat_id: 'c1', role: 'assistant', content: 'c', created_at: 3 },
    ];
    vi.mocked(messageApi.getMessagesByChatId).mockResolvedValue(msgs);
    await store.dispatch(getMessagesThunk('c1'));

    const c1 = selectMessagesByChatId(asRoot(store.getState()), 'c1');
    expect(c1.map((m) => m.id)).toEqual(['m1', 'm3']);

    const c2 = selectMessagesByChatId(asRoot(store.getState()), 'c2');
    expect(c2.map((m) => m.id)).toEqual(['m2']);
  });

  it('messages are returned ordered by created_at ascending', async () => {
    const store = makeStore();
    const msgs: Message[] = [
      { id: 'm3', chat_id: 'c1', role: 'user', content: 'third', created_at: 30 },
      { id: 'm1', chat_id: 'c1', role: 'user', content: 'first', created_at: 10 },
      { id: 'm2', chat_id: 'c1', role: 'user', content: 'second', created_at: 20 },
    ];
    vi.mocked(messageApi.getMessagesByChatId).mockResolvedValue(msgs);
    await store.dispatch(getMessagesThunk('c1'));

    const rows = selectMessagesByChatId(asRoot(store.getState()), 'c1');
    expect(rows.map((m) => m.content)).toEqual(['first', 'second', 'third']);
  });

  it('countMessagesByChatId returns the scoped count', async () => {
    const store = makeStore();
    const msgs: Message[] = [
      { id: 'a', chat_id: 'c1', role: 'user', content: '', created_at: 1 },
      { id: 'b', chat_id: 'c1', role: 'user', content: '', created_at: 2 },
      { id: 'c', chat_id: 'c2', role: 'user', content: '', created_at: 3 },
    ];
    vi.mocked(messageApi.getMessagesByChatId).mockResolvedValue(msgs);
    await store.dispatch(getMessagesThunk('c1'));

    expect(countMessagesByChatId(asRoot(store.getState()), 'c1')).toBe(2);
    expect(countMessagesByChatId(asRoot(store.getState()), 'c2')).toBe(1);
    expect(countMessagesByChatId(asRoot(store.getState()), 'missing')).toBe(0);
  });
});
