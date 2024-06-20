
export type OllamaServerConfig = {
  custom: boolean;
  url: string;
}

const OLLAMA_SERVER_KEY = 'ollamaServer';

export async function getOllamaServerConfig(): Promise<OllamaServerConfig> {
  return (await window.ipcRenderer.invoke('setting-get', OLLAMA_SERVER_KEY)) as OllamaServerConfig;
}

export async function setOllamaServerConfig(config: OllamaServerConfig) {
  await window.ipcRenderer.invoke('setting-set', OLLAMA_SERVER_KEY, config);
}