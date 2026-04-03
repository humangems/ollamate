import { Note, ImportedNote } from './types';

export async function getNotes(): Promise<Note[]> {
  return [];
}

export async function getNote(_noteId: string): Promise<Note | undefined> {
  return undefined;
}

export async function upsertNote(_note: Note): Promise<Note> {
  return _note;
}

export async function importNote(_importedNote: ImportedNote): Promise<Note> {
  return { id: '', content: '' };
}

export async function updateNote() {}
