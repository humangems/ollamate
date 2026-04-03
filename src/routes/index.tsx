import { useEffect } from 'react';

export async function loader() {
  return { docs: [] };
}

export default function IndexPage() {
  useEffect(() => {
    document.title = 'Ollamate';
  }, []);

  return (
    <div className="mx-auto w-[600px]">
      <div>Index - left empty for now</div>
    </div>
  );
}
