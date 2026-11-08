import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 數據庫文件路徑
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'kbot.db');

// 確保數據目錄存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 創建數據庫連接
const db = new Database(DB_PATH);

// 啟用 WAL 模式，提高並發性能
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 初始化數據庫表
export function initDatabase() {
  // 用戶表
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT,
      avatar_url TEXT,
      role TEXT NOT NULL DEFAULT 'user', -- admin, user
      is_active BOOLEAN NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `);

  // 用戶配額表
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_quotas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      max_generations INTEGER NOT NULL DEFAULT 10, -- 最多生成次數
      max_modifications INTEGER NOT NULL DEFAULT 50, -- 最多修改次數
      max_websites INTEGER NOT NULL DEFAULT 5, -- 最多網站數
      used_generations INTEGER NOT NULL DEFAULT 0,
      used_modifications INTEGER NOT NULL DEFAULT 0,
      used_websites INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 網站表
  db.exec(`
    CREATE TABLE IF NOT EXISTS websites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      custom_domain TEXT UNIQUE,
      preview_url TEXT,
      status TEXT NOT NULL DEFAULT 'draft', -- draft, published, disabled
      files JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 生成歷史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS generation_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      website_id INTEGER,
      prompt TEXT NOT NULL,
      type TEXT NOT NULL, -- generate, modify
      tokens_used INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE SET NULL
    )
  `);

  // 創建管理員賬戶（如果不存在）
  const adminEmail = 'williamskevin@qq.com';
  const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  
  if (!existingAdmin) {
    // 這裡使用簡單的密碼哈希，實際生產環境應該用 bcrypt
    const passwordHash = require('crypto')
      .createHash('sha256')
      .update('kewq3211')
      .digest('hex');

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, 'admin')
    `).run(adminEmail, passwordHash, '管理員');

    // 創建管理員配額（無限）
    db.prepare(`
      INSERT INTO user_quotas (user_id, max_generations, max_modifications, max_websites)
      VALUES (?, 999999, 999999, 999999)
    `).run(result.lastInsertRowid);

    console.log('Admin account created:', adminEmail);
  }
}

// 初始化數據庫
initDatabase();

export { db };
