const bcrypt = require('bcrypt');
const router = require('express').Router();
const User = require('../models/user.js');

// Form to enter new user info
router.get('/new', (req, res) => {
  res.render('users/new.ejs', {
    layout: 'layout-guest',
  });
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
    req.body.password = hashedPassword;
    const createdUser = await User.create(req.body);
    console.log('User is created', createdUser);
    res.redirect('/sessions/new');
  } catch (error) {
    console.error(error);
    res.send('Error creating user');
  }
});

module.exports = router;
