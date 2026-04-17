import { generateText, streamText } from 'ai';
import type { ModelMessage } from 'ai';
import { createOllama } from 'ai-sdk-ollama';
import { z } from 'zod';
import { uuidv7 } from 'uuidv7';
import { publicProcedure, router } from './trpcServer';
import { dbService } from '../db/singleton';
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
    .input(
      z.object({
        id: z.string(),
        model: z.string(),
        title: z.string().optional(),
        created_at: z.number().optional(),
      }),
    )
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

  generateTitle: publicProcedure
    .input(
      z.object({
        chatId: z.string(),
        model: z.string(),
        messages: z.array(z.object({ role: z.string(), content: z.string() })),
      }),
    )
    .mutation(async ({ input }) => {
      const { chatId, model, messages } = input;

      const ollamaConfig = settingStore.get('ollamaServer') as
        | { custom: boolean; url: string }
        | undefined;
      const baseURL = ollamaConfig?.url ?? 'http://127.0.0.1:11434';
      const provider = createOllama({ baseURL });

      const instruction = {
        role: 'user' as const,
        content:
          'Generate a title for the conversation, no more than 6 words. return just the title, no quotes. The generated title language should be exactly same as the conversation language.',
      };

      const aiMessages = [
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        instruction,
      ];

      const { text } = await generateText({
        model: provider(model),
        messages: aiMessages,
      });

      const title = text.trim();
      await dbService.upsertChat({ id: chatId, model, title });

      return { chatId, title };
    }),

  // Streaming subscription: receives the new user message text; loads full history from DB
  stream: publicProcedure
    .input(
      z.object({
        chatId: z.string(),
        model: z.string(),
        userMessage: z.string(),
      }),
    )
    .subscription(async function* ({ input }) {
      const { chatId, model, userMessage } = input;

      console.log(`[chat] [${chatId}] [${model}] >>> user: ${userMessage}`);

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
      const ollamaConfig = settingStore.get('ollamaServer') as
        | { custom: boolean; url: string }
        | undefined;
      const baseURL = ollamaConfig?.url ?? 'http://127.0.0.1:11434';
      const provider = createOllama({ baseURL });

      console.log(`[chat] [${chatId}] [${model}] streaming start (history: ${history.length} messages)`);

      let reasoningContent = '';
      let textContent = '';
      let outputTokens: number | undefined;
      let inputTokens: number | undefined;
      let streamError: Error | undefined;

      try {
        const result = streamText({
          model: provider(model, { think: true }),
          system: 'You are a helpful assistant.',
          messages: aiMessages,
        });

        try {
          for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
              textContent += part.text;
              yield { type: 'text-delta' as const, text: part.text };
            } else if (part.type === 'reasoning-start') {
              console.log(`[chat] [${chatId}] reasoning start`);
              yield { type: 'reasoning-start' as const };
            } else if (part.type === 'reasoning-delta') {
              reasoningContent += part.text;
              yield { type: 'reasoning-delta' as const, text: part.text };
            } else if (part.type === 'reasoning-end') {
              console.log(`[chat] [${chatId}] reasoning end (${reasoningContent.length} chars)`);
              yield { type: 'reasoning-end' as const };
            } else if (part.type === 'error') {
              console.error(`[chat] [${chatId}] stream error:`, part.error);
              streamError = part.error instanceof Error ? part.error : new Error(String(part.error));
              break;
            }
          }
        } catch (err) {
          streamError = err instanceof Error ? err : new Error(String(err));
          console.error(`[chat] [${chatId}] stream iteration failed:`, streamError);
        }

        try {
          const usage = await result.usage;
          outputTokens = usage.outputTokens ?? undefined;
          inputTokens = usage.inputTokens ?? undefined;
        } catch {
          // usage unavailable on aborted/failed streams
        }
      } catch (err) {
        streamError = err instanceof Error ? err : new Error(String(err));
        console.error(`[chat] [${chatId}] stream setup failed:`, streamError);
      } finally {
        const storedContent = reasoningContent
          ? `<think>${reasoningContent}</think>${textContent}`
          : textContent;

        await dbService.addMessage({
          id: uuidv7(),
          chat_id: chatId,
          role: 'assistant',
          content: storedContent,
          model,
          eval_count: outputTokens,
          created_at: Date.now(),
          updated_at: Date.now(),
        });

        console.log(`[chat] [${chatId}] [${model}] <<< assistant: ${textContent.length} chars, reasoning: ${reasoningContent.length} chars, tokens in/out: ${inputTokens}/${outputTokens}${streamError ? ` (error: ${streamError.message})` : ''}`);
      }

      if (streamError) {
        throw streamError;
      }

      yield {
        type: 'finish' as const,
        finishReason: 'stop',
        usage: {
          inputTokens: inputTokens ?? 0,
          outputTokens: outputTokens ?? 0,
        },
      };
    }),
});

export default chatProcedure;
