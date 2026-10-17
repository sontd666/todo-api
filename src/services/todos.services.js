const {
  createTodo: insertTodo,
} = require("../repositories/todos.repositories");
const { ValidationError } = require("../errors/validation.error");

const createTodo = async (rawTitle) => {
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";

  if (!title) {
    throw new ValidationError("Title is required");
  }

  const newTodo = await insertTodo({ title, status: "open" });
  return newTodo;
};

module.exports = {
  createTodo,
};
