export async function getModels() {
  const res = await fetch('http://localhost:11434/api/tags');
  const json = await res.json();
  return json["models"];
}