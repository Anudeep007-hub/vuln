
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(username, password)
        const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        if (rows.length > 0) {
            const user = rows[0];
            console.log(rows)
            const passwordMatch = user.password == password;

            if (passwordMatch) {
                req.session.userId = user.id;
                req.session.role = user.role;

                if (user.role === 'admin') {
                    res.redirect('/admin');
                } else {
                    res.redirect('/user');
                }
            } else {
                res.render('login', { error: 'Incorrect password' });
            }
        } else {
            res.render('login', { error: 'User not found' });
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
