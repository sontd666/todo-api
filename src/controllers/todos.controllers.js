const { todoService } = require('../container');
const { ValidationError } = require('../errors/validation.error');

const createTodoController = async (req, res, next) => {
  try {
    const rawTitle = req.body?.title;
    if (typeof rawTitle !== 'string') {
      throw new ValidationError('Title must be a string');
    }

    const result = await todoService.createTodo(rawTitle);

    return res.status(201).json({
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTodoController,
};
