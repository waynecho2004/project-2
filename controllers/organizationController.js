const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact').Contact;

const isAuthenticated = (req, res, next) => {
    if (req.session.currentUser) {
      return next()
    } else {
      res.redirect('/sessions/new')
    }
};

const isAuthorized = (req, res, next) => {
    if (req.session.currentUser.role === 'Admin') {
      return next()
    } else {
      res.redirect('/organizations')
    }
};

// Index
router.get('/', isAuthenticated, async (req, res) => {
    await Organization.find({}, (err, allOrgs) => {
        res.render('organizations/index.ejs', {
            organizations: allOrgs,
        })
    })
})

// New - Form to enter new organization
router.get('/new', isAuthorized, (req, res) => {
    res.render('organizations/new.ejs');
});

// Create new Organiation
router.post('/', async (req, res) => {
    let organization = await Organization.create(req.body);
    res.redirect('/organizations');
});

// Show Organization Detail
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    let foundOrg = await Organization.findById(id).populate({
        path: 'contacts',
        options: { sort: { ['firstName']: 1} },
    });

    res.render('organizations/show.ejs', {
        organization: foundOrg,
    });
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let foundOrg = await Organization.findById(id).populate({
        path: 'contacts',
        options: { sort: { ['firstName']: 1} },
    });

    res.render('organizations/edit.ejs', {
        organization: foundOrg,
    });
});

// Update the organization to db
router.put('/:id', isAuthorized, async (req, res) => {
    const id = req.params.id;
    const updatedOrg = req.body;
    await Organization.findByIdAndUpdate(id, updatedOrg, (error) => {
        if (error) res.send(error);
        res.redirect('/organizations');
    });
});

// Show contacts that can add to organization
router.get('/:id/contacts/new', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let allContacts = await Contact.find({});
    let foundOrg = await Organization.findById(id).populate({
        path: 'contacts',
        options: { sort: { ['firstName']: 1} },
    });

    // filter to find available contacts not associated with this organization
    let filtedContacts = allContacts.filter(contact => {
        let existingContactIds = foundOrg.contacts.map(e => e._id);
        if (!existingContactIds.includes(contact.id)) {
            return contact;
        }
    });

    res.render('organizations/add-contacts.ejs', {
        organization: foundOrg,
        contacts: filtedContacts,
    });

});

// Add contacts to organization
router.put('/:id/contacts', isAuthorized, async (req, res) => {
    const orgId = req.params.id;
    const newContacts = req.body.contacts;
    
    try {
        let foundOrg = await Organization.findByIdAndUpdate(
            orgId,
            {
            $push: {  // The $push will add new contacts to the list 
                contacts: newContacts,
            },
            },
            { new: true, upsert: true }
        );
        res.redirect(`/organizations/${foundOrg.id}`);
    } catch (error) {
        res.send(error);
    }

});

// Show contacts that can add to organization
router.get('/:id/contacts/remove', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let allContacts = await Contact.find({});
    let foundOrg = await Organization.findById(id).populate({
        path: 'contacts',
        options: { sort: { ['firstName']: 1 } },
    });

    res.render('organizations/remove-contacts.ejs', {
        organization: foundOrg,
    });

});

// Remove contacts from organization
router.delete('/:id/contacts', isAuthorized, async (req, res) => {
    const orgId = req.params.id;
    const contactsForRemoval = req.body.contacts;

    let foundOrg = await Organization.findById(orgId).populate({
        path: 'contacts',
        options: { sort: { ['firstName']: 1} },
    });
    let existingContactIds = foundOrg.contacts.map(e => String(e._id));

    // filter to find available contacts not associated with this organization
    let filtedContacts = existingContactIds.filter(id => {
        if (!contactsForRemoval.includes(id)) {
            return id;
        }
    });

    try {
        let foundOrg = await Organization.findByIdAndUpdate(orgId);
        foundOrg.contacts = filtedContacts;
        foundOrg.save((error, savedOrg) => {
            res.redirect(`/organizations/${foundOrg.id}`);
        });
    } catch (error) {
        res.send(error);
    }


});


module.exports = router;