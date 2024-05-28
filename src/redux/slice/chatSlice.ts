import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import ollama from 'ollama/browser';
import { getAllChats, updateChatTitle, upsertChat } from '../../lib/chatApi';
import { Chat, Model } from '../../lib/types';
import { streamEnd } from './messageSlice';


const chatAdapter = createEntityAdapter<Chat>({
  sortComparer: (a, b) => b.created_at! - a.created_at!,
});

export const chatSlice = createSlice({
  name: 'chats',
  initialState: chatAdapter.getInitialState({
    newChatId: null as string | null,
  }),
  reducers: {
    allChatsLoaded: chatAdapter.setAll,
  },

  extraReducers: (builder) => {
    builder
      .addCase(streamEnd, (state, action) => {
        let chat: Chat = {
          id: action.payload.chatId,
          model: action.payload.model,
        };
        if (action.payload.isNewChat) {
          state.newChatId = action.payload.chatId;
          chat.created_at = action.payload.chatCreatedAt;
        }
        chatAdapter.upsertOne(state, chat);
      })
      .addCase(generateTitleThunk.fulfilled, (state, action: PayloadAction<GeneratedTitle>) => {
        state.entities[action.payload.chatId].title = action.payload.title;
      });
  }
});

export const getAllChatsThunk = createAsyncThunk<Model[]>(
  'chats/getAllChats',
  async (_payload, thunkAPI) => {
    const response = await getAllChats();
    thunkAPI.dispatch(allChatsLoaded(response));
    return response;
  }
);

type SimpleChatMessage = {
  role: string;
  content: string;
}

type GenerateTitlePayload = {
  chatId: string;
  model: string;
  messages: SimpleChatMessage[]
}

type GeneratedTitle = {
  chatId: string;
  title: string;
}

export const generateTitleThunk = createAsyncThunk<GeneratedTitle, GenerateTitlePayload>(
  'chats/generateTitle',
  async (payload, _thunkAPI) => {

    const instruction = {
      role: "user",
      content: "Generate a title for the conversation, no more than 15 words. return just the title, no quotes."
    }

    const response = await ollama.chat({
      model: payload.model,
      messages: [...payload.messages, instruction],
      stream: false,
    });

    await updateChatTitle(payload.chatId, response.message.content);

    return {
      chatId: payload.chatId,
      title: response.message.content
    }
  }
);


export const chatSelectors = chatAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allChatsLoaded } = chatSlice.actions;

export default chatSlice.reducer;
