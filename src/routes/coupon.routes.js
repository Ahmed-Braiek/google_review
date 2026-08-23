const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/auth.middleware');

const couponController =
    require('../controllers/coupon.controller');

    const allowRoles =
    require('../middleware/role.middleware');


router.use(authMiddleware);


router.get(
    '/:code',
    allowRoles(
        'owner',
        'manager',
        'cashier'
    ),
    couponController.getCoupon
);


router.post(
    '/validate',
    allowRoles(
        'owner',
        'manager',
        'cashier'
    ),
    couponController.validateCoupon
);


module.exports = router;