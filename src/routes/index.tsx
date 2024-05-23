import { useDocumentTitle } from "@mantine/hooks";
import { Heading } from "@radix-ui/themes";
import { getAllNotes } from "../lib/rxdb";

export async function loader() {

  const result = await getAllNotes();
  const docs = result;

  return { docs };
}

export default function IndexPage() {
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