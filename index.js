const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

// setup Objection
require("./db");

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: true
  })
);

const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/product.js');

async function main() {
    // if the requested url
    // begins with '/', send it
    // to the landingRoutes router
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});