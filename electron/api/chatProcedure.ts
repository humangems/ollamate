import { streamText } from 'ai';
import type { ModelMessage } from 'ai';
import { createOllama } from 'ai-sdk-ollama';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';
import { publicProcedure, router } from './trpcServer';
import { dbService } from '../db/service';
import { settingStore } from '../setting-store';

const messageSchema = z.object({
  id: z.string(),
  chat_id: z.string(),
  role: z.string(),
  content: z.string(),
  model: z.string().optional(),
  images: z.array(z.string()).optional(),
  eval_count: z.number().optional(),
  created_at: z.number().optional(),
  updated_at: z.number().optional(),
});

const chatProcedure = router({
  chatList: publicProcedure.query(() => dbService.getAllChats()),

  createChat: publicProcedure
    .input(z.object({
      id: z.string(),
      model: z.string(),
      title: z.string().optional(),
      created_at: z.number().optional(),
    }))
    .mutation(({ input }) => dbService.upsertChat(input)),

  updateChat: publicProcedure
    .input(z.object({ id: z.string(), model: z.string().optional(), title: z.string().optional() }))
    .mutation(({ input }) => dbService.upsertChat(input)),

  deleteChat: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => dbService.deleteChat(input.id)),

  chatMessages: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(({ input }) => dbService.getMessagesByChatId(input.chatId)),

  addMessage: publicProcedure
    .input(messageSchema)
    .mutation(({ input }) => dbService.addMessage(input)),

  // Streaming subscription: receives the new user message text; loads full history from DB
  stream: publicProcedure
    .input(
      z.object({
        chatId: z.string(),
        model: z.string(),
        userMessage: z.string(),
      })
    )
    .subscription(async function* ({ input }) {
      const { chatId, model, userMessage } = input;

      // Ensure chat record exists
      await dbService.upsertChat({ id: chatId, model });

      // Load conversation history from DB
      const history = await dbService.getMessagesByChatId(chatId);

      // Persist new user message
      await dbService.addMessage({
        id: uuidv7(),
        chat_id: chatId,
        role: 'user',
        content: userMessage,
        model,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      // Build full message list for AI (history + new message)
      const aiMessages: ModelMessage[] = [
        ...history.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        { role: 'user' as const, content: userMessage },
      ];

      // Get Ollama server config
      const ollamaConfig = settingStore.get('ollamaServer') as { custom: boolean; url: string } | undefined;
      const baseURL = ollamaConfig?.url ?? 'http://127.0.0.1:11434';
      const provider = createOllama({ baseURL });

      const result = streamText({
        model: provider(model),
        system: 'You are a helpful assistant.',
        messages: aiMessages,
      });

      let fullContent = '';

      for await (const part of result.fullStream) {
        if (part.type === 'text-delta') {
          fullContent += part.text;
          yield { type: 'text-delta' as const, text: part.text };
        } else if (part.type === 'reasoning-start') {
          yield { type: 'reasoning-start' as const };
        } else if (part.type === 'reasoning-delta') {
          fullContent += part.text;
          yield { type: 'reasoning-delta' as const, text: part.text };
        } else if (part.type === 'reasoning-end') {
          yield { type: 'reasoning-end' as const };
        } else if (part.type === 'error') {
          throw part.error instanceof Error ? part.error : new Error(String(part.error));
        }
      }

      // Persist completed assistant message
      const usage = await result.usage;
      await dbService.addMessage({
        id: uuidv7(),
        chat_id: chatId,
        role: 'assistant',
        content: fullContent,
        model,
        eval_count: usage.outputTokens ?? undefined,
        created_at: Date.now(),
        updated_at: Date.now(),
      });

      yield {
        type: 'finish' as const,
        finishReason: 'stop',
        usage: {
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
        },
      };
    }),
});

export default chatProcedure;
