// Include the express router
const router = require('express').Router();
const Link = require('../models/link');

const isAuthenticated = (req, res, next) => {
    if (req.session.currentUser) {
      return next()
    } else {
      res.redirect('/sessions/new')
    }
  }

const isAuthorized = (req, res, next) => {
    if (req.session.currentUser.role === 'Admin') {
      return next()
    } else {
        message = 'You are not authorized';
      res.redirect('/contacts')
    }
};  

// Delete contact
router.delete('/:id', isAuthorized, async (req, res) => {
    const id = req.params.id;
    await Link.findByIdAndRemove(id, (error) => {
        if (error) res.send(error);
        res.redirect('/links');
    });
});


// Index
router.get('/', isAuthenticated, async (req, res) => {
    let links = await Link.find({});
    res.render('links/index', {
        links,
    });
});

// New Form to enter link
router.get('/new', isAuthenticated, (req, res) => {
    res.render('links/new.ejs');
});

// Create a link
router.post('/', isAuthenticated, async (req, res) => {
    let link = await Link.create(req.body);
    res.redirect('/links');
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
    const id = req.params.id;
    await Link.findById(id, (error, foundLink) => {
        if (error) res.send(error)
        res.render('links/edit.ejs', {
            link: foundLink,
        })
    });
})

// Update the link to db
router.put('/:id', isAuthorized, async (req, res) => {
    const id = req.params.id;
    const updatedLink = req.body;
    await Link.findByIdAndUpdate(id, updatedLink, (error) => {
        if (error) res.send(error);
        res.redirect('/links');
    });
});

module.exports = router;