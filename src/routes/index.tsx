import { Heading } from "@radix-ui/themes";
import dayjs from "dayjs";
import { groupBy } from 'lodash';
import { useLoaderData } from "react-router-dom";
import MonthView from "../components/flow/MonthView";
import { getAllNotes } from "../lib/rxdb";
import { Note } from "../lib/types";
import { useDocumentTitle } from "@mantine/hooks";
import Last12Months from "../components/flow/calendar/Last12Months";



export async function loader() {

  const result = await getAllNotes();
  const docs = result;

  return { docs };
}

export default function IndexPage() {
  const { docs }: { docs: Note[] } = useLoaderData() as { docs: Note[] };
  useDocumentTitle("Flow");

  const months = groupBy(docs, (doc) => dayjs(doc.created_at).format('YYYY-MM'));


  return (
    <div className="mx-auto w-[600px]">
      <Heading size="8">Flow</Heading>
      <Last12Months />

      <div className="space-y-4 mt-4">
        {Object.keys(months).map((month) => (
          <MonthView key={month} month={month} notes={months[month]} />
        ))}
      </div>
    </div>
  );
}