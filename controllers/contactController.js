const router = require('express').Router();
// Include the module
const { Contact, Child } = require('../models/contact');

// New
router.get('/new', (req, res) => {
    res.render('contacts/new.ejs');
});

// Create a new contact
router.post('/', (req, res) => {
    res.send(req.body);
});

module.exports = router;