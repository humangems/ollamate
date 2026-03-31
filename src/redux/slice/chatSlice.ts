import { generateText } from 'ai';
import { PayloadAction, createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { deleteChat, getAllChats, updateChatModel, updateChatTitle } from '../../lib/chatApi';
import { getOllamaProvider } from '../../lib/ollamaApi';
import { toModelMessages } from '../../lib/aiSdk';
import { Chat, Model } from '../../lib/types';
import { llmChatThunk, streamEnd } from './messageSlice';

type InitialState = {
  newChatId: string | null;
  isStreaming: Record<string, boolean>;
};

const initialState : InitialState = {
  newChatId: null,
  isStreaming: {},
}

const chatAdapter = createEntityAdapter<Chat>({
  sortComparer: (a, b) => b.created_at! - a.created_at!,
});

export const chatSlice = createSlice({
  name: 'chats',
  initialState: chatAdapter.getInitialState(initialState),
  reducers: {
    allChatsLoaded: chatAdapter.setAll,
    chatRemoved: chatAdapter.removeOne,
    chatUpdated: chatAdapter.updateOne,
  },

  extraReducers: (builder) => {
    builder
      .addCase(streamEnd, (state, action) => {
        const chat: Chat = {
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
      })
      .addCase(updateModelThunk.fulfilled, (state, action: PayloadAction<Chat>) => {
        state.entities[action.payload.id].model = action.payload.model;
      })
      .addCase(llmChatThunk.pending, (state, action) => {
        state.isStreaming[action.meta.arg.chatId] = true;
      }).addCase(llmChatThunk.fulfilled, (state, action) => {
        state.isStreaming[action.meta.arg.chatId] = false;
      }).addCase(llmChatThunk.rejected, (state, action) => {
        state.isStreaming[action.meta.arg.chatId] = false;
      })
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
}

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
      role: 'user',
      content:
        'Generate a title for the conversation, no more than 6 words. return just the title, no quotes. The generated title language should be exactly same as the conversation language.',
    };

    const ollamaProvider = await getOllamaProvider();

    const { text } = await generateText({
      model: ollamaProvider(payload.model),
      messages: toModelMessages([...payload.messages, instruction]),
    });

    const title = text.trim();

    await updateChatTitle(payload.chatId, title);

    return {
      chatId: payload.chatId,
      title,
    };
  }
);

type UpdateModelPayload = {
  chatId: string;
  model: string;
}

export const updateModelThunk = createAsyncThunk<Chat, UpdateModelPayload>(
  'chats/updateModel',
  async (payload, _thunkAPI) => {

    const chat = await updateChatModel(payload.chatId, payload.model);
    return chat;
  }
);


export const chatSelectors = chatAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allChatsLoaded, chatRemoved, chatUpdated } = chatSlice.actions;

export default chatSlice.reducer;
