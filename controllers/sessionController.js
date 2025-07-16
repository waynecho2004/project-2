const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/new', (req, res) => {
  res.render('sessions/new.ejs', {
    currentUser: req.session.currentUser,
    layout: 'layout-guest',
  });
});

// Use async function for POST route
router.post('/', async (req, res) => {
  try {
    const foundUser = await User.findOne({ username: req.body.username });
    if (!foundUser) {
      return res.send('<a href="/">Sorry, no user found</a>');
    }

    const passwordMatch = await bcrypt.compare(req.body.password, foundUser.password);
    if (passwordMatch) {
      req.session.currentUser = foundUser;
      console.log(foundUser.role);
      return res.redirect('/contacts');
    } else {
      return res.send('<a href="/">Password does not match</a>');
    }
  } catch (err) {
    console.error(err);
    res.send('Oops, the db had a problem');
  }
});

router.delete('/', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/sessions/new');
  });
});

module.exports = router;
