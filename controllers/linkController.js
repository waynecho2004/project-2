const router = require('express').Router();
const Link = require('../models/link');

const isAuthenticated = (req, res, next) => {
  if (req.session.currentUser) {
    return next();
  } else {
    res.redirect('/sessions/new');
  }
};

const isAuthorized = (req, res, next) => {
  if (req.session.currentUser.role === 'Admin') {
    return next();
  } else {
    message = 'You are not authorized';
    res.redirect('/contacts');
  }
};

// Delete link
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    await Link.findByIdAndRemove(req.params.id);
    res.redirect('/links');
  } catch (error) {
    res.send(error);
  }
});

// Index
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const links = await Link.find({});
    res.render('links/index', { links });
  } catch (error) {
    res.send(error);
  }
});

// New Form to enter link
router.get('/new', isAuthenticated, (req, res) => {
  res.render('links/new.ejs');
});

// Create a link
router.post('/', isAuthenticated, async (req, res) => {
  try {
    await Link.create(req.body);
    res.redirect('/links');
  } catch (error) {
    res.send(error);
  }
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
  try {
    const foundLink = await Link.findById(req.params.id);
    res.render('links/edit.ejs', { link: foundLink });
  } catch (error) {
    res.send(error);
  }
});

// Update the link in db
router.put('/:id', isAuthorized, async (req, res) => {
  try {
    await Link.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/links');
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
