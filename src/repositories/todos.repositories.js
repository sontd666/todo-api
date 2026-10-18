const pool = require('../db/pool');

const createTodoRepository = () => ({
  create: async ({ title, status }, client) => {
    const db = client ?? pool;
    const result = await db.query(
      `INSERT INTO todos (title, status)
       VALUES ($1, $2)
       RETURNING id, title, status`,
      [title, status],
    );

    return result.rows[0];
  },
});

module.exports = {
  createTodoRepository,
};
