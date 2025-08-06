const bcrypt = require('bcrypt');

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.get('/test', async (req, res) => {
    res.json({message: 'API is working!'});
});

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        
        // Find user by username
        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Generate JWT token
 
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return success with token
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

router.post('/register', async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.create({username, password});
        res.json({
            success: true,
            message: 'Registration successful',
            user: {
                id: user._id,
                username: user.username
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});

module.exports = router;