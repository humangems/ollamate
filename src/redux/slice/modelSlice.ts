import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Model } from '../../lib/types';
import getOllama from '../../lib/ollamaApi';

const modelAdapter = createEntityAdapter<Model, string>({
  selectId: (model) => model.name
});

export const modelSlice = createSlice({
  name: 'models',
  initialState: modelAdapter.getInitialState(),
  reducers: {
    allModelsLoaded: modelAdapter.setAll,
  },
});

export const getAllModelsThunk = createAsyncThunk<Model[]>(
  'models/getAllModels',
  async (_payload, thunkAPI) => {
    let response;
    const ollamaInstance = await getOllama();
    try {
      response = await ollamaInstance.list();
    } catch (error) {
      alert(`Failed to fetch models\n\n${error}`);
    }

    if (!response) return [];

    const models  = response.models;
    thunkAPI.dispatch(allModelsLoaded(models));
    return models;
  }
);

export const modelSelectors = modelAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allModelsLoaded } = modelSlice.actions;

export default modelSlice.reducer;
