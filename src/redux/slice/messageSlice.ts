import {
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';
import { Chat, Message } from '../../lib/types';
import ollama from 'ollama/browser';
import { RootState } from '../store';
import { upsertChat } from '../../lib/chatApi';

const messageAdapter = createEntityAdapter<Message>();

type NewUserMessageType = {
  chatId: string;
  content: string;
};

type StreamEventType = {
  chatId: string;
  messageId: string;
  isNewChat: boolean;
  model: string;
  chatCreatedAt?: number;
};

type InitialState = {
  isStreaming: Record<string, boolean>;
};

const initialState:InitialState = {
  isStreaming: {},
};

export const messageSlice = createSlice({
  name: 'messages',
  initialState: messageAdapter.getInitialState(initialState),
  reducers: {
    allModelsLoaded: messageAdapter.setAll,

    newUserMessage: (state, action: PayloadAction<NewUserMessageType>) => {
      messageAdapter.addOne(state, {
        id: nanoid(),
        chat_id: action.payload.chatId,
        role: 'user',
        content: action.payload.content,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    },

    streamStart: (state, action: PayloadAction<StreamEventType>) => {
      messageAdapter.addOne(state, {
        id: action.payload.messageId,
        chat_id: action.payload.chatId,
        role: 'assistant',
        content: '',
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      state.isStreaming[action.payload.messageId] = true;
    },

    streaming: (state, action: PayloadAction<Message>) => {
      state.entities[action.payload.id].content += action.payload.content;
      state.entities[action.payload.id].eval_count = action.payload.eval_count;
      state.entities[action.payload.id].eval_duration = action.payload.eval_duration;
      state.entities[action.payload.id].updated_at = Date.now();
    },

    streamEnd: (state, action: PayloadAction<StreamEventType>) => {
      state.isStreaming[action.payload.messageId] = false;
    },
  },
});

export type NewMessagePayloadType = {
  chatId: string;
  content: string;
  model: string;
  isNewChat: boolean;
};

export const llmChatThunk = createAsyncThunk<void, NewMessagePayloadType>(
  'messages/llmChat',
  async (payload, thunkAPI) => {
    const messageId = nanoid();
    const systemMsg = { role: 'system', content: 'You are a helpful assistant.' };
    thunkAPI.dispatch(newUserMessage({ chatId: payload.chatId, content: payload.content }));

    const state = thunkAPI.getState() as RootState;
    const history = Object.values(state.messages.entities)
      .filter((m) => m.chat_id === payload.chatId)
      .map((m) => {
        return {
          role: m.role,
          content: m.content,
        };
      });

    thunkAPI.dispatch(
      streamStart({
        chatId: payload.chatId,
        messageId,
        isNewChat: payload.isNewChat,
        model: payload.model,
      })
    );

    const response = await ollama.chat({
      model: payload.model,
      messages: [systemMsg, ...history],
      stream: true,
    });

    for await (const part of response) {
      thunkAPI.dispatch(
        streaming({
          id: messageId,
          chat_id: payload.chatId,
          role: part.message.role,
          content: part.message.content,
          eval_count: part.eval_count,
          eval_duration: part.eval_duration,
          done: part.done,
        })
      );
    }
    const chat: Chat = {
      id: payload.chatId,
      model: payload.model,
    };
    if (payload.isNewChat) {
      chat.created_at = Date.now();
    }
    await upsertChat(chat);
    thunkAPI.dispatch(
      streamEnd({ chatId: payload.chatId, messageId, isNewChat: payload.isNewChat, model: payload.model, chatCreatedAt: chat.created_at })
    );
  }
);

export const messageSelectors = messageAdapter.getSelectors();

export const selectMessagesByChatId = createSelector(
  (state: RootState) => messageSelectors.selectAll(state.messages),
  (_state, chatId: string) => chatId,
  (messages, chatId) => {
    return messages.filter((m: Message) => m.chat_id === chatId);
  }
);

// Action creators are generated for each case reducer function
export const { allModelsLoaded, streaming, streamStart, streamEnd, newUserMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
