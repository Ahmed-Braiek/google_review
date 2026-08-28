const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const prizeController = require('../controllers/prize.controller');

router.use(authMiddleware);

router.post('/', prizeController.createPrize);

router.get(
    '/game/:gameId',
    prizeController.getPrizesByGame
);

router.put(
    '/:id',
    prizeController.updatePrize
);

router.delete(
    '/:id',
    prizeController.deletePrize
);

module.exports = router;