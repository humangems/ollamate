import path from 'node:path';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import { DatabaseService } from './service';
import { getDataDir } from './dbUtil';

function resolveDefaultPaths() {
  const dbPath = path.join(getDataDir(), 'ollamate.db');
  const migrationsFolder = isDev
    ? path.join(app.getAppPath(), 'drizzle')
    : path.join(process.resourcesPath, 'drizzle');
  return { dbPath, migrationsFolder };
}

let _dbService: DatabaseService | undefined;

// Lazy proxy so importing this module from a non-Electron environment (e.g. a
// test process) doesn't eagerly touch electron. The first property access
// triggers construction with the real Electron-derived paths.
export const dbService: DatabaseService = new Proxy({} as DatabaseService, {
  get(_target, prop) {
    if (!_dbService) {
      const { dbPath, migrationsFolder } = resolveDefaultPaths();
      _dbService = new DatabaseService(dbPath, migrationsFolder);
    }
    return Reflect.get(_dbService, prop, _dbService);
  },
});
