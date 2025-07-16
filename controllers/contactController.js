const router = require('express').Router();
const { Contact, Child } = require('../models/contact');

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
    // you might want to flash or pass this message to UI
    // const message = 'You are not authorized';
    res.redirect('/contacts');
  }
};

// Index
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const allContacts = await Contact.find().sort({ firstName: 'asc' });
    res.render('contacts/index.ejs', { contacts: allContacts });
  } catch (error) {
    res.send(error);
  }
});

// New Form
router.get('/new', isAuthorized, (req, res) => {
  res.render('contacts/new.ejs');
});

// Show Contact Detail
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.id);
    if (!foundContact) return res.send('Contact not found');
    res.render('contacts/show.ejs', { contact: foundContact });
  } catch (error) {
    res.send(error);
  }
});

// Create Contact
router.post('/', isAuthorized, async (req, res) => {
  try {
    await Contact.create(req.body);
    res.redirect('/contacts');
  } catch (error) {
    res.send(error);
  }
});

// Edit Contact Page
router.get('/:id/edit', isAuthorized, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.id);
    if (!foundContact) return res.send('Contact not found');
    res.render('contacts/edit.ejs', { contact: foundContact });
  } catch (error) {
    res.send(error);
  }
});

// Update Contact
router.put('/:id', isAuthorized, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/contacts');
  } catch (error) {
    res.send(error);
  }
});

// Delete Contact
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    await Contact.findByIdAndRemove(req.params.id);
    res.redirect('/contacts');
  } catch (error) {
    res.send(error);
  }
});

// Create Child embedded in Contact
router.post('/:contactId/children', isAuthorized, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.contactId);
    if (!foundContact) return res.send('Contact not found');
    const newChild = new Child({
      name: req.body.name,
      age: req.body.age,
    });
    foundContact.children.push(newChild);
    await foundContact.save();
    res.redirect(`/contacts/${foundContact.id}`);
  } catch (error) {
    res.send(error);
  }
});

// Delete Child embedded in Contact
router.delete('/:contactId/children/:childId', isAuthorized, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.contactId);
    if (!foundContact) return res.send('Contact not found');
    foundContact.children.id(req.params.childId).remove();
    await foundContact.save();
    res.redirect(`/contacts/${foundContact.id}`);
  } catch (error) {
    res.send(error);
  }
});

// Edit Child Form
router.get('/:contactId/children/:childId/edit', isAuthorized, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.contactId);
    if (!foundContact) return res.send('Contact not found');
    const foundChild = foundContact.children.id(req.params.childId);
    res.render('contacts/edit-child.ejs', { contact: foundContact, child: foundChild });
  } catch (error) {
    res.send(error);
  }
});

// Update Child embedded in Contact
router.put('/:contactId/children/:childId', isAuthorized, async (req, res) => {
  try {
    const foundContact = await Contact.findById(req.params.contactId);
    if (!foundContact) return res.send('Contact not found');
    const foundChild = foundContact.children.id(req.params.childId);
    foundChild.name = req.body.name;
    foundChild.age = req.body.age;
    await foundContact.save();
    res.redirect(`/contacts/${foundContact.id}`);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
