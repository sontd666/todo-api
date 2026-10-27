const pool = require('../db/pool');

const createAuditRepository = () => ({
  create: async ({ todoId, action }, client) => {
    const db = client ?? pool;
    const result = await db.query(
      `INSERT INTO audit_logs (todo_id, action)
       VALUES ($1, $2)
       RETURNING id, todo_id, action, created_at`,
      [todoId, action],
    );

    return result.rows[0];
  },
});

module.exports = {
  createAuditRepository,
};
