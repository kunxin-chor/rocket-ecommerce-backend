const session = require('express-session');
const { ConnectSessionKnexStore } = require('connect-session-knex');
const flash = require('connect-flash');
const knex = require('../db');

const setupSession = (app) => {
    // Create the session store using the documented class
    const store = new ConnectSessionKnexStore({
        knex: knex,
        tablename: 'sessions',
        createtable: false, // We already created the table
        cleanupInterval: 15 * 60 * 1000 // Clean expired sessions every 15 minutes
    });

    app.use(session({
        secret: process.env.SESSION_SECRET,
        store,
        resave: false,
        saveUninitialized: false, // recommended by the example
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        }
    }));

    app.use(flash());

    // Register session middleware
    app.use((req, res, next) => {
        res.locals.success_messages = req.flash("success");
        res.locals.error_messages = req.flash("error");
        next();
    });
};

module.exports = setupSession;
