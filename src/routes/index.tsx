import { useEffect } from 'react';
import { getAllNotes } from '../lib/rxdb';

export async function loader() {
  const result = await getAllNotes();
  const docs = result;

  return { docs };
}

export default function IndexPage() {
  useEffect(() => {
    document.title = 'Flow';
  }, []);

  return (
    <div className="mx-auto w-[600px]">
      <h1>Flow</h1>
      <div>Index - left empty for now</div>
    </div>
  );
}
