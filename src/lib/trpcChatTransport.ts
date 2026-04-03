import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import { generateId } from 'ai';
import { trpcClient } from './trpc';

function getLastUserMessageText(messages: UIMessage[]): string {
  const last = messages[messages.length - 1];
  if (!last) return '';
  const textPart = last.parts?.find((p) => p.type === 'text');
  if (textPart && textPart.type === 'text') return textPart.text;
  return '';
}

export function createTRPCChatTransport(chatId: string, model: string): ChatTransport<UIMessage> {
  return {
    sendMessages: async ({ messages, abortSignal }) => {
      const userMessage = getLastUserMessageText(messages);
      const textPartId = generateId();
      const messageId = generateId();
      const reasoningPartId = generateId();

      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          // Signal start of new assistant message
          controller.enqueue({ type: 'start', messageId });
          controller.enqueue({ type: 'text-start', id: textPartId });

          const subscription = trpcClient.chat.stream.subscribe(
            { chatId, model, userMessage },
            {
              onData: (chunk) => {
                switch (chunk.type) {
                  case 'text-delta':
                    controller.enqueue({ type: 'text-delta', id: textPartId, delta: chunk.text });
                    break;
                  case 'reasoning-start':
                    controller.enqueue({ type: 'reasoning-start', id: reasoningPartId });
                    break;
                  case 'reasoning-delta':
                    controller.enqueue({ type: 'reasoning-delta', id: reasoningPartId, delta: chunk.text });
                    break;
                  case 'reasoning-end':
                    controller.enqueue({ type: 'reasoning-end', id: reasoningPartId });
                    break;
                  case 'finish':
                    controller.enqueue({ type: 'text-end', id: textPartId });
                    controller.enqueue({ type: 'finish', finishReason: 'stop' });
                    try { controller.close(); } catch { /* already closed */ }
                    break;
                }
              },
              onError: (err) => {
                const message = err instanceof Error ? err.message : String(err);
                controller.enqueue({ type: 'error', errorText: message });
                try { controller.close(); } catch { /* already closed */ }
              },
              onComplete: () => {
                try { controller.close(); } catch { /* already closed */ }
              },
            }
          );

          abortSignal?.addEventListener('abort', () => {
            subscription.unsubscribe();
            try { controller.close(); } catch { /* already closed */ }
          });
        },
      });
    },

    reconnectToStream: async () => null,
  };
}
