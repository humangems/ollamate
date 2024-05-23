import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { getAllChats } from '../../lib/chatApi';
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
    builder.addCase(streamEnd, (state, action) => {
      let chat:Chat = {
        id: action.payload.chatId,
        model: action.payload.model,
      }
      if (action.payload.isNewChat) {
        state.newChatId = action.payload.chatId;
        chat.created_at = action.payload.chatCreatedAt;
      }
      chatAdapter.upsertOne(state, chat);
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


export const chatSelectors = chatAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allChatsLoaded } = chatSlice.actions;

export default chatSlice.reducer;
