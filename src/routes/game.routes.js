const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const gameController = require('../controllers/game.controller');

router.use(authMiddleware);

router.post('/', gameController.createGame);

router.get('/', gameController.getGames);

router.get('/:id', gameController.getGameById);

router.put('/:id', gameController.updateGame);

router.delete('/:id', gameController.deleteGame);

module.exports = router;