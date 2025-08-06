console.log('todos.js loaded');
const express = require('express');
const router = express.Router();
const TodoItem = require('../models/TodoItem');
const auth = require('../middleware/auth');

router.get('/test', async (req, res) => {
  res.json({message: 'API is working!'});
});

// get all todo items
router.get('/', auth, async (req, res) => {
    try {
      const todos = await TodoItem.find({ user: req.user.userId })
        .sort({ order: 1 });
      res.json({ success: true, todos });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

// create todo item
router.post('/', auth, async (req, res) => {
    try {
        const { text, order, id } = req.body;
        const todo = await TodoItem.create({
            id: id,
            user: req.user.userId,
            text,
            order: order || 0
    });
    res.json({ success: true, todo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// update todo item text
router.put('/:id/text', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const todo = await TodoItem.findOneAndUpdate(
            { id: req.params.id, user: req.user.userId },
            { text },
            { new: true }
        );
        if (!todo) {
            return res.status(404).json({ success: false, message: 'Todo not found' });
        }
        res.json({ success: true, todo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

// update todo item checked
router.put('/:id/checked', auth, async (req, res) => {
    try {
      const { checked, completedAt } = req.body;
      const todo = await TodoItem.findOneAndUpdate(
        { id: req.params.id, user: req.user.userId },
        { $set: {checked: checked, completedAt: new Date(completedAt) }},
        { new: true }
      );
      console.log('Updated todo:', todo);
      res.json({ success: true, todo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

// update todo item order
router.put('/order', auth, async (req, res) => {
    try {
      const { updates } = req.body; // [{id, order}, {id, order}, ...]
      
      await Promise.all(
        updates.map(({ id, order }) => 
          TodoItem.findOneAndUpdate(
            { id: id, user: req.user.userId },
            { order }
          )
        )
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

// delete todo item
router.delete('/:id', auth, async (req, res) => {
    try {
      await TodoItem.findOneAndDelete({
        id: req.params.id,
        user: req.user.userId
      });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;