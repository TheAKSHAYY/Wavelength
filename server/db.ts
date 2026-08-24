import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export interface User {
  id: string;
  email: string;
  name: string;
  channel_name?: string;
  handle?: string;
  bio?: string;
  avatar_url?: string;
  avatar_color?: string;
  niche?: string;
  target_audience?: string;
  tone?: string;
  youtube_channel_id?: string;
  upload_goal?: string;
  social_links?: string;
  created_at?: string;
}

export interface UserRow extends User {
  password_hash: string;
  created_at: string;
}

const APP_KEY = "app";

// Supabase client instance if configured
let supabase: SupabaseClient | null = null;
if (config.supabaseUrl && config.supabaseKey) {
  supabase = createClient(config.supabaseUrl, config.supabaseKey);
  console.log("Supabase database connected successfully.");
}

// Local SQLite fallback instance
let sqliteDb: DatabaseSync | null = null;

function getSqliteDb(): DatabaseSync {
  if (!sqliteDb) {
    const dbPath = process.env.VERCEL ? "/tmp/wavelength.db" : config.dbPath;
    try {
      mkdirSync(dirname(dbPath), { recursive: true });
    } catch {
      // Ignore if directory already exists
    }
    sqliteDb = new DatabaseSync(dbPath);

    sqliteDb.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS kv (
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, key)
      );
    `);

    const profileColumns = [
      "ALTER TABLE users ADD COLUMN channel_name TEXT;",
      "ALTER TABLE users ADD COLUMN handle TEXT;",
      "ALTER TABLE users ADD COLUMN bio TEXT;",
      "ALTER TABLE users ADD COLUMN avatar_url TEXT;",
      "ALTER TABLE users ADD COLUMN avatar_color TEXT;",
      "ALTER TABLE users ADD COLUMN niche TEXT;",
      "ALTER TABLE users ADD COLUMN target_audience TEXT;",
      "ALTER TABLE users ADD COLUMN tone TEXT;",
      "ALTER TABLE users ADD COLUMN youtube_channel_id TEXT;",
      "ALTER TABLE users ADD COLUMN upload_goal TEXT;",
      "ALTER TABLE users ADD COLUMN social_links TEXT;",
    ];

    for (const query of profileColumns) {
      try {
        sqliteDb.exec(query);
      } catch {
        // Column already exists
      }
    }
  }
  return sqliteDb;
}

export async function createUser(input: {
  id: string;
  email: string;
  name: string;
  password_hash: string;
}): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("users").insert({
      id: input.id,
      email: input.email,
      name: input.name,
      password_hash: input.password_hash,
    });
    if (error) throw new Error(error.message);
    return;
  }

  getSqliteDb()
    .prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)")
    .run(input.id, input.email, input.name, input.password_hash);
}

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      console.error("Supabase findUserByEmail error:", error);
      return undefined;
    }
    return (data as UserRow) || undefined;
  }

  return getSqliteDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | UserRow
    | undefined;
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("Supabase findUserById error:", error);
      return undefined;
    }
    return (data as UserRow) || undefined;
  }

  return getSqliteDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | UserRow
    | undefined;
}

export async function updateUserProfile(
  id: string,
  data: Partial<Omit<User, "id" | "email" | "created_at">>
): Promise<UserRow | undefined> {
  if (supabase) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = String(data.name).trim().slice(0, 60);
    if (data.channel_name !== undefined) updateData.channel_name = String(data.channel_name).trim().slice(0, 100);
    if (data.handle !== undefined) updateData.handle = String(data.handle).trim().slice(0, 60);
    if (data.bio !== undefined) updateData.bio = String(data.bio).trim().slice(0, 500);
    if (data.avatar_url !== undefined) updateData.avatar_url = String(data.avatar_url).trim().slice(0, 500);
    if (data.avatar_color !== undefined) updateData.avatar_color = String(data.avatar_color).trim().slice(0, 30);
    if (data.niche !== undefined) updateData.niche = String(data.niche).trim().slice(0, 200);
    if (data.target_audience !== undefined) updateData.target_audience = String(data.target_audience).trim().slice(0, 200);
    if (data.tone !== undefined) updateData.tone = String(data.tone).trim().slice(0, 100);
    if (data.youtube_channel_id !== undefined) updateData.youtube_channel_id = String(data.youtube_channel_id).trim().slice(0, 100);
    if (data.upload_goal !== undefined) updateData.upload_goal = String(data.upload_goal).trim().slice(0, 100);
    if (data.social_links !== undefined) {
      updateData.social_links =
        typeof data.social_links === "string"
          ? data.social_links
          : JSON.stringify(data.social_links);
    }

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase.from("users").update(updateData).eq("id", id);
      if (error) console.error("Supabase updateUserProfile error:", error);
    }
    return findUserById(id);
  }

  const user = await findUserById(id);
  if (!user) return undefined;

  const fields: string[] = [];
  const values: string[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(String(data.name).trim().slice(0, 60));
  }
  if (data.channel_name !== undefined) {
    fields.push("channel_name = ?");
    values.push(String(data.channel_name).trim().slice(0, 100));
  }
  if (data.handle !== undefined) {
    fields.push("handle = ?");
    values.push(String(data.handle).trim().slice(0, 60));
  }
  if (data.bio !== undefined) {
    fields.push("bio = ?");
    values.push(String(data.bio).trim().slice(0, 500));
  }
  if (data.avatar_url !== undefined) {
    fields.push("avatar_url = ?");
    values.push(String(data.avatar_url).trim().slice(0, 500));
  }
  if (data.avatar_color !== undefined) {
    fields.push("avatar_color = ?");
    values.push(String(data.avatar_color).trim().slice(0, 30));
  }
  if (data.niche !== undefined) {
    fields.push("niche = ?");
    values.push(String(data.niche).trim().slice(0, 200));
  }
  if (data.target_audience !== undefined) {
    fields.push("target_audience = ?");
    values.push(String(data.target_audience).trim().slice(0, 200));
  }
  if (data.tone !== undefined) {
    fields.push("tone = ?");
    values.push(String(data.tone).trim().slice(0, 100));
  }
  if (data.youtube_channel_id !== undefined) {
    fields.push("youtube_channel_id = ?");
    values.push(String(data.youtube_channel_id).trim().slice(0, 100));
  }
  if (data.upload_goal !== undefined) {
    fields.push("upload_goal = ?");
    values.push(String(data.upload_goal).trim().slice(0, 100));
  }
  if (data.social_links !== undefined) {
    fields.push("social_links = ?");
    values.push(typeof data.social_links === "string" ? data.social_links : JSON.stringify(data.social_links));
  }

  if (fields.length > 0) {
    values.push(id);
    getSqliteDb().prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  return findUserById(id);
}

export async function updateUserPassword(id: string, password_hash: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("users").update({ password_hash }).eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  getSqliteDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(password_hash, id);
}

export async function getState(userId: string): Promise<Record<string, unknown>> {
  if (supabase) {
    const { data, error } = await supabase
      .from("kv")
      .select("value")
      .eq("user_id", userId)
      .eq("key", APP_KEY)
      .maybeSingle();
    if (error || !data) return {};
    try {
      return JSON.parse(data.value) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  const row = getSqliteDb()
    .prepare("SELECT value FROM kv WHERE user_id = ? AND key = ?")
    .get(userId, APP_KEY) as { value: string } | undefined;
  if (!row) return {};
  try {
    return JSON.parse(row.value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function setState(userId: string, value: string): Promise<void> {
  if (supabase) {
    const { error } = await supabase.from("kv").upsert(
      {
        user_id: userId,
        key: APP_KEY,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" }
    );
    if (error) throw new Error(error.message);
    return;
  }

  getSqliteDb()
    .prepare(
      `INSERT INTO kv (user_id, key, value) VALUES (?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    )
    .run(userId, APP_KEY, value);
}
