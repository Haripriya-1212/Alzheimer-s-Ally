const express = require("express");
const router = express.Router();
const dataModel = require("../Models/DataModel");

// Create a new Todo
router.post("/addTodo", async (req, res) => {
  const { userId, todoId, title, status } = req.body;

  try {
    const user = await dataModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTodo = { todoId, title, status };
    user.todos.push(newTodo);

    await user.save();
    res.status(201).json({ message: "Todo added successfully", newTodo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all Todos for a user
router.get("/getTodos/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await dataModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.todos);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a Todo
router.put("/updateTodo/:userId", async (req, res) => {
  const { userId } = req.params;
  const { todoId, title, status } = req.body;

  try {
    const user = await dataModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const todo = user.todos.find((todo) => todo.todoId === todoId);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    todo.title = title;
    todo.status = status;

    await user.save();
    res.status(200).json({ message: "Todo updated successfully", todo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a Todo
router.delete("/deleteTodo/:userId/:todoId", async (req, res) => {
  const { userId, todoId } = req.params;

  try {
    const user = await dataModel.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.todos = user.todos.filter((todo) => todo.todoId !== todoId);

    await user.save();
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
