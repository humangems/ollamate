import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { getModels } from '../../lib/modelApi';
import { Chat, Model } from '../../lib/types';


const chatAdapter = createEntityAdapter<Chat>();

export const chatSlice = createSlice({
  name: 'chats',
  initialState: chatAdapter.getInitialState(),
  reducers: {
    allModelsLoaded: chatAdapter.setAll,
  },
});

export const getAllModelsThunk = createAsyncThunk<Model[]>(
  'chats/getAllChats',
  async (_payload, thunkAPI) => {
    const response = await getModels();
    thunkAPI.dispatch(allModelsLoaded(response));
    return response;
  }
);


export const modelSelectors = chatAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allModelsLoaded } = chatSlice.actions;

export default chatSlice.reducer;
