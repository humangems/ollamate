import { createTRPCClient } from '@trpc/client';
import { ipcLink } from 'electron-trpc-experimental/renderer';
import type { AppRouter } from '../../electron/api';

export const trpcClient = createTRPCClient<AppRouter>({
  links: [ipcLink()],
});
