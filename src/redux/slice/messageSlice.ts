import {
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';
import { Message } from '../../lib/types';
import ollama from 'ollama/browser';
import { RootState } from '../store';
import { m } from 'framer-motion';

const messageAdapter = createEntityAdapter<Message>();

type StartStreamingType = {
  chatId: string;
  messageId: string;
}

type NewUserMessageType = {
  chatId: string;
  content: string;
}

export const messageSlice = createSlice({
  name: 'messages',
  initialState: messageAdapter.getInitialState(),
  reducers: {
    allModelsLoaded: messageAdapter.setAll,
    streamMessage: (state, action: PayloadAction<Message>) => {
      state.entities[action.payload.id].content += action.payload.content;
      state.entities[action.payload.id].eval_count = action.payload.eval_count;
      state.entities[action.payload.id].eval_duration = action.payload.eval_duration;
      state.entities[action.payload.id].updated_at = Date.now();

    },

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

    startStreaming: (state, action: PayloadAction<StartStreamingType>) => {
      messageAdapter.addOne(state, {
        id: action.payload.messageId,
        chat_id: action.payload.chatId,
        role: 'assistant',
        content: '',
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    },
  },
});

export type NewMessagePayloadType = {
  chat_id: string;
  content: string;
};

export const newMessageThunk = createAsyncThunk<void, NewMessagePayloadType>(
  'messages/new',
  async (payload, thunkAPI) => {
    const messageId = nanoid();
    const message = { role: 'user', content: payload.content };
    const state = thunkAPI.getState() as RootState;
    const history = Object.values(state.messages.entities).filter((m) => m.chat_id === payload.chat_id).map((m) => {
      return {
        role: m.role,
        content: m.content,
      }
    });

    const response = await ollama.chat({
      model: 'yi:34b-chat',
      messages: [...history, message],
      stream: true,
    });

    thunkAPI.dispatch(newUserMessage({ chatId: payload.chat_id, content: payload.content }));

    thunkAPI.dispatch(startStreaming({ chatId: payload.chat_id, messageId}));

    for await (const part of response) {
      // process.stdout.write(part.message.content);
      thunkAPI.dispatch(
        streamMessage({
          id: messageId,
          chat_id: messageId,
          role: part.message.role,
          content: part.message.content,
          eval_count: part.eval_count,
          eval_duration: part.eval_duration,
          done: part.done,
        })
      );
    }


  }
);

export const messageSelectors = messageAdapter.getSelectors();

export const selectMessagesByChatId = (state: RootState, chat_id: string) => {
  return messageSelectors.selectAll(state.messages).filter((m) => m.chat_id === chat_id);
}

// Action creators are generated for each case reducer function
export const { allModelsLoaded, streamMessage, startStreaming, newUserMessage } = messageSlice.actions;

export default messageSlice.reducer;
