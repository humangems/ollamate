import { addRxPlugin, createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { ImportedNote, Note } from './types';
import { nanoid } from '@reduxjs/toolkit';

addRxPlugin(RxDBDevModePlugin);

const db = await createRxDatabase({
  name: 'mydatabase',
  storage: getRxStorageDexie(),
});

const noteSchema = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 21, // <- the primary key must have set maxLength
    },
    title: {
      type: 'string',
    },
    content: {
      type: 'string',
    },
    created_at: {
      type: 'number',
    },
    updated_at: {
      type: 'number',
    },
  },
  required: ['id', 'content', 'created_at', 'updated_at'],
};

const collections = await db.addCollections({
  notes: {
    schema: noteSchema,
  },
});

export async function getAllNotes() {
  const result = await collections.notes
    .find({
      sort: [{ created_at: 'desc' }],
    })
    .exec();

  return result.map((doc) => doc.toJSON());
}

export async function getNote(id: string) {
  const note = await collections.notes.findOne(id).exec();
  if (note) {
    return note.toJSON();
  }

  return null;
}

export async function addNote() {
  return {};
}

export async function upsertNote(note: Note) {
  const loaded = await collections.notes.findOne(note.id).exec();
  if (!loaded) {
    const createdNote = { ...note, created_at: Date.now(), updated_at: Date.now() };
    const newNote = await collections.notes.insert(createdNote);
    return newNote.toJSON();
  } else {
    const updatedNote = { ...note, updated_at: Date.now() };
    await loaded.patch(updatedNote);
    return loaded.toJSON();
  }
}

export async function importNote(note: ImportedNote) {
  const newNote = await collections.notes.insert({...note, id: nanoid()});
  return newNote.toJSON();
}
