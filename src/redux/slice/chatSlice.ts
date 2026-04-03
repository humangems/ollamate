import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { deleteChat, generateChatTitle, getAllChats, updateChatModel, updateChatTitle } from '../../lib/chatApi';
import { Chat } from '../../lib/types';

const chatAdapter = createEntityAdapter<Chat>({
  sortComparer: (a, b) => (b.created_at ?? 0) - (a.created_at ?? 0),
});

export const chatSlice = createSlice({
  name: 'chats',
  initialState: chatAdapter.getInitialState(),
  reducers: {
    allChatsLoaded: chatAdapter.setAll,
    chatRemoved: chatAdapter.removeOne,
    chatUpdated: chatAdapter.updateOne,
    chatUpserted: chatAdapter.upsertOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(generateTitleThunk.fulfilled, (state, action: PayloadAction<GeneratedTitle>) => {
        const entity = state.entities[action.payload.chatId];
        if (entity) entity.title = action.payload.title;
      })
      .addCase(updateModelThunk.fulfilled, (state, action: PayloadAction<Chat>) => {
        const entity = state.entities[action.payload.id];
        if (entity) entity.model = action.payload.model;
      });
  }
});

export const getAllChatsThunk = createAsyncThunk<Chat[]>(
  'chats/getAllChats',
  async (_payload, thunkAPI) => {
    const response = await getAllChats();
    thunkAPI.dispatch(allChatsLoaded(response));
    return response;
  }
);

export const deleteChatThunk = createAsyncThunk<void, string>(
  'chats/deleteChat',
  async (chatId, thunkAPI) => {
    await deleteChat(chatId);
    thunkAPI.dispatch(chatRemoved(chatId));
  }
);

type UpdateChatTitlePayload = {
  chatId: string;
  title: string;
};

export const updateChatTitleThunk = createAsyncThunk<void, UpdateChatTitlePayload>(
  'chats/updateChatTitle',
  async (payload, thunkAPI) => {
    await updateChatTitle(payload.chatId, payload.title);
    thunkAPI.dispatch(chatUpdated({ id: payload.chatId, changes: { title: payload.title } }));
  }
);

type SimpleChatMessage = {
  role: string;
  content: string;
};

type GenerateTitlePayload = {
  chatId: string;
  model: string;
  messages: SimpleChatMessage[];
};

type GeneratedTitle = {
  chatId: string;
  title: string;
};

export const generateTitleThunk = createAsyncThunk<GeneratedTitle, GenerateTitlePayload>(
  'chats/generateTitle',
  async (payload, _thunkAPI) => {
    return generateChatTitle(payload.chatId, payload.model, payload.messages);
  }
);

type UpdateModelPayload = {
  chatId: string;
  model: string;
};

export const updateModelThunk = createAsyncThunk<Chat, UpdateModelPayload>(
  'chats/updateModel',
  async (payload, _thunkAPI) => {
    const chat = await updateChatModel(payload.chatId, payload.model);
    return chat;
  }
);

export const chatSelectors = chatAdapter.getSelectors();

export const { allChatsLoaded, chatRemoved, chatUpdated, chatUpserted } = chatSlice.actions;

export default chatSlice.reducer;
