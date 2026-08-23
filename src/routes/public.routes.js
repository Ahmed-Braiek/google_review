const express = require('express');

const router = express.Router();

const publicController =
    require('../controllers/public.controller');

router.get(
    '/store/:slug',
    publicController.getPublicStore
);

router.post(
    '/store/:slug/play',
    publicController.playGame
);

router.post(
    '/store/:slug/review-click',
    publicController.trackReviewClick
);

module.exports = router;