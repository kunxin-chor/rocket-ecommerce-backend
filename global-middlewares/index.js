const User = require("../models/User");
const csrf = require("csurf");

const setupGlobalMiddlewares = (app) => {
    app.use(async (req, res, next) => {
        if (req.session.userId) {
            const user = await User.query().findById(req.session.userId);
            res.locals.user = user;
        }
        next();
    })

    const csurfInstance = csrf();
    app.use(function(req, res, next){
        if (req.url === '/stripe/process_payment') {
            return next();
        }
        csurfInstance(req, res, next);
    })

    app.use((req, res, next) => {
        if (req.csrfToken) {
            res.locals.csrfToken = req.csrfToken();
        }
        next();
    })

    // handle CSRF errors
    app.use((err, req, res, next) => {
        if (err.code === "EBADCSRFTOKEN") {
            req.flash("error", "CSRF token is invalid");
            return  res.redirect(req.get('Referrer') || '/')
        }
        next();
    })
}

module.exports = setupGlobalMiddlewares