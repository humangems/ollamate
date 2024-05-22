import { LoaderFunction, useLoaderData } from "react-router-dom";
import NoteEditor from "../components/editor/NoteEditor";
import { getNote } from "../lib/rxdb";
import { Note } from "../lib/types";

type LoaderData = {
  note: Note;
}

export const loader: LoaderFunction = async({ params}): Promise<LoaderData> => {
  const note = await getNote(params.noteId!);
  return { note };
}

export default function NotePage() {
  const { note }: { note: Note } = useLoaderData() as { note: Note };

  return (
    <div className="mx-auto">
      <NoteEditor note={note} />
    </div>
  );
}
