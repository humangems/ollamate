import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  getNote,
  importNote,
  upsertNote
} from '../../lib/noteApi';
import { ImportedNote, Note } from '../../lib/types';

const noteAdapter = createEntityAdapter<Note, string>({
  selectId: (note) => note.id,
  sortComparer: (a, b) => (b?.created_at || 0) - (a?.created_at || 0),
});

export const noteSlice = createSlice({
  name: 'notes',
  initialState: noteAdapter.getInitialState(),
  reducers: {
    allNotesLoaded: noteAdapter.setAll,
    noteLoaded: noteAdapter.upsertOne,
  },
});

export const upsertNoteThunk = createAsyncThunk<Note, Note>(
  'notes/upsertNote',
  async (payload, thunkAPI) => {
    const response = await upsertNote(payload);
    thunkAPI.dispatch(noteLoaded(response));
    return response;
  }
);

export const getNoteThunk = createAsyncThunk<Note, string>(
  'notes/getNote',
  async (payload, thunkAPI) => {
    const response = await getNote(payload);
    thunkAPI.dispatch(noteLoaded(response));
    return response;
  }
);

export const importNoteThunk = createAsyncThunk<Note, ImportedNote>(
  'notes/importNote',
  async (payload, thunkAPI) => {
    const response = await importNote(payload);
    thunkAPI.dispatch(noteLoaded(response));
    return response;
  }
);

export const noteSelectors = noteAdapter.getSelectors();

// Action creators are generated for each case reducer function
export const { allNotesLoaded, noteLoaded } = noteSlice.actions;

export default noteSlice.reducer;
