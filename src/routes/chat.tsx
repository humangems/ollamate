import { LoaderFunction, useParams } from "react-router-dom";
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
  // const { note }: { note: Note } = useLoaderData() as { note: Note };
  const {chatId} = useParams();

  console.log(chatId)

  return (
    <div className="mx-auto">
      Chat {chatId}
    </div>
  );
}
