const test = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError } = require('../errors/validation.error');

const { createTodoService } = require('../services/todos.services');

const fakeClient = { name: 'fake-transaction-client' };
const fakeWithTransaction = async (operation) => operation(fakeClient);

test('should trim title before creating todo', async () => {
  const calls = [];
  const auditCalls = [];

  const fakeRepository = {
    async create(input, client) {
      assert.equal(client, fakeClient);
      calls.push(input);
      return {
        id: 1,
        ...input,
      };
    },
  };

  const fakeAuditRepository = {
    async create(input, client) {
      assert.equal(client, fakeClient);
      auditCalls.push(input);
      return { id: 1, todo_id: input.todoId, action: input.action };
    },
  };

  const todoService = createTodoService({
    todoRepository: fakeRepository,
    auditRepository: fakeAuditRepository,
    withTransaction: fakeWithTransaction,
  });

  const rawTitle = '   My Todo   ';
  const result = await todoService.createTodo(rawTitle);

  assert.equal(result.title, rawTitle.trim());
  assert.equal(result.status, 'open');
  assert.deepEqual(calls, [{ title: rawTitle.trim(), status: 'open' }]);
  assert.deepEqual(auditCalls, [{ todoId: 1, action: 'TODO_CREATED' }]);
});

test('should throw ValidationError if title is empty after trimming', async () => {
  let callCount = 0;
  const fakeRepository = {
    async create(input) {
      callCount++;
      return {
        id: 1,
        ...input,
      };
    },
  };

  const fakeAuditRepository = {
    async create() {
      callCount++;
    },
  };

  const todoService = createTodoService({
    todoRepository: fakeRepository,
    auditRepository: fakeAuditRepository,
    withTransaction: fakeWithTransaction,
  });

  const rawTitle = '   ';

  await assert.rejects(() => todoService.createTodo(rawTitle), ValidationError);
  assert.equal(callCount, 0);
});
