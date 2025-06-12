const express = require('express');
const landingRoutes = require('./landing');
const productRoutes = require('./product');
const userRoutes = require('./user');
const cloudinaryRoutes = require('./cloudinary');
const cartRoutes = require('./cart');
const stripeRoutes = require('./stripe');
const session = require('../../sessions/index');
const globalMiddlewares = require('../../global-middlewares/index');

const httpRouter = express.Router();

// Enable urlencoded for forms
httpRouter.use(express.urlencoded({ extended: true }));

// Apply session and global middlewares
session(httpRouter);
globalMiddlewares(httpRouter);

// Mount HTTP (web) routes
httpRouter.use('/', landingRoutes);
httpRouter.use('/products', productRoutes);
httpRouter.use('/users', userRoutes);
httpRouter.use('/cloudinary', cloudinaryRoutes);
httpRouter.use('/cart', cartRoutes);
httpRouter.use('/stripe', stripeRoutes);

module.exports = httpRouter;
