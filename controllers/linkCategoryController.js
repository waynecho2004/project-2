const router = require('express').Router();
const LinkCategory = require('../models/linkCategory');
const Link = require('../models/link');

const isAuthenticated = (req, res, next) => {
  if (req.session.currentUser) {
    return next();
  } else {
    res.redirect('/sessions/new');
  }
};

const isAuthorized = (req, res, next) => {
  if (req.session.currentUser.role === 'Admin') {
    return next();
  } else {
    message = 'You are not authorized';
    res.redirect('/links');
  }
};

// Index
router.get('/', isAuthenticated, async (req, res) => {
  console.log('linkCategoryController - index page');
  try {
    const categories = await LinkCategory.find({ type: 'link' })
      .sort({ name: 'asc' })
      .populate({
        path: 'links',
        options: { sort: { title: 1 } },
      });
    res.render('links/category-index', { categories });
  } catch (error) {
    res.send(error);
  }
});

// New Form to enter category
router.get('/new', isAuthenticated, (req, res) => {
  console.log('linkCategoryController - new');
  res.render('links/category-new.ejs');
});

// Create a linkCategory
router.post('/', isAuthenticated, async (req, res) => {
  try {
    await LinkCategory.create(req.body);
    res.redirect('/links/categories');
  } catch (error) {
    res.send(error);
  }
});

// Edit page
router.get('/:id/edit', isAuthorized, async (req, res) => {
  try {
    const foundCategory = await LinkCategory.findById(req.params.id).populate({
      path: 'links',
      options: { sort: { title: 1 } },
    });
    res.render('links/category-edit.ejs', { category: foundCategory });
  } catch (error) {
    res.send(error);
  }
});

// Update the category to db
router.put('/:id', isAuthorized, async (req, res) => {
  try {
    await LinkCategory.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/links/categories');
  } catch (error) {
    res.send(error);
  }
});

// Show links that can add to category
router.get('/:id/links/new', isAuthorized, async (req, res) => {
  try {
    const allLinks = await Link.find({});
    const foundCategory = await LinkCategory.findById(req.params.id).populate({
      path: 'links',
      options: { sort: { title: 1 } },
    });

    // filter to find available links not associated with this category
    const existingLinkIds = foundCategory.links.map((e) => e._id.toString());
    const filteredLinks = allLinks.filter(
      (link) => !existingLinkIds.includes(link._id.toString())
    );

    res.render('links/category-add-links.ejs', {
      category: foundCategory,
      links: filteredLinks,
    });
  } catch (error) {
    res.send(error);
  }
});

// Add links to category
router.put('/:id/links', isAuthorized, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const newlinks = req.body.links;

    await LinkCategory.findByIdAndUpdate(
      categoryId,
      {
        $push: {
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
  try {
    const foundCategory = await LinkCategory.findById(req.params.id).populate({
      path: 'links',
      options: { sort: { title: 1 } },
    });

    res.render('links/category-remove-links.ejs', { category: foundCategory });
  } catch (error) {
    res.send(error);
  }
});

// Remove links from category
router.delete('/:id/links', isAuthorized, async (req, res) => {
  try {
    const categoryId = req.params.id;
    const linksForRemoval = Array.isArray(req.body.links)
      ? req.body.links
      : [req.body.links]; // ensure array

    const foundCategory = await LinkCategory.findById(categoryId).populate({
      path: 'links',
      options: { sort: { title: 1 } },
    });

    const existingLinkIds = foundCategory.links.map((e) => e._id.toString());

    // Filter out the links to be removed
    const filteredLinks = existingLinkIds.filter((id) => !linksForRemoval.includes(id));

    foundCategory.links = filteredLinks;
    await foundCategory.save();

    res.redirect('/links/categories');
  } catch (error) {
    res.send(error);
  }
});

// Delete Organization and all associated contacts
router.delete('/:id', isAuthorized, async (req, res) => {
  try {
    await LinkCategory.findByIdAndRemove(req.params.id);
    res.redirect('/links/categories');
  } catch (error) {
    res.send(error);
  }
});

// Index for Documentation
router.get('/docs', isAuthorized, async (req, res) => {
    console.log('documentation page');
    try {
        const categories = await LinkCategory.find({ type: 'documentation' })
            .sort({ name: 'asc' })
            .populate({
                path: 'links',
                options: { sort: { title: 1 } },
            });

        res.render('links/category-index', {
            categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
