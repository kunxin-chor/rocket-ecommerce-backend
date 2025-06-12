const express = require("express");
const ejs = require("ejs");
const expressEjsLayouts = require("express-ejs-layouts");
require("dotenv").config();

// setup Objection
require("./db");

// create an instance of express app
let app = express();

// --- Stripe Webhook requires raw request, so we place it before any request altering middlewares ---
const stripeWebhookRouter = require('./routes/stripeWebhook');
app.use('/stripe', stripeWebhookRouter); // Handles only POST /stripe/process_payment
// ---------------------------------------------------------------

// set the view engine
app.set("view engine", "ejs");

// static folder
app.use(express.static("public"));

// setup express-ejs-layouts
app.use(expressEjsLayouts);
app.set("layout", "layouts/layout");


// enable forms
app.use(
  express.urlencoded({
    extended: true
  })
);

const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/product.js');
const userRoutes = require('./routes/user.js');
const cloudinaryRoutes = require('./routes/cloudinary.js');
const cartRoutes = require('./routes/cart.js');
const stripeRoutes = require('./routes/stripe.js');
const session = require('./sessions/index.js');
const globalMiddlewares = require('./global-middlewares/index.js');

session(app);
globalMiddlewares(app);

// enable express.json() for the following routes...
app.use('/', express.json(), landingRoutes);
app.use('/products', express.json(), productRoutes);
app.use('/users', express.json(), userRoutes);
app.use('/cloudinary', express.json(), cloudinaryRoutes);
app.use('/cart', express.json(), cartRoutes);

// but not this one
app.use('/stripe', stripeRoutes);

app.listen(3000, () => {
  console.log("Server has started");
});