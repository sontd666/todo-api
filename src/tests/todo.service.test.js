const test = require('node:test');
const assert = require('node:assert/strict');
const { ValidationError } = require('../errors/validation.error');

const { createTodoService } = require('../services/todos.services');

test('should trim title before creating todo', async () => {
  const calls = [];

  const fakeRepository = {
    async create(input) {
      calls.push(input);
      return {
        id: 1,
        ...input,
      };
    },
  };

  const todoService = createTodoService({
    todoRepository: fakeRepository,
  });

  const rawTitle = '   My Todo   ';
  const result = await todoService.createTodo(rawTitle);

  assert.equal(result.title, rawTitle.trim());
  assert.equal(result.status, 'open');
  assert.deepEqual(calls, [{ title: rawTitle.trim(), status: 'open' }]);
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

  const todoService = createTodoService({
    todoRepository: fakeRepository,
  });

  const rawTitle = '   ';

  await assert.rejects(() => todoService.createTodo(rawTitle), ValidationError);
  assert.equal(callCount, 0);
});
