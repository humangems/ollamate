import dayjs from 'dayjs';
import { useState } from 'react';
import { Note } from '../../lib/types';
import { upsertNoteThunk } from '../../redux/slice/noteSlice';
import { useAppDispatch } from '../../redux/store';
import { useDocumentTitle } from '@mantine/hooks';

type Props = {
  note: Note;
};

export default function Title({ note }: Props) {
  const createdTime = dayjs(note.created_at).format('dddd, MMM D [at] HH:mm');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title || createdTime);
  useDocumentTitle(title);
  const dispatch = useAppDispatch();
  const [dirty, setDirty] = useState(false)
  const handleClick = () => {
    setEditing(true);
  };

  const handleChange = (el: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(el.target.value);
    setDirty(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (dirty) {
      dispatch(upsertNoteThunk({ ...note, title }));
      setDirty(false);
      if (title === "") {
        setTitle(createdTime)
      }
    }
  };

  const handleKeyUp = (el: React.KeyboardEvent<HTMLInputElement>) => {
    if (el.key === 'Enter') {
      setEditing(false);
      if (dirty) {
        dispatch(upsertNoteThunk({ ...note, title }));
        setDirty(false);
        if (title === '') {
          setTitle(createdTime);
        }
      }
    }
  }

  return (
    <input
      type="text"
      className="bg-transparent w-full text-8 font-bold outline-none"
      value={title}
      onClick={handleClick}
      readOnly={!editing}
      onKeyUp={handleKeyUp}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}
