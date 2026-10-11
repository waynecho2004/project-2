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

const linkListPopulate = {
  path: 'links',
  select: 'title url',
  options: { sort: { title: 1 } },
};

async function findCategoriesByType(type) {
  const categories = await LinkCategory.find({ type })
    .select('name links')
    .sort({ name: 1 })
    .populate(linkListPopulate)
    .lean();
  categories.forEach((category) => {
    category.links = category.links || [];
  });
  return categories;
}

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
  try {
    const categories = await findCategoriesByType('link');
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
    const foundCategory = await LinkCategory.findById(req.params.id)
      .select('name description type links')
      .populate(linkListPopulate)
      .lean();
    if (!foundCategory) return res.send('Category not found');
    foundCategory.links = foundCategory.links || [];
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
    const foundCategory = await LinkCategory.findById(req.params.id)
      .select('name links')
      .lean();
    if (!foundCategory) return res.send('Category not found');

    const existingIds = foundCategory.links || [];
    const [existingLinks, filteredLinks] = await Promise.all([
      Link.find({ _id: { $in: existingIds } })
        .select('title url')
        .sort({ title: 1 })
        .lean(),
      Link.find({ _id: { $nin: existingIds } })
        .select('title')
        .sort({ title: 1 })
        .lean(),
    ]);
    foundCategory.links = existingLinks;

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
    const newLinks = (Array.isArray(req.body.links) ? req.body.links : [req.body.links]).filter(Boolean);
    if (newLinks.length > 0) {
      await LinkCategory.updateOne(
        { _id: req.params.id },
        { $push: { links: { $each: newLinks } } }
      );
    }

    res.redirect('/links/categories');
  } catch (error) {
    res.send(error);
  }
});

// Show links that can be removed from a category
router.get('/:id/links/remove', isAuthorized, async (req, res) => {
  try {
    const foundCategory = await LinkCategory.findById(req.params.id)
      .select('name links')
      .populate({
        path: 'links',
        select: 'title',
        options: { sort: { title: 1 } },
      })
      .lean();
    if (!foundCategory) return res.send('Category not found');
    foundCategory.links = foundCategory.links || [];

    res.render('links/category-remove-links.ejs', { category: foundCategory });
  } catch (error) {
    res.send(error);
  }
});

// Remove links from category
router.delete('/:id/links', isAuthorized, async (req, res) => {
  try {
    const linksForRemoval = (Array.isArray(req.body.links) ? req.body.links : [req.body.links]).filter(Boolean);
    if (linksForRemoval.length > 0) {
      await LinkCategory.updateOne(
        { _id: req.params.id },
        { $pull: { links: { $in: linksForRemoval } } }
      );
    }

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
    try {
        const categories = await findCategoriesByType('documentation');
        res.render('links/category-index', {
            categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
