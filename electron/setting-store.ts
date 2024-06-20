import Store from 'electron-store';

const schema = {
  ollamaServer: {
    type: 'object',
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

export const settingStore = new Store({schema});
