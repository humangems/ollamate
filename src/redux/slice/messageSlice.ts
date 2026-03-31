import { streamText } from 'ai';
import {
  PayloadAction,
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';
import { upsertChat } from '../../lib/chatApi';
import { DEFAULT_SYSTEM_PROMPT, toModelMessages } from '../../lib/aiSdk';
import { addMessage, getMessagesByChatId } from '../../lib/messageApi';
import { getOllamaProvider } from '../../lib/ollamaApi';
import { Chat, Message } from '../../lib/types';
import { RootState } from '../store';

const messageAdapter = createEntityAdapter<Message>({
  sortComparer: (a, b) => a.created_at! - b.created_at!,
});

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

    newUserMessage: messageAdapter.addOne,

    streamStart: (state, action: PayloadAction<StreamEventType>) => {
      messageAdapter.addOne(state, {
        id: action.payload.messageId,
        chat_id: action.payload.chatId,
        role: 'assistant',
        model: action.payload.model,
        content: '',
        created_at: Date.now(),
        updated_at: Date.now(),
      });
      state.isStreaming[action.payload.messageId] = true;
    },

    streaming: (state, action: PayloadAction<Message>) => {
      const message = state.entities[action.payload.id];

      if (!message) return;

      message.content += action.payload.content;
      message.eval_count = action.payload.eval_count;
      message.eval_duration = action.payload.eval_duration;
      message.updated_at = Date.now();
    },

    streamEnd: (state, action: PayloadAction<StreamEventType>) => {
      state.isStreaming[action.payload.messageId] = false;
    },

    streamAbort: (state, action: PayloadAction<{ messageId: string }>) => {
      state.isStreaming[action.payload.messageId] = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(getMessagesThunk.fulfilled, (state, action) => {
      messageAdapter.upsertMany(state, action.payload);
    });
  },
});

export type NewMessagePayloadType = {
  chatId: string;
  content: string;
  model: string;
  images?: string[];
  isNewChat: boolean;
};

export const getMessagesThunk = createAsyncThunk<Message[], string>(
  'messages/getMessages',
  async(payload, _thunkAPI) => {
    const messages = await getMessagesByChatId(payload)
    return messages;
  }
)

export const llmChatThunk = createAsyncThunk<void, NewMessagePayloadType>(
  'messages/llmChat',
  async (payload, thunkAPI) => {
    const userMessage: Message = {
      chat_id: payload.chatId,
      role: 'user',
      content: payload.content,
      images: payload.images,
      id: nanoid(),
    };

    const server = await addMessage(userMessage);

    thunkAPI.dispatch(newUserMessage(server));

    const state = thunkAPI.getState() as RootState;
    const history = Object.values(state.messages.entities)
      .filter((message): message is Message => Boolean(message) && message.chat_id === payload.chatId);

    const messageId = nanoid();

    thunkAPI.dispatch(
      streamStart({
        chatId: payload.chatId,
        messageId,
        isNewChat: payload.isNewChat,
        model: payload.model,
      })
    );

    let content = '';

    try {
      const ollamaProvider = await getOllamaProvider();
      const result = streamText({
        model: ollamaProvider(payload.model),
        system: DEFAULT_SYSTEM_PROMPT,
        messages: toModelMessages(history),
      });

      for await (const part of result.fullStream) {
        if (part.type === 'reasoning-start') {
          content += '<think>\n';
          thunkAPI.dispatch(
            streaming({
              id: messageId,
              chat_id: payload.chatId,
              role: 'assistant',
              content: '<think>\n',
              model: payload.model,
            })
          );
          continue;
        }

        if (part.type === 'reasoning-end') {
          content += '\n</think>\n\n';
          thunkAPI.dispatch(
            streaming({
              id: messageId,
              chat_id: payload.chatId,
              role: 'assistant',
              content: '\n</think>\n\n',
              model: payload.model,
            })
          );
          continue;
        }

        if (part.type === 'text-delta' || part.type === 'reasoning-delta') {
          content += part.text;
          thunkAPI.dispatch(
            streaming({
              id: messageId,
              chat_id: payload.chatId,
              role: 'assistant',
              content: part.text,
              model: payload.model,
            })
          );
          continue;
        }

        if (part.type === 'error') {
          throw (part.error instanceof Error ? part.error : new Error(String(part.error)));
        }
      }

      const totalUsage = await result.totalUsage;

      const chat: Chat = {
        id: payload.chatId,
        model: payload.model,
      };
      if (payload.isNewChat) {
        chat.created_at = Date.now();
      }
      await upsertChat(chat);

      const newMsg: Message = {
        id: messageId,
        chat_id: payload.chatId,
        content,
        role: 'assistant',
        model: payload.model,
        eval_count: totalUsage.outputTokens ?? undefined,
      };

      await addMessage(newMsg);

      thunkAPI.dispatch(
        streamEnd({
          chatId: payload.chatId,
          messageId,
          isNewChat: payload.isNewChat,
          model: payload.model,
          chatCreatedAt: chat.created_at,
        })
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      thunkAPI.dispatch(streamAbort({ messageId }));
      alert(`Error occurred while chatting with the model: ${payload.model}\n\n${message}`);
    }
  }
);

export const messageSelectors = messageAdapter.getSelectors();

export const selectMessagesByChatId = createSelector(
  (state: RootState) => messageSelectors.selectAll(state.messages),
  (_state, chatId: string) => chatId,
  (messages: Message[], chatId) => {
    return messages.filter((m: Message) => m.chat_id === chatId);
  }
);

export const countMessagesByChatId = createSelector(
  (state: RootState) => messageSelectors.selectAll(state.messages),
  (_state, chatId: string) => chatId,
  (messages: Message[], chatId) => {
    return messages.filter((m: Message) => m.chat_id === chatId).length;
  }
);

// Action creators are generated for each case reducer function
export const { allModelsLoaded, streaming, streamStart, streamEnd, streamAbort, newUserMessage } =
  messageSlice.actions;

export default messageSlice.reducer;
