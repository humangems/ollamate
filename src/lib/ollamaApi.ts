import { createOllama, type OllamaProvider } from 'ai-sdk-ollama/browser';
import { Ollama } from 'ollama/browser';
import { getOllamaServerConfig } from './settingApi';

export async function getOllamaClient() {
  const config = await getOllamaServerConfig();
  if (config.custom) {
    return new Ollama({ host: config.url });
  }
  return new Ollama();
}

export async function getOllamaProvider(): Promise<OllamaProvider> {
  const config = await getOllamaServerConfig();
  if (config.custom) {
    return createOllama({ baseURL: config.url });
  }
  return createOllama();
}

export default getOllamaClient;
