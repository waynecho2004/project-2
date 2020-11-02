const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact');

// New - Form to enter new organization
router.get('/new', (req, res) => {
    res.render('organizations/new.ejs');
});

// Create new Organiation
router.post('/', async (req, res) => {
    let organization = await Organization.create(req.body);
    res.redirect('/organizations');
});

module.exports = router;