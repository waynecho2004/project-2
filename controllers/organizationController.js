const router = require('express').Router();
const Organization = require('../models/organization');
const Contact = require('../models/contact');

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
    await Organization.findById(id, (error, foundOrganization) => {
        if (error) res.send(error)
        res.render('organizations/show.ejs', {
            organization: foundOrganization,
        })
    });
});

module.exports = router;