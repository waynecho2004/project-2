// Created: 11/2020

//___________________
//Dependencies
//___________________
require("dotenv").config();
const express = require("express");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");

//___________________
//Configuration
//___________________
const app = express();
const db = mongoose.connection;

//___________________
//Port
//___________________
const PORT = process.env.PORT || 3000;

//___________________
//Database URI
//___________________
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ga-project2";

//___________________
//Async DB Connection
//___________________
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");

    // Event listeners (optional)
    db.on("error", (err) => console.log(err.message + " is Mongod not running?"));
    db.on("connected", () => console.log("mongo connected:", MONGODB_URI));
    db.on("disconnected", () => console.log("mongo disconnected"));
    db.on("open", () => {});

    // Start Express server
    app.listen(PORT, () => console.log("Listening on port:", PORT));
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit on connection failure
  }
}

connectDB();

//___________________
//Middleware
//___________________
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(expressLayouts);

// Include controllers
app.use("/contacts", require("./controllers/contactController"));
app.use("/organizations", require("./controllers/organizationController"));
app.use("/users", require("./controllers/userController.js"));
app.use("/sessions", require("./controllers/sessionController.js"));
app.use("/links", require("./controllers/linkController.js"));
app.use("/links/categories", require("./controllers/linkCategoryController"));

//___________________
// Routes
//___________________
app.get("/", (req, res) => {
  res.render("home.ejs", {
    currentUser: req.session.currentUser,
    layout: "layout-guest",
  });
});
