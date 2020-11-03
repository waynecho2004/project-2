const bcrypt = require('bcrypt')
const router = require('express').Router();
const User = require('../models/user.js')

// Form to enter new user info
router.get('/new', (req, res) => {
  res.render('users/new.ejs')
})

// Create new user
router.post('/', (req, res) => {
  //overwrite the user password with the hashed password, then pass that in to our database
  req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
  User.create(req.body, (err, createdUser) => {
    console.log('user is created', createdUser)
    res.redirect('/sessions/new');
  })
})

module.exports = router