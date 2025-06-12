const express = require("express");
const ejs = require("ejs");
const expressEjsLayouts = require("express-ejs-layouts");
require("dotenv").config();

// setup Objection
require("./db");

// create an instance of express app
let app = express();

// --- Stripe Webhook requires raw request, so we place it before any request altering middlewares ---
const stripeWebhookRouter = require('./routes/web/stripeWebhook');
app.use('/stripe', stripeWebhookRouter); // Handles only POST /stripe/process_payment
// ---------------------------------------------------------------

// set the view engine
app.set("view engine", "ejs");

// static folder
app.use(express.static("public"));

// setup express-ejs-layouts
app.use(expressEjsLayouts);
app.set("layout", "layouts/layout");

const apiRouter = require('./routes/api');
const webRouter = require('./routes/web');

// Mount API routes (stateless, express.json() at router level)
app.use('/api', apiRouter);

// Mount Web (dynamic page) routes (sessions, forms, global middlewares at router level)
app.use('/', webRouter);

app.listen(3000, () => {
  console.log("Server has started");
});