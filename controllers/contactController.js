const router = require('express').Router();
// Include the module
const { Contact, Child } = require('../models/contact');

// Index
router.get('/', async (req, res) => {
    await Contact.find({}, (err, allContacts) => {
        res.render('contacts/index.ejs', {
            contacts: allContacts,
        })
    })
})

// New Form to enter contact
router.get('/new', (req, res) => {
    res.render('contacts/new.ejs');
});

// Show Contact Detail
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    await Contact.findById(id, (error, foundContact) => {
        if (error) res.send(error)
        res.render('contacts/show.ejs', {
            contact: foundContact,
        })
    });
});

// Create a new contact
router.post('/', async (req, res) => {
    let contact = await Contact.create(req.body);
    res.redirect('/contacts');
});

// Edit page
router.get('/:id/edit', async (req, res) => {
    const id = req.params.id;
    await Contact.findById(id, (error, foundContact) => {
        if (error) res.send(error)
        res.render('contacts/edit.ejs', {
            contact: foundContact,
        })
    });
})

// Update the contact to db
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedContact = req.body;
    await Contact.findByIdAndUpdate(id, updatedContact, (error) => {
        if (error) res.send(error);
        res.redirect('/contacts');
    });
});

// Delete contact
router.delete('/:id',  async (req, res) => {
    const id = req.params.id;
    await Contact.findByIdAndRemove(id, (error) => {
        if (error) res.send(error);
        res.redirect('/contacts');
    });
});

// Create Child Embedded in Contact
router.post('/:contactId/children', async (req, res) => {
    console.log(req.body);
    const newChild = new Child(
        { 
            name: req.body.name,
            age: req.body.age
        });
    await Contact.findById(req.params.contactId, (error, foundContact) => {
        foundContact.children.push(newChild);
        console.log(foundContact.children);
        foundContact.save((err, updatedContact) => {
            res.redirect(`/contacts/${updatedContact.id}`);
        });
    });
});

// Delete child embedded in contact
router.delete('/:contactId/children/:childId', (req, res) => {
    const contactId = req.params.contactId;
    const childId = req.params.childId;
    console.log('Delete Child ' + contactId + ', childId: ' + childId);

    Contact.findById(contactId, (error, foundContact) => {
        // find child embedded in contact
        foundContact.children.id(childId).remove();
        // update contact with the removed child
        foundContact.save((error, savedContact) => {
            res.redirect(`/contacts/${savedContact.id}`);
        });
    });
});

// Edit Child Form - edit child embedded in a contact
router.get('/:contactId/children/:childId/edit', (req, res) => {
    const contactId = req.params.contactId;
    const childId = req.params.childId;

    // find contact by contact id
    Contact.findById(contactId, (error, foundContact) => {
        // find child embedded in contact
        const foundChild = foundContact.children.id(childId);
        // edit child's detail in the edit form
        res.render('contacts/edit-child.ejs', { 
            contact: foundContact, 
            child: foundChild,
        });
    });
});

// Update child embedded in a contact
router.put('/:contactId/children/:childId', (req, res) => {
    const contactId = req.params.contactId;
    const childId = req.params.childId;
    const childName = req.body.name;
    const childAge = req.body.age;

    console.log('childName: ' + childName);

    // find contact by contact id
    Contact.findById(contactId, (error, foundContact) => {
        // find child embedded in contact
        const foundChild = foundContact.children.id(childId);
        foundChild.name = childName;
        foundChild.age = childAge;
        foundContact.save((error, savedContact) => {
            res.redirect(`/contacts/${foundContact.id}`);
        })
    });
});

module.exports = router;