// Database schema and migrations using sql.js
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

let db: SqlJsDatabase;
const DB_PATH = path.join(process.cwd(), 'data.db');

export async function initDatabase(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
}

export function getDb(): SqlJsDatabase {
  if (!db) throw new Error('Database not initialized');
  return db;
}

export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

export function migrate() {
  const database = getDb();
  
  database.run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  database.run(`CREATE INDEX IF NOT EXISTS idx_items_title ON items(title)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)`);
  database.run(`CREATE INDEX IF NOT EXISTS idx_items_createdAt ON items(createdAt)`);
  
  saveDatabase();
  console.log('✅ Database migrated');
}

export function seed() {
  const database = getDb();
  
  const result = database.exec('SELECT COUNT(*) as count FROM items');
  const count = result[0]?.values[0]?.[0] as number || 0;
  
  if (count === 0) {
    const now = new Date().toISOString();
    const sampleItems = [
      { id: uuidv4(), title: 'Welcome Task', description: 'This is your first task!', status: 'active' },
      { id: uuidv4(), title: 'Learn the App', description: 'Explore the CRUD features', status: 'active' },
      { id: uuidv4(), title: 'Completed Item', description: 'This one is done', status: 'inactive' },
    ];
    
    const stmt = database.prepare(`
      INSERT INTO items (id, title, description, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    for (const item of sampleItems) {
      stmt.run([item.id, item.title, item.description, item.status, now, now]);
    }
    stmt.free();
    
    saveDatabase();
    console.log('✅ Database seeded with sample data');
  }
}
