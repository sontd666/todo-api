const { ValidationError } = require('../errors/validation.error');

const createTodoService = ({
  todoRepository,
  auditRepository,
  withTransaction,
}) => ({
  createTodo: async (rawTitle) => {
    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';

    if (!title) {
      throw new ValidationError('Title is required');
    }

    const newTodo = await withTransaction(async (client) => {
      const newTodo = await todoRepository.create(
        { title, status: 'open' },
        client,
      );

      await auditRepository.create(
        { todoId: newTodo.id, action: 'TODO_CREATED' },
        client,
      );

      return newTodo;
    });

    return newTodo;
  },
});

module.exports = {
  createTodoService,
};
