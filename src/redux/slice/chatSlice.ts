import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { getModels } from '../../lib/modelApi';
import { Chat, Model } from '../../lib/types';
import { streamEnd } from './messageSlice';


const chatAdapter = createEntityAdapter<Chat>();

export const chatSlice = createSlice({
  name: 'chats',
  initialState: chatAdapter.getInitialState({
    newChatId: null as string | null,
  }),
  reducers: {
    allModelsLoaded: chatAdapter.setAll,
  },

  extraReducers: (builder) => {
    builder.addCase(streamEnd, (state, action) => {
      let chat:Chat = {
        id: action.payload.chatId,
        updated_at: Date.now(),
      }
      if (action.payload.isNewChat) {
        state.newChatId = action.payload.chatId;
        chat.created_at = Date.now();
      }
      chatAdapter.upsertOne(state, chat);
    });
  }
});

export const getAllModelsThunk = createAsyncThunk<Model[]>(
  'chats/getAllChats',
  async (_payload, thunkAPI) => {
    const response = await getModels();
    thunkAPI.dispatch(allModelsLoaded(response));
    return response;
  }
);


export const chatSelectors = chatAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allModelsLoaded } = chatSlice.actions;

export default chatSlice.reducer;
