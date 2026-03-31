export type OllamaServerConfig = {
  custom: boolean;
  url: string;
};

const OLLAMA_SERVER_KEY = 'ollamaServer';
const LAST_USED_MODEL_KEY = 'lastUsedModel';
export const DEFAULT_OLLAMA_SERVER_CONFIG: OllamaServerConfig = {
  custom: false,
  url: 'http://127.0.0.1:11434',
};

export async function getOllamaServerConfig(): Promise<OllamaServerConfig> {
  const config = (await window.ipcRenderer.invoke(
    'setting-get',
    OLLAMA_SERVER_KEY
  )) as Partial<OllamaServerConfig> | undefined;

  return {
    custom: config?.custom ?? DEFAULT_OLLAMA_SERVER_CONFIG.custom,
    url: config?.url || DEFAULT_OLLAMA_SERVER_CONFIG.url,
  };
}

export async function setOllamaServerConfig(config: OllamaServerConfig) {
  await window.ipcRenderer.invoke('setting-set', OLLAMA_SERVER_KEY, config);
}

export async function getLastUsedModel(): Promise<string | null> {
  return ((await window.ipcRenderer.invoke('setting-get', LAST_USED_MODEL_KEY)) as string | null) ?? null;
}

export async function setLastUsedModel(model: string) {
  await window.ipcRenderer.invoke('setting-set', LAST_USED_MODEL_KEY, model);
}
