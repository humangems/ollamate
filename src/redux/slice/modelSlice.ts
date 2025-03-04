import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import { Model } from '../../lib/types';
import getOllama from '../../lib/ollamaApi';
import { getLastUsedModel, setLastUsedModel } from '../../lib/settingApi';
import { RootState } from '../store';

const modelAdapter = createEntityAdapter<Model, string>({
  selectId: (model) => model.name,
});

const initialState = modelAdapter.getInitialState<{ lastUsed: string | null }>({
  lastUsed: null,
});

export const modelSlice = createSlice({
  name: 'models',
  initialState: initialState,
  reducers: {
    allModelsLoaded: modelAdapter.setAll,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLastUsedModelNameThunk.fulfilled, (state, action) => {
        state.lastUsed = action.payload;
      })
      .addCase(updateLastUsedModelNameThunk.fulfilled, (state, action) => {
        state.lastUsed = action.payload;
      });
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

    const models = response.models;
    thunkAPI.dispatch(allModelsLoaded(models));
    return models;
  }
);

export const getLastUsedModelNameThunk = createAsyncThunk<string>(
  'models/getLastUsedModel',
  async (_payload, _thunkAPI) => {
    const lastUsed = getLastUsedModel();
    return lastUsed;
  }
);

export const updateLastUsedModelNameThunk = createAsyncThunk<string, string>(
  'models/updateLastUsedModel',
  async (payload, _thunkAPI) => {
    await setLastUsedModel(payload);
    return payload;
  }
);

export const modelSelectors = modelAdapter.getSelectors();

export const selectDefaultModelForNewChat = createSelector(
  (state: RootState) => state.models.lastUsed,
  (state: RootState) => modelSelectors.selectAll(state.models),
  (lastUsed, models) => {
    if (lastUsed) return lastUsed;
    return models[0]?.name;
  }
);

// Action creators are generated for each case reducer function
export const { allModelsLoaded } = modelSlice.actions;

export default modelSlice.reducer;
