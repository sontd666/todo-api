const pool = require("../db/pool");

const createTodo = async ({ title, status }) => {
  const result = await pool.query(
    `INSERT INTO todos (title, status)
       VALUES ($1, $2)
       RETURNING id, title, status`,
    [title, status],
  );

  return result.rows[0];
};

module.exports = {
  createTodo,
};
