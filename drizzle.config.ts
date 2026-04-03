import { defineConfig } from 'drizzle-kit';
import path from 'node:path';
import os from 'node:os';

export default defineConfig({
  out: './drizzle',
  schema: './electron/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    // Hardcoded dev path for drizzle-kit tooling (drizzle-kit generate/studio)
    url: path.join(os.homedir(), 'Library', 'Application Support', 'Electron', 'OllaMateData', 'ollamate.db'),
  },
});
