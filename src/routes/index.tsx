import { useDocumentTitle } from "@mantine/hooks";
import { Heading } from "@radix-ui/themes";
import dayjs from "dayjs";
import { groupBy } from 'lodash';
import { useLoaderData } from "react-router-dom";
import { getAllNotes } from "../lib/rxdb";
import { Note } from "../lib/types";



export async function loader() {

  const result = await getAllNotes();
  const docs = result;

  return { docs };
}

export default function IndexPage() {
  const { docs }: { docs: Note[] } = useLoaderData() as { docs: Note[] };
  useDocumentTitle("Flow");

  return (
    <div className="mx-auto w-[600px]">
      <Heading size="8">Flow</Heading>
      <div>
        Index - left empty for now
      </div>
    </div>
  );
}