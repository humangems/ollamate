import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { getMessagesByChatId } from '../../lib/messageApi';
import { Message } from '../../lib/types';
import { RootState } from '../store';

const messageAdapter = createEntityAdapter<Message>({
  sortComparer: (a, b) => (a.created_at ?? 0) - (b.created_at ?? 0),
});

export const messageSlice = createSlice({
  name: 'messages',
  initialState: messageAdapter.getInitialState(),
  reducers: {
    newUserMessage: messageAdapter.addOne,
  },
  extraReducers(builder) {
    builder.addCase(getMessagesThunk.fulfilled, (state, action) => {
      messageAdapter.upsertMany(state, action.payload);
    });
  },
});

export const getMessagesThunk = createAsyncThunk<Message[], string>(
  'messages/getMessages',
  async (chatId) => {
    return getMessagesByChatId(chatId);
  }
);

export const messageSelectors = messageAdapter.getSelectors();

export const selectMessagesByChatId = createSelector(
  (state: RootState) => messageSelectors.selectAll(state.messages),
  (_state: RootState, chatId: string) => chatId,
  (messages: Message[], chatId: string) => {
    return messages.filter((m) => m.chat_id === chatId);
  }
);

export const countMessagesByChatId = createSelector(
  (state: RootState) => messageSelectors.selectAll(state.messages),
  (_state: RootState, chatId: string) => chatId,
  (messages: Message[], chatId: string) => {
    return messages.filter((m) => m.chat_id === chatId).length;
  }
);

export const { newUserMessage } = messageSlice.actions;

export default messageSlice.reducer;
