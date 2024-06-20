import { Ollama } from "ollama/browser";
import { getOllamaServerConfig } from "./settingApi";

export default async function getOllama() {
  const config = await getOllamaServerConfig();
  if (config.custom) {
    return new Ollama({ host: config.url });
  }
  return new Ollama();
}