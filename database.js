require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'phao_chi',
      ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
    };

const pool = new Pool(poolConfig);

function toPostgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

const db = {
  query: (sql, params = []) => pool.query(toPostgresPlaceholders(sql), params),
  prepare(sql) {
    const query = toPostgresPlaceholders(sql);
    return {
      all: async (...params) => (await pool.query(query, params)).rows,
      get: async (...params) => (await pool.query(query, params)).rows[0],
      run: async (...params) => {
        const result = await pool.query(query, params);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows[0] ? result.rows[0].id : undefined,
        };
      },
    };
  },
  async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback((sql, params = []) =>
        client.query(toPostgresPlaceholders(sql), params)
      );
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  pool,
};

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      price DOUBLE PRECISION DEFAULT 0,
      material TEXT DEFAULT '',
      dimensions TEXT DEFAULT '',
      image TEXT DEFAULT '',
      gallery TEXT DEFAULT '[]',
      featured SMALLINT DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS hero_slides (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT '',
      image TEXT DEFAULT '',
      button_text TEXT DEFAULT '',
      button_link TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      active SMALLINT DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      message TEXT DEFAULT '',
      "read" SMALLINT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS uploaded_images (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      original_name TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT '',
      size_bytes BIGINT NOT NULL DEFAULT 0,
      uploaded_by TEXT NOT NULL DEFAULT '',
      uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id SERIAL PRIMARY KEY,
      actor TEXT NOT NULL DEFAULT '',
      action TEXT NOT NULL,
      route TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (Boolean(adminUsername) !== Boolean(adminPassword)) {
    throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must both be configured for first-time admin setup.');
  }

  if (adminUsername && adminPassword) {
    if (adminPassword.length < 12) {
      throw new Error('ADMIN_PASSWORD must be at least 12 characters long.');
    }

    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1', [adminUsername]);
    if (rows.length === 0) {
      const password = bcrypt.hashSync(adminPassword, 10);
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [adminUsername, password, 'admin']
      );
      console.log('[DB] Created initial admin account from environment configuration.');
    }
  }
}

module.exports = { ...db, initializeDatabase };
