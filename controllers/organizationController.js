const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact').Contact;

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
    res.redirect('/organizations');
  }
};

// Index
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const allOrgs = await Organization.find().sort({ name: 'asc' });
    res.render('organizations/index.ejs', {
      organizations: allOrgs,
    });
  } catch (error) {
    res.send(error);
  }
});

// New - Form to enter new organization
router.get('/new', isAuthorized, (req, res) => {
  res.render('organizations/new.ejs');
});

// Create new Organization
router.post('/', async (req, res) => {
  try {
    await Organization.create(req.body);
    res.redirect('/organizations');
  } catch (error) {
    res.send(error);
  }
});

// Show Organization Detail
router.get('/:id', async (req, res) => {
  try {
    const foundOrg = await Organization.findById(req.params.id).populate({
      path: 'contacts',
      options: { sort: { firstName: 1 } },
    });
    res.render('organizations/show.ejs', {
      organization: foundOrg,
    });
  } catch (error) {
    res.send(error);
  }
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
  try {
    const foundOrg = await Organization.findById(req.params.id).populate({
      path: 'contacts',
      options: { sort: { firstName: 1 } },
    });
    res.render('organizations/edit.ejs', {
      organization: foundOrg,
    });
  } catch (error) {
    res.send(error);
  }
});

// Update the organization in db
router.put('/:id', isAuthorized, async (req, res) => {
  try {
    await Organization.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/organizations');
  } catch (error) {
    res.send(error);
  }
});

// Delete Organization and all associated contacts
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    await Organization.findByIdAndRemove(req.params.id);
    res.redirect('/organizations');
  } catch (error) {
    res.send(error);
  }
});

// Show contacts that can add to organization
router.get('/:id/contacts/new', isAuthorized, async (req, res) => {
  try {
    const allContacts = await Contact.find({});
    const foundOrg = await Organization.findById(req.params.id).populate({
      path: 'contacts',
      options: { sort: { firstName: 1 } },
    });

    const existingContactIds = foundOrg.contacts.map(e => e._id.toString());
    const filteredContacts = allContacts.filter(contact => !existingContactIds.includes(contact._id.toString()));

    res.render('organizations/add-contacts.ejs', {
      organization: foundOrg,
      contacts: filteredContacts,
    });
  } catch (error) {
    res.send(error);
  }
});

// Add contacts to organization
router.put('/:id/contacts', isAuthorized, async (req, res) => {
  try {
    const newContacts = Array.isArray(req.body.contacts) ? req.body.contacts : [req.body.contacts];
    const foundOrg = await Organization.findByIdAndUpdate(
      req.params.id,
      { $push: { contacts: { $each: newContacts } } },
      { new: true }
    );
    res.redirect(`/organizations/${foundOrg.id}`);
  } catch (error) {
    res.send(error);
  }
});

// Show contacts that can be removed from organization
router.get('/:id/contacts/remove', isAuthorized, async (req, res) => {
  try {
    const foundOrg = await Organization.findById(req.params.id).populate({
      path: 'contacts',
      options: { sort: { firstName: 1 } },
    });
    res.render('organizations/remove-contacts.ejs', {
      organization: foundOrg,
    });
  } catch (error) {
    res.send(error);
  }
});

// Remove contacts from organization
router.delete('/:id/contacts', isAuthorized, async (req, res) => {
  try {
    const contactsForRemoval = Array.isArray(req.body.contacts) ? req.body.contacts : [req.body.contacts];
    const foundOrg = await Organization.findById(req.params.id);

    // Remove specified contacts by filtering
    foundOrg.contacts = foundOrg.contacts.filter(contactId => !contactsForRemoval.includes(contactId.toString()));

    await foundOrg.save();
    res.redirect(`/organizations/${foundOrg.id}`);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
