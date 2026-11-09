import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// 基於當前模塊位置定位項目根目錄
// 當前文件：app/lib/server/database.ts，項目根目錄是往上四層
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

// 數據文件路徑，優先使用環境變量，其次使用項目根目錄
const DATA_DIR = process.env.DATA_DIR || path.join(PROJECT_ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'kbot.json');

// 確保數據目錄存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 默認數據結構
interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  k_compute_balance: number;
  k_compute_used: number;
  is_active: boolean;
  google_id?: string;
  apple_id?: string;
  github_id?: string;
  created_at: string;
  last_login_at?: string;
}

interface Website {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  custom_domain?: string;
  preview_url?: string;
  status: 'draft' | 'published' | 'disabled';
  files?: any;
  created_at: string;
  updated_at: string;
}

interface GenerationHistory {
  id: number;
  user_id: number;
  website_id?: number;
  prompt: string;
  type: 'generate' | 'modify';
  tokens_used?: number;
  created_at: string;
}

interface Session {
  token: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

interface Database {
  users: User[];
  websites: Website[];
  generation_history: GenerationHistory[];
  sessions: Session[];
  nextUserId: number;
  nextWebsiteId: number;
  nextHistoryId: number;
}

// 加載數據庫
function loadDatabase(): Database {
  if (fs.existsSync(DB_PATH)) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const data = JSON.parse(raw);
    // 確保所有字段都存在
    return {
      users: data.users || [],
      websites: data.websites || [],
      generation_history: data.generation_history || [],
      sessions: data.sessions || [],
      nextUserId: data.nextUserId || 1,
      nextWebsiteId: data.nextWebsiteId || 1,
      nextHistoryId: data.nextHistoryId || 1,
    };
  }
  return {
    users: [],
    websites: [],
    generation_history: [],
    sessions: [],
    nextUserId: 1,
    nextWebsiteId: 1,
    nextHistoryId: 1,
  };
}

// 保存數據庫
function saveDatabase(db: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// 初始化數據庫
let db = loadDatabase();

// 初始化數據庫表（創建管理員賬戶）
export function initDatabase() {
  const adminEmail = 'williamskevin@qq.com';
  const existingAdmin = db.users.find(u => u.email === adminEmail);
  
  if (!existingAdmin) {
    const passwordHash = crypto
      .createHash('sha256')
      .update('kewq3211')
      .digest('hex');

    const adminUser: User = {
      id: db.nextUserId++,
      email: adminEmail,
      password_hash: passwordHash,
      name: '管理員',
      role: 'admin',
      tier: 'enterprise',
      k_compute_balance: 999999,
      k_compute_used: 0,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    db.users.push(adminUser);
    saveDatabase(db);
    console.log('Admin account created:', adminEmail);
  }
}

// 用戶操作
export const userOperations = {
  findByEmail(email: string): User | undefined {
    return db.users.find(u => u.email === email);
  },

  findById(id: number): User | undefined {
    return db.users.find(u => u.id === id);
  },

  createUser(user: Omit<User, 'id' | 'created_at' | 'k_compute_balance' | 'k_compute_used' | 'is_active' | 'role' | 'tier'>): User {
    const newUser: User = {
      id: db.nextUserId++,
      role: 'user',
      tier: 'free',
      k_compute_balance: 10,
      k_compute_used: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      ...user,
    };
    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  },

  updateUser(id: number, updates: Partial<User>): User | undefined {
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    db.users[index] = { ...db.users[index], ...updates };
    saveDatabase(db);
    return db.users[index];
  },

  getAllUsers(): User[] {
    return db.users;
  },
};

// 網站操作
export const websiteOperations = {
  findById(id: number): Website | undefined {
    return db.websites.find(w => w.id === id);
  },

  findByUserId(userId: number): Website[] {
    return db.websites.filter(w => w.user_id === userId);
  },

  createWebsite(website: Omit<Website, 'id' | 'created_at' | 'updated_at' | 'status'>): Website {
    const newWebsite: Website = {
      id: db.nextWebsiteId++,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...website,
    };
    db.websites.push(newWebsite);
    saveDatabase(db);
    return newWebsite;
  },

  updateWebsite(id: number, updates: Partial<Website>): Website | undefined {
    const index = db.websites.findIndex(w => w.id === id);
    if (index === -1) return undefined;
    db.websites[index] = { ...db.websites[index], ...updates, updated_at: new Date().toISOString() };
    saveDatabase(db);
    return db.websites[index];
  },
};

// 生成歷史操作
export const historyOperations = {
  createHistory(history: Omit<GenerationHistory, 'id' | 'created_at'>): GenerationHistory {
    const newHistory: GenerationHistory = {
      id: db.nextHistoryId++,
      created_at: new Date().toISOString(),
      ...history,
    };
    db.generation_history.push(newHistory);
    saveDatabase(db);
    return newHistory;
  },

  findByUserId(userId: number): GenerationHistory[] {
    return db.generation_history.filter(h => h.user_id === userId);
  },
};

// Session 操作
export const sessionOperations = {
  createSession(token: string, userId: number, expiresAt: Date): Session {
    const newSession: Session = {
      token,
      user_id: userId,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    };
    db.sessions.push(newSession);
    saveDatabase(db);
    return newSession;
  },

  findByToken(token: string): Session | undefined {
    return db.sessions.find(s => s.token === token);
  },

  deleteExpiredSessions() {
    const now = new Date().toISOString();
    db.sessions = db.sessions.filter(s => s.expires_at > now);
    saveDatabase(db);
  },
};

// 初始化數據庫
initDatabase();

export { db };
