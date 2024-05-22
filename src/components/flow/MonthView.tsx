import { groupBy } from "lodash";
import { Note } from "../../lib/types";
import dayjs from "dayjs";
import DayView from "./DayView";

type MonthViewProps = {
  month: string;
  notes: Note[];
};

export default function MonthView({month, notes}: MonthViewProps) {
  const grouped = groupBy(notes, (doc) => dayjs(doc.created_at).format('YYYY-MM-DD'));
  const monthName = dayjs(month).format('MMMM YYYY');

  return (
    <div>
      <div className="font-medium sticky top-0 border-b border-gray-5">{monthName}</div>
      <div className="">
        {Object.keys(grouped).map((date) => (
          <DayView key={date} date={date} notes={grouped[date]} />
        ))}
      </div>
    </div>
  );
}