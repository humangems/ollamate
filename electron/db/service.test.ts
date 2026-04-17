import { describe, it, expect, beforeEach } from 'vitest';
import path from 'node:path';
import { DatabaseService } from './service';

const MIGRATIONS = path.resolve(__dirname, '../../drizzle');

function makeService() {
  return new DatabaseService(':memory:', MIGRATIONS);
}

describe('DatabaseService', () => {
  let svc: DatabaseService;

  beforeEach(() => {
    svc = makeService();
  });

  describe('chats', () => {
    it('upsertChat inserts a new chat and returns it', async () => {
      const result = await svc.upsertChat({ id: 'c1', model: 'llama3', title: 'hello' });

      expect(result.id).toBe('c1');
      expect(result.model).toBe('llama3');
      expect(result.title).toBe('hello');
      expect(result.created_at).toBeGreaterThan(0);
      expect(result.updated_at).toBeGreaterThan(0);
    });

    it('upsertChat updates existing chat (same id) without changing created_at', async () => {
      const original = await svc.upsertChat({
        id: 'c1',
        model: 'llama3',
        title: 'v1',
        created_at: 1000,
      });
      const updated = await svc.upsertChat({
        id: 'c1',
        model: 'mistral',
        title: 'v2',
      });

      expect(updated.created_at).toBe(original.created_at);
      expect(updated.model).toBe('mistral');
      expect(updated.title).toBe('v2');
      expect(updated.updated_at).toBeGreaterThanOrEqual(original.updated_at!);
    });

    it('getAllChats returns chats sorted by created_at desc', async () => {
      await svc.upsertChat({ id: 'a', model: 'm', created_at: 100 });
      await svc.upsertChat({ id: 'b', model: 'm', created_at: 300 });
      await svc.upsertChat({ id: 'c', model: 'm', created_at: 200 });

      const all = await svc.getAllChats();
      expect(all.map((c) => c.id)).toEqual(['b', 'c', 'a']);
    });

    it('updateChatTitle updates only the title', async () => {
      await svc.upsertChat({ id: 'c1', model: 'llama3', title: 'old' });
      const updated = await svc.updateChatTitle('c1', 'new title');

      expect(updated?.title).toBe('new title');
      expect(updated?.model).toBe('llama3');
    });

    it('updateChatModel updates only the model', async () => {
      await svc.upsertChat({ id: 'c1', model: 'llama3', title: 'keep me' });
      const updated = await svc.updateChatModel('c1', 'gemma');

      expect(updated?.model).toBe('gemma');
      expect(updated?.title).toBe('keep me');
    });

    it('deleteChat removes the chat and cascades its messages', async () => {
      await svc.upsertChat({ id: 'c1', model: 'm' });
      await svc.addMessage({
        chat_id: 'c1',
        role: 'user',
        content: 'hello',
        created_at: 1,
      });
      await svc.addMessage({
        chat_id: 'c1',
        role: 'assistant',
        content: 'hi',
        created_at: 2,
      });

      const deleted = await svc.deleteChat('c1');
      expect(deleted).toBe(true);

      const remaining = await svc.getMessagesByChatId('c1');
      expect(remaining).toEqual([]);
      const chats = await svc.getAllChats();
      expect(chats).toEqual([]);
    });

    it('deleteChat returns false when chat does not exist', async () => {
      const deleted = await svc.deleteChat('missing');
      expect(deleted).toBe(false);
    });
  });

  describe('messages', () => {
    beforeEach(async () => {
      await svc.upsertChat({ id: 'c1', model: 'llama3' });
    });

    it('addMessage persists fields and auto-generates id when absent', async () => {
      const msg = await svc.addMessage({
        chat_id: 'c1',
        role: 'user',
        content: 'hi',
      });
      expect(msg.id).toMatch(/^[0-9a-f-]+$/);
      expect(msg.chat_id).toBe('c1');
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('hi');
    });

    it('getMessagesByChatId returns messages sorted by created_at asc', async () => {
      await svc.addMessage({ chat_id: 'c1', role: 'user', content: 'a', created_at: 300 });
      await svc.addMessage({ chat_id: 'c1', role: 'user', content: 'b', created_at: 100 });
      await svc.addMessage({ chat_id: 'c1', role: 'user', content: 'c', created_at: 200 });

      const rows = await svc.getMessagesByChatId('c1');
      expect(rows.map((m) => m.content)).toEqual(['b', 'c', 'a']);
    });

    it('getMessagesByChatId scopes results to the given chat', async () => {
      await svc.upsertChat({ id: 'c2', model: 'llama3' });
      await svc.addMessage({ chat_id: 'c1', role: 'user', content: 'one' });
      await svc.addMessage({ chat_id: 'c2', role: 'user', content: 'two' });

      const rows = await svc.getMessagesByChatId('c1');
      expect(rows).toHaveLength(1);
      expect(rows[0].content).toBe('one');
    });

    it('addMessage stores eval_count and images passthrough', async () => {
      const msg = await svc.addMessage({
        chat_id: 'c1',
        role: 'assistant',
        content: 'ok',
        eval_count: 42,
        images: ['base64data'],
      });
      expect(msg.eval_count).toBe(42);
      expect(msg.images).toEqual(['base64data']);
    });
  });
});
