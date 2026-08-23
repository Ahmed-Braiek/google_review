const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const storeController = require('../controllers/store.controller');

router.use(authMiddleware);

router.post('/', storeController.createStore);

router.get('/', storeController.getStores);

router.get('/:id', storeController.getStoreById);

router.put('/:id', storeController.updateStore);

router.delete('/:id', storeController.deleteStore);

module.exports = router;