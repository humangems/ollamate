import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq, desc, asc } from 'drizzle-orm';
import path from 'node:path';
import { app } from 'electron';
import isDev from 'electron-is-dev';
import { uuidv7 } from 'uuidv7';
import { getDataDir } from './dbUtil';
import * as schema from './schema';

class DatabaseService {
  private db: BetterSQLite3Database<typeof schema>;

  constructor() {
    const dbPath = path.join(getDataDir(), 'ollamate.db');
    this.db = drizzle({ connection: { source: dbPath }, schema });
    this.init();
  }

  private init() {
    const drizzleDir = isDev
      ? path.join(app.getAppPath(), 'drizzle')
      : path.join(process.resourcesPath, 'drizzle');

    migrate(this.db, { migrationsFolder: drizzleDir });
  }

  async getAllChats(): Promise<schema.DbChat[]> {
    return this.db.query.chats.findMany({
      orderBy: (t) => [desc(t.created_at)],
    });
  }

  async upsertChat(chat: Partial<schema.NewDbChat> & { id: string }): Promise<schema.DbChat> {
    const now = Date.now();
    const values: schema.NewDbChat = {
      id: chat.id,
      model: chat.model ?? '',
      title: chat.title,
      created_at: chat.created_at ?? now,
      updated_at: now,
    };
    const result = await this.db
      .insert(schema.chats)
      .values(values)
      .onConflictDoUpdate({
        target: schema.chats.id,
        set: {
          model: values.model,
          title: values.title,
          updated_at: now,
        },
      })
      .returning();
    return result[0];
  }

  async updateChatTitle(id: string, title: string): Promise<schema.DbChat | undefined> {
    const result = await this.db
      .update(schema.chats)
      .set({ title, updated_at: Date.now() })
      .where(eq(schema.chats.id, id))
      .returning();
    return result[0];
  }

  async updateChatModel(id: string, model: string): Promise<schema.DbChat | undefined> {
    const result = await this.db
      .update(schema.chats)
      .set({ model, updated_at: Date.now() })
      .where(eq(schema.chats.id, id))
      .returning();
    return result[0];
  }

  async deleteChat(id: string): Promise<boolean> {
    await this.db.delete(schema.messages).where(eq(schema.messages.chat_id, id));
    const result = await this.db.delete(schema.chats).where(eq(schema.chats.id, id));
    return result.changes > 0;
  }

  async getMessagesByChatId(chatId: string): Promise<schema.DbMessage[]> {
    return this.db.query.messages.findMany({
      where: (t) => eq(t.chat_id, chatId),
      orderBy: (t) => [asc(t.created_at)],
    });
  }

  async addMessage(msg: Omit<schema.NewDbMessage, 'id'> & { id?: string }): Promise<schema.DbMessage> {
    const values: schema.NewDbMessage = {
      id: msg.id ?? uuidv7(),
      chat_id: msg.chat_id,
      role: msg.role,
      content: msg.content ?? '',
      model: msg.model,
      images: msg.images,
      eval_count: msg.eval_count,
      created_at: msg.created_at ?? Date.now(),
      updated_at: msg.updated_at ?? Date.now(),
    };
    const result = await this.db.insert(schema.messages).values(values).returning();
    return result[0];
  }
}

export const dbService = new DatabaseService();
