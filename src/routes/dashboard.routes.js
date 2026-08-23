const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/auth.middleware');

const allowRoles =
    require('../middleware/role.middleware');

const dashboardController =
    require('../controllers/dashboard.controller');

router.use(authMiddleware);

router.get(
    '/stats',
    allowRoles(
        'owner',
        'manager'
    ),
    dashboardController.getStats
);

module.exports = router;