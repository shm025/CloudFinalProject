const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory store (fine for a course project demo)
let todos = [];

// GET all todos
router.get('/', (req, res) => {
  res.json(todos);
});

// GET single todo
router.get('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo);
});

// POST create todo
router.post('/', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// PATCH toggle complete
router.patch('/:id', (req, res) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  todo.completed = !todo.completed;
  res.json(todo);
});

// DELETE todo
router.delete('/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });

  todos.splice(index, 1);
  res.status(204).send();
});

// Expose getter for tests to reset state
const getTodos = () => todos;
const resetTodos = () => { todos = []; };

module.exports = { router, getTodos, resetTodos };
