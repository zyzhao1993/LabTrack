require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./db/connect');
connectDB();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const todoItemRoutes = require('./routes/todos');
app.use('/api/todos', todoItemRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



