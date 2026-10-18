const express = require('express');
const { createTodoController } = require('../controllers/todos.controllers');

const router = express.Router();

router.post('/', createTodoController);

module.exports = router;
