import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { getModels } from '../../lib/modelApi';
import { Model } from '../../lib/types';

const modelAdapter = createEntityAdapter<Model, string>({
  selectId: (model) => model.digest
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
    const response = await getModels();
    thunkAPI.dispatch(allModelsLoaded(response));
    return response;
  }
);


export const modelSelectors = modelAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allModelsLoaded } = modelSlice.actions;

export default modelSlice.reducer;
