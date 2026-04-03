import { initTRPC } from '@trpc/server';

const t = initTRPC.create({ isServer: true });

export const router = t.router;
export const publicProcedure = t.procedure;
