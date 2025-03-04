export type OllamaServerConfig = {
  custom: boolean;
  url: string;
};

const OLLAMA_SERVER_KEY = 'ollamaServer';
const LAST_USED_MODEL_KEY = 'lastUsedModel';

export async function getOllamaServerConfig(): Promise<OllamaServerConfig> {
  return (await window.ipcRenderer.invoke('setting-get', OLLAMA_SERVER_KEY)) as OllamaServerConfig;
}

export async function setOllamaServerConfig(config: OllamaServerConfig) {
  await window.ipcRenderer.invoke('setting-set', OLLAMA_SERVER_KEY, config);
}

export async function getLastUsedModel(): Promise<string> {
  return (await window.ipcRenderer.invoke('setting-get', LAST_USED_MODEL_KEY)) as string;
}

export async function setLastUsedModel(model: string) {
  await window.ipcRenderer.invoke('setting-set', LAST_USED_MODEL_KEY, model);
}
