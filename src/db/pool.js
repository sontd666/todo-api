const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (error) => {
  // Handles unexpected errors from idle clients in the pool.
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
