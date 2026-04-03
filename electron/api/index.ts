import { router } from './trpcServer';
import chatProcedure from './chatProcedure';

export const appRouter = router({
  chat: chatProcedure,
});

export type AppRouter = typeof appRouter;
