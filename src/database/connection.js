require('dotenv').config();
const { Pool } = require('pg');

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

/**
 * Convert SQLite-style `?` placeholders to PostgreSQL's numbered placeholders.
 * @param {string} sql SQL statement using `?` parameters.
 * @returns {string} SQL statement using `$1`, `$2`, and subsequent placeholders.
 */
function toPostgresPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

/**
 * Database adapter that preserves the query interface used by the API routes.
 * `prepare().all/get/run` accept SQL parameters as positional arguments.
 */
const db = {
  /** Run a parameterized SQL query and return the native PostgreSQL result. */
  query(sql, params = []) {
    return pool.query(toPostgresPlaceholders(sql), params);
  },

  /**
   * Prepare a query and expose helpers matching the former SQLite interface.
   * @param {string} sql SQL statement with `?` placeholders.
   * @returns {{all: Function, get: Function, run: Function}} Query helpers.
   */
  prepare(sql) {
    const query = toPostgresPlaceholders(sql);
    return {
      /** Return every row returned by the prepared query. */
      all: async (...params) => (await pool.query(query, params)).rows,
      /** Return the first row returned by the prepared query, if any. */
      get: async (...params) => (await pool.query(query, params)).rows[0],
      /** Execute a query and return affected-row and inserted-id metadata. */
      run: async (...params) => {
        const result = await pool.query(query, params);
        return {
          changes: result.rowCount,
          lastInsertRowid: result.rows[0] ? result.rows[0].id : undefined,
        };
      },
    };
  },

  /**
   * Run several queries on one client and commit or roll back atomically.
   * @param {(query: Function) => Promise<*>} callback Work to execute in the transaction.
   * @returns {Promise<*>} The value returned by the callback.
   */
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

module.exports = { ...db, pool };
