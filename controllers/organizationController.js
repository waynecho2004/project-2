const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact').Contact;
const { getListQuery, regexFilter, withTotals, sortHref } = require('../lib/listQuery');

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
    const listQuery = getListQuery(req.query, {
      basePath: '/organizations',
      defaultSort: 'name',
      allowedSorts: ['name', 'description'],
    });
    const filter = regexFilter(listQuery.q, ['name', 'description']);
    const total = await Organization.countDocuments(filter);
    const list = withTotals(listQuery, total);
    if (listQuery.page > list.pages) return res.redirect(list.href);
    const organizations = await Organization.find(filter)
      .select('name description')
      .sort(list.sort)
      .skip(list.skip)
      .limit(list.limit)
      .lean();
    res.render('organizations/index.ejs', {
      organizations,
      list,
      sortHref: (field) => sortHref(list, field),
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
    const foundOrg = await Organization.findById(req.params.id)
      .select('name description contacts')
      .populate({
        path: 'contacts',
        select: 'firstName lastName phone',
        options: { sort: { firstName: 1, lastName: 1 } },
      })
      .lean();
    if (!foundOrg) return res.send('Organization not found');
    foundOrg.contacts = foundOrg.contacts || [];
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
    const foundOrg = await Organization.findById(req.params.id)
      .select('name description contacts')
      .populate({
        path: 'contacts',
        select: 'firstName lastName phone',
        options: { sort: { firstName: 1, lastName: 1 } },
      })
      .lean();
    if (!foundOrg) return res.send('Organization not found');
    foundOrg.contacts = foundOrg.contacts || [];
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
    const foundOrg = await Organization.findById(req.params.id)
      .select('name contacts')
      .lean();
    if (!foundOrg) return res.send('Organization not found');

    const existingIds = foundOrg.contacts || [];
    const [existingContacts, filteredContacts] = await Promise.all([
      Contact.find({ _id: { $in: existingIds } })
        .select('firstName lastName phone')
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
      Contact.find({ _id: { $nin: existingIds } })
        .select('firstName lastName')
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
    ]);
    foundOrg.contacts = existingContacts;

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
    const newContacts = (Array.isArray(req.body.contacts) ? req.body.contacts : [req.body.contacts]).filter(Boolean);
    if (newContacts.length > 0) {
      await Organization.updateOne(
        { _id: req.params.id },
        { $push: { contacts: { $each: newContacts } } }
      );
    }
    res.redirect(`/organizations/${req.params.id}`);
  } catch (error) {
    res.send(error);
  }
});

// Show contacts that can be removed from organization
router.get('/:id/contacts/remove', isAuthorized, async (req, res) => {
  try {
    const foundOrg = await Organization.findById(req.params.id)
      .select('name contacts')
      .populate({
        path: 'contacts',
        select: 'firstName lastName',
        options: { sort: { firstName: 1, lastName: 1 } },
      })
      .lean();
    if (!foundOrg) return res.send('Organization not found');
    foundOrg.contacts = foundOrg.contacts || [];
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
    const contactsForRemoval = (Array.isArray(req.body.contacts) ? req.body.contacts : [req.body.contacts]).filter(Boolean);
    if (contactsForRemoval.length > 0) {
      await Organization.updateOne(
        { _id: req.params.id },
        { $pull: { contacts: { $in: contactsForRemoval } } }
      );
    }
    res.redirect(`/organizations/${req.params.id}`);
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
