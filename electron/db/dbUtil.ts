import { app } from 'electron';
import path from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

export function getDataDir(): string {
  const dir = path.join(app.getPath('userData'), 'OllaMateData');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}
