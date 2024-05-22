import {
  getAllNotes,
  getNote as getNoteDb,
  upsertNote as upsertNoteDB,
  importNote as importNoteDB,
} from './rxdb';
import { ImportedNote, Note } from "./types";

export async function getNotes() {
  return await getAllNotes();
}

export async function getNote(noteId: string) {
  return await getNoteDb(noteId);
}

export async function upsertNote(note: Note) {
  return await upsertNoteDB(note);
}

export async function importNote(importedNote: ImportedNote) {
  return await importNoteDB(importedNote);
}

export async function updateNote() {

}