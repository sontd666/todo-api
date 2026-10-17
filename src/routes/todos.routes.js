const express = require("express");
const { createTodo } = require("../services/todos.services");
const { ValidationError } = require("../errors/validation.error");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const rawTitle = req.body?.title;
    if (typeof rawTitle !== "string") {
      throw new ValidationError("Title must be a string");
    }

    const result = await createTodo(rawTitle);

    return res.status(201).json({
      data: result,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
