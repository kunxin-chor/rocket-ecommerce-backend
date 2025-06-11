const express = require("express");
const ejs = require("ejs");
const expressEjsLayouts = require("express-ejs-layouts");
require("dotenv").config();

// setup Objection
require("./db");

// create an instance of express app
let app = express();

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

// enable json
app.use(express.json());

const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/product.js');
const userRoutes = require('./routes/user.js');
const cloudinaryRoutes = require('./routes/cloudinary.js');
const reviewRoutes = require('./routes/review.js');

const session = require('./sessions/index.js');
const globalMiddlewares = require('./global-middlewares/index.js');


session(app);
globalMiddlewares(app);

app.use('/', landingRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/cloudinary', cloudinaryRoutes);
app.use('/reviews', reviewRoutes);



app.listen(3000, () => {
  console.log("Server has started");
});