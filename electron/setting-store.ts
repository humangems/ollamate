import Store from 'electron-store';

const defaultOllamaServer = {
  custom: false,
  url: 'http://127.0.0.1:11434',
};

const schema = {
  ollamaServer: {
    type: 'object',
    default: defaultOllamaServer,
    properties: {
      "custom": {
        type: 'boolean',
        default: false,
      },
      "url": {
        type: 'string',
        default: 'http://127.0.0.1:11434',
      }
    }
  }
};

export const settingStore = new Store({
  schema,
  defaults: {
    ollamaServer: defaultOllamaServer,
  },
});
