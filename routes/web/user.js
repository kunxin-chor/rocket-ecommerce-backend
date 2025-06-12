const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { createUserForm, createLoginForm, bootstrapField } = require('../../forms');

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

// GET /users/register - Show registration form
router.get('/register', (req, res) => {
    const userForm = createUserForm();
    res.render('users/register', {
        userForm: userForm.toHTML(bootstrapField)
    });
});

// POST /users/register - Handle registration form submission
router.post('/register', async (req, res) => {
    const userForm = createUserForm();
    userForm.handle(req, {
        success: async (form) => {
            try {
                // Hash the password before saving
                const hashedPassword = await bcrypt.hash(form.data.password, SALT_ROUNDS);
                await User.query().insert({
                    username: form.data.username,
                    email: form.data.email,
                    password: hashedPassword
                });
                req.flash('success', 'User registered successfully');
                res.redirect('/users/login');
            } catch (err) {              
                res.render('users/register', {
                    userForm: form.toHTML(bootstrapField)
                });
            }
        },
        error: (form) => {
            res.render('users/register', {
                userForm: form.toHTML(bootstrapField)
            });
        }
    });
});

router.get('/login', (req, res) => {
    const loginForm = createLoginForm();
    res.render('users/login', {
        loginForm: loginForm.toHTML(bootstrapField)
    });
})

router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        success: async (form) => {
            try {
                const user = await User.query().where('email', form.data.email).first();
                if (!user) {
                    req.flash('error', 'User not found');
                    return res.redirect('/users/login');
                }
                const isPasswordValid = await bcrypt.compare(form.data.password, user.password);
                if (!isPasswordValid) {
                    req.flash('error', 'Invalid password');
                    return res.redirect('/users/login');
                }
                req.session.userId = user.id;
                req.flash('success', 'User logged in successfully');
                res.redirect('/');
            } catch (err) {
                res.render('users/login', {
                    loginForm: form.toHTML(bootstrapField)
                });
            }
        },
        error: (form) => {
            res.render('users/login', {
                loginForm: form.toHTML(bootstrapField)
            });
        }
    });
})

router.get('/profile', async (req, res) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to view your profile');
        res.redirect('/users/login');
    } else {
        const user = await User.query().findById(req.session.userId);
        console.log(user);
        res.render('users/profile', { user });
    }

})

router.get('/logout', (req, res) => {
    req.session.userId = null;
    req.flash('success', 'User logged out successfully');
    res.redirect('/users/login');
})

module.exports = router;
