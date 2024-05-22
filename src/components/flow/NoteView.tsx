import { Link } from "react-router-dom";
import { Note } from "../../lib/types";
import dayjs from "dayjs";
import { trim } from "lodash";
import { MoonStarIcon } from "lucide-react";

type NoteViewProps = {
  note: Note;
}

function showDate(timestamp: number) {
  const thedate = dayjs(timestamp);
  return thedate.format('HH:mm');
}

export default function NoteView({note}: NoteViewProps) {
  const noteDate = dayjs(note.created_at!);
  const isNight = noteDate.hour() >= 20 || noteDate.hour() <= 6;
  return (
    <Link key={note.id} className="block overflow-hidden " to={`/note/${note.id}`}>
      <div className="hover:bg-gray-3 flex items-start subpixel-antialiased p-2 rounded-1 gap-1">
        <div className="text-gray-11 w-16 shrink-0 flex items-center gap-1">
          <div>{showDate(note.created_at!)}</div>
          <div className="w-4">
            {isNight && <MoonStarIcon size={16} className="text-purple-8" />}
          </div>
        </div>
        <div className="flex-1">
          <pre className="w-[430px] pt-[1px] text-2 font-sans whitespace-break-spaces overflow-hidden resize-none outline-none line-clamp-4">
            {note.title && (
              <>
                <span className="font-medium">{note.title}</span>
                <span className="mx-1">—</span>
              </>
            )}

            {trim(note.content)}
          </pre>
        </div>
      </div>
    </Link>
  );
}