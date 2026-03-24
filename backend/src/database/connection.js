import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DATABASE_PATH || './data/financeiro.db';

// Criar diretório de dados se não existir
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Ler e executar o schema SQL
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      db.exec(schema, (err) => {
        if (err) {
          reject(err);
          return;
        }

        console.log('✓ Database initialized successfully');
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
  });
}

export function getDatabase() {
  return new sqlite3.Database(DB_PATH);
}

export function run(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(query, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
      db.close();
    });
  });
}

export function get(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
}

export function all(query, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
      db.close();
    });
  });
}
