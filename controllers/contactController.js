const router = require('express').Router();
// Include the module
const { Contact, Child } = require('../models/contact');

// Index
router.get('/', (req, res) => {
    Contact.find({}, (err, allContacts) => {
        res.render('contacts/index.ejs', {
            contacts: allContacts,
        })
    })
})

// New
router.get('/new', (req, res) => {
    res.render('contacts/new.ejs');
});

// Create a new contact
router.post('/', async (req, res) => {
    let contact = await Contact.create(req.body);
    res.redirect('/contacts');
});

module.exports = router;