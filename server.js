// Created: 11/2020
//___________________
//Dependencies
//___________________
require('dotenv').config()
const express = require('express');
const methodOverride  = require('method-override');
const mongoose = require ('mongoose');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session')

//___________________
//Configuration
//___________________
const app = express ();
const db = mongoose.connection;

//___________________
//Port
//___________________
// Allow use of Heroku's port or your own local port, depending on the environment
const PORT = process.env.PORT || 3000;

//___________________
//Database
//___________________
// How to connect to the database either via heroku or locally
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/'+ 'ga-project2';

// Connect to Mongo
mongoose.connect(
    MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
    () => {
      console.log('the connection with mongod is established at', MONGODB_URI)
    }
  )

// Error / success
db.on('error', (err) => console.log(err.message + ' is Mongod not running?'));
db.on('connected', () => console.log('mongo connected: ', MONGODB_URI));
db.on('disconnected', () => console.log('mongo disconnected'));
// open the connection to mongo
db.on('open' , ()=>{});

//___________________
//Middleware
//___________________
app.use(
  session({
    secret: process.env.SECRET, //a random string do not copy this value or your stuff will get hacked
    resave: false, // default more info: https://www.npmjs.com/package/express-session#resave
    saveUninitialized: false // default  more info: https://www.npmjs.com/package/express-session#resave
  })
)
//use public folder for static assets
app.use(express.static('public'));
// populates req.body with parsed info from forms - if no data from forms will return an empty object {}
app.use(express.urlencoded({ extended: false }));// extended: false - does not allow nested objects in query strings
app.use(express.json());// returns middleware that only parses JSON - may or may not need it depending on your project
//use method override
app.use(methodOverride('_method'));// allow POST, PUT and DELETE from a form
//use ejs layout
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Include controllers
app.use('/contacts', require('./controllers/contactController'));
app.use('/organizations', require('./controllers/organizationController'));
app.use('/users', require('./controllers/userController.js'));
app.use('/sessions', require('./controllers/sessionController.js'));
app.use('/links', require('./controllers/linkController.js'));
app.use('/links/categories', require('./controllers/linkCategoryController'));

//___________________
// Routes
//___________________
//localhost:3000
/*
app.get('/' , (req, res) => {
  res.send('Hello World!');
});
*/

app.get('/', (req, res) => {
  res.render('home.ejs', 
  { 
      currentUser: req.session.currentUser, 
      layout: "layout-guest"
  });
})

//___________________
//Listener
//___________________
app.listen(PORT, () => console.log( 'Listening on port:', PORT));