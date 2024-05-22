import dayjs from 'dayjs';
import { Note } from '../../lib/types';
import NoteView from './NoteView';
import { Heading } from '@radix-ui/themes';

type DayViewProps = {
  date: string;
  notes: Note[];
};

export default function DayView({ date, notes }: DayViewProps) {
  const day = dayjs(date).format('D');
  const week = dayjs(date).format('ddd');
  return (
    <div className="flex gap-4 items-start border-b border-gray-6 py-4 last:border-transparent">
      <div className="shrink-0 flex items-center w-13 sticky top-8">
        <div className="-rotate-90 text-[10px] uppercase font-medium text-gray-11">{week}</div>
        <Heading as="h4" size="8" className="tracking-9">
          {day}
        </Heading>
      </div>
      <div className="flex-1 space-y-4">
        {notes.map((note) => (
          <NoteView key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
