const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact').Contact;

// Index
router.get('/', (req, res) => {
    Organization.find({}, (err, allOrgs) => {
        res.render('organizations/index.ejs', {
            organizations: allOrgs,
        })
    })
})

// New - Form to enter new organization
router.get('/new', (req, res) => {
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
    let foundOrg = await Organization.findById(id).populate('contacts');

    res.render('organizations/show.ejs', {
        organization: foundOrg,
    });
});

// Edit page
router.get('/:id/edit', async (req, res) => {
    const id = req.params.id;
    let foundOrg = await Organization.findById(id).populate('contacts');

    res.render('organizations/edit.ejs', {
        organization: foundOrg,
    });
});

// Update the organization to db
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedOrg = req.body;
    await Organization.findByIdAndUpdate(id, updatedOrg, (error) => {
        if (error) res.send(error);
        res.redirect('/organizations');
    });
});

// Show contacts that can add to organization
router.get('/:id/contacts/new', async (req, res) => {
    const id = req.params.id;
    let allContacts = await Contact.find({});


    let foundOrg = await Organization.findById(id).populate('contacts');
   // let foundOrg = await Organization.findById(id).populate('contact', 'firstName').exec();
   console.log(foundOrg)

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
router.put('/:id/contacts', async (req, res) => {
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


module.exports = router;