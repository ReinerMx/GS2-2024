const express = require('express');
const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
    res.json({ message: 'STAC API Root' });
});

// Conformance endpoint
router.get('/conformance', (req, res) => {
    res.json({
        conformsTo: [
            'https://api.stacspec.org/v1.0.0-beta.2/core',
            'https://api.stacspec.org/v1.0.0-beta.2/ogcapi-features',
        ],
    });
});

// Collections
router.get('/collections', async (req, res) => {
    const collections = await Collection.findAll(); 
    res.json({ collections });
});

router.get('/collections/:collection_id', async (req, res) => {
    const collection = await Collection.findOne({ where: { collection_id: req.params.collection_id } });
    if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(collection);
});

// Items in a collection
router.get('/collections/:collection_id/items', async (req, res) => {
    const items = await Item.findAll({ where: { collection_id: req.params.collection_id } });
    res.json({ items });
});

router.get('/collections/:collection_id/items/:item_id', async (req, res) => {
    const item = await Item.findOne({
        where: { collection_id: req.params.collection_id, item_id: req.params.item_id },
    });
    if (!item) {
        return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
});

// Queryables
router.get('/queryables', (req, res) => {
    res.json({ message: 'Queryables for all collections not implemented' });
});

router.get('/queryables/collections/:collection_id/queryables', (req, res) => {
    res.json({ message: 'Queryables for a specific collection not implemented' });
});

// Search endpoint (GET and POST)
router.get('/search', (req, res) => {
    res.json({ message: 'Search via GET not implemented' });
});

router.post('/search', (req, res) => {
    res.json({ message: 'Search via POST not implemented' });
});

module.exports = router;
