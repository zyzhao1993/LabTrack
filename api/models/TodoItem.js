const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const todoItemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    checked: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    order: {
      type: Number,
      default: 0
    }
}, {
    timestamps: true
});

const todoItemModel = model('TodoItem', todoItemSchema);

module.exports = todoItemModel;