require('dotenv').config();

const app = require('./app');

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`Todo API listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down server...`);

  server.close(() => {
    // Requiring the pool here allows the server to stop accepting requests
    // before closing database connections.
    const pool = require('./db/pool');
    pool
      .end()
      .catch((error) => console.error('Error closing PostgreSQL pool:', error))
      .finally(() => process.exit(0));
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
