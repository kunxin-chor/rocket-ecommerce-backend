const checkIfAuthenticated = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to view this page');
        res.redirect('/users/login');
    } else {
        next();
    }
}

module.exports = {
    checkIfAuthenticated
}