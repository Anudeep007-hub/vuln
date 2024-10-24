const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config');
const router = express.Router();

// Middleware to prevent access to the login page if the user is logged in
const checkNotLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        // User is logged in, redirect based on their role
        if (req.session.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/user');
        }
    }
    next();
};


// Middleware to prevent caching of sensitive pages
const preventBackButtonCache = (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
};

// Login page
router.get('/login', checkNotLoggedIn, preventBackButtonCache, (req, res) => {
    res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log(username, password)
        // const rows = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

        const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
        const rows = await pool.query(query); // This is now vulnerable

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
    req.session.destroy(() => {
        // Invalidate cache to prevent back button issue after logout
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.redirect('/login');
    });
});

module.exports = router;
