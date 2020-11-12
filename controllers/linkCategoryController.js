// Include the express router
const router = require('express').Router();
const LinkCategory = require('../models/linkCategory');
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
      res.redirect('/links')
    }
};  

// Index
router.get('/', isAuthenticated, async (req, res) => {
    await LinkCategory.find().sort( { name: 'asc'}).populate({
        path: 'links',
        options: { sort: { ['title']: 1} },
    }).exec((err, categories) => {
        res.render('links/category-index', {
            categories,
        });
    });
});

// New Form to enter category
router.get('/new', isAuthenticated, (req, res) => {
    res.render('links/category-new.ejs');
});

// Create a linkCategory
router.post('/', isAuthenticated, async (req, res) => {
    let category = await LinkCategory.create(req.body);
    res.redirect('/links/categories');
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let foundCategory = await LinkCategory.findById(id).populate({
        path: 'links',
        options: { sort: { ['title']: 1} },
    });

    res.render('links/category-edit.ejs', {
        category: foundCategory,
    });
});

// Update the category to db
router.put('/:id', isAuthorized, async (req, res) => {
    const id = req.params.id;
    const updatedCategory = req.body;
    await LinkCategory.findByIdAndUpdate(id, updatedCategory, (error) => {
        if (error) res.send(error);
        res.redirect('/links/categories');
    });
});

// Show links that can add to category
router.get('/:id/links/new', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let allLinks = await Link.find({});
    let foundCategory = await LinkCategory.findById(id).populate({
        path: 'links',
        options: { sort: { ['title']: 1} },
    });

    // filter to find available links not associated with this category
    let filteredLinks = allLinks.filter(link => {
        let existingLinkIds = foundCategory.links.map(e => e._id);
        if (!existingLinkIds.includes(link.id)) {
            return link;
        }
    });

    res.render('links/category-add-links.ejs', {
        category: foundCategory,
        links: filteredLinks,
    });

});

// Add links to category
router.put('/:id/links', isAuthorized, async (req, res) => {
    const categoryId = req.params.id;
    const newlinks = req.body.links;
    
    try {
        let foundCategory = await LinkCategory.findByIdAndUpdate(
            categoryId,
            {
            $push: {  // The $push will add new links to the list 
                links: newlinks,
            },
            },
            { new: true, upsert: true }
        );
        res.redirect('/links/categories');
    } catch (error) {
        res.send(error);
    }

});

// Show links that can be removed from a category
router.get('/:id/links/remove', isAuthorized, async (req, res) => {
    const id = req.params.id;
    let foundCategory = await LinkCategory.findById(id).populate({
        path: 'links',
        options: { sort: { ['title']: 1} },
    });

    res.render('links/category-remove-links.ejs', {
        category: foundCategory,
    });

});

// Remove links from category
router.delete('/:id/links', isAuthorized, async (req, res) => {
    const categoryId = req.params.id;
    const linksForRemoval = req.body.links;

    console.log("linksForRemoval: " + linksForRemoval)

    let foundCategory = await LinkCategory.findById(categoryId).populate({
        path: 'links',
        options: { sort: { ['title']: 1} },
    });
    let existingLinkIds = foundCategory.links.map(e => String(e._id));
    console.log("existingLinkIds: " + existingLinkIds)

    // filter to find available links not associated with this category
    let filtedlinks = existingLinkIds.filter(id => {
        if (!linksForRemoval.includes(id)) {
            return id;
        }
    });

    console.log("filtedlinks: " + filtedlinks)

    try {
        foundCategory.links = filtedlinks;
        foundCategory.save((error, savedCategory) => {
            res.redirect('/links/categories');
        });
    } catch (error) {
        res.send(error);
    }

});

// Delete Organization and all associated contacts
router.delete('/:id', isAuthorized, async (req, res) => {
    const id = req.params.id;
    await LinkCategory.findByIdAndRemove(id, (error) => {
        if (error) res.send(error);
        res.redirect('/links/categories');
    });
});

module.exports = router;