const { withTransaction } = require('./db/transaction-manager');

const { createTodoRepository } = require('./repositories/todos.repositories');
const { createAuditRepository } = require('./repositories/audits.repositories');

const { createTodoService } = require('./services/todos.services');

const todoRepository = createTodoRepository();
const auditRepository = createAuditRepository();

const todoService = createTodoService({
  todoRepository,
  auditRepository,
  withTransaction,
});

module.exports = {
  todoService,
};
