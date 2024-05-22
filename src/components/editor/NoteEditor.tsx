import { useDebouncedCallback } from "@mantine/hooks";
import { useState } from "react";
import { Note } from "../../lib/types";
import { upsertNoteThunk } from "../../redux/slice/noteSlice";
import { useAppDispatch } from "../../redux/store";
import ContentEditor from "./ContentEditor";
import TitleEditor from "./TitleEditor";

type Props = {
  note: Note;
}

export default function NoteEditor({ note }: Props) {
  const dispatch = useAppDispatch();
  const [dirty, setDirty] = useState(false);

  const handleChangeDebounced = useDebouncedCallback((content) => {
    const changeset = { id: note.id, content}
    dispatch(upsertNoteThunk(changeset));
    if (dirty) {
      setDirty(false);
    }
  }, 500);

  const handleChange = (value: string) => {
    setDirty(true);
    handleChangeDebounced(value);
  };

  return (
    <div className="w-[600px] mx-auto">
      <TitleEditor note={note} />
      <ContentEditor value={note.content} onChange={handleChange} />
    </div>
  );
}