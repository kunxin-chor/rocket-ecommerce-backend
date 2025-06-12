const express = require('express');
const apiRouter = express.Router();

// Apply express.json() to all API routes
apiRouter.use(express.json());

// Mount API routes here
apiRouter.use('/products', require('./products'));

// Placeholder route
apiRouter.get('/', (req, res) => {
  res.json({ message: 'API root placeholder' });
});

module.exports = apiRouter;
