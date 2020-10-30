const router = require('express').Router();
// Include the module
const { Contact, Child } = require('../models/contact');

// New
router.get('/new', (req, res) => {
    res.render('contacts/new.ejs');
});

// Create a new contact
router.post('/', async (req, res) => {
    let contact = await Contact.create(req.body);
    // Test only: to verify if id and timestamp are generated as indication of successful insert in db
    res.send(contact)
});

module.exports = router;