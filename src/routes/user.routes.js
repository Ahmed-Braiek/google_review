const express = require('express');

const router = express.Router();

const authMiddleware =
    require('../middleware/auth.middleware');

const allowRoles =
    require('../middleware/role.middleware');

const userController =
    require('../controllers/user.controller');


router.use(authMiddleware);


// OWNER ONLY

router.get(
    '/',
    allowRoles('owner'),
    userController.getUsers
);

router.post(
    '/',
    allowRoles('owner'),
    userController.createUser
);

router.get(
    '/:id',
    allowRoles('owner'),
    userController.getUserById
);

router.put(
    '/:id',
    allowRoles('owner'),
    userController.updateUser
);

router.delete(
    '/:id',
    allowRoles('owner'),
    userController.deleteUser
);


module.exports = router;