const pool = require('../config/database');
const bcrypt = require('bcryptjs');


// ============================================
// GET ALL USERS
// ============================================

exports.getUsers = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const [users] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE tenant_id = ?
            ORDER BY id DESC
            `,
            [tenantId]
        );

        return res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('Get users error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// ============================================
// GET ONE USER
// ============================================

exports.getUserById = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.params.id;

        const [users] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [
                userId,
                tenantId
            ]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// ============================================
// CREATE USER
// ============================================

exports.createUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            name,
            email,
            password,
            role
        } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'name, email, password and role are required'
            });
        }

        const allowedRoles = [
            'manager',
            'cashier'
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        const [existingUsers] = await pool.query(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const [result] = await pool.query(
            `
            INSERT INTO users (
                tenant_id,
                name,
                email,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'active')
            `,
            [
                tenantId,
                name,
                email,
                hashedPassword,
                role
            ]
        );

        const [users] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                result.insertId,
                tenantId
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: users[0]
        });

    } catch (error) {
        console.error('Create user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// ============================================
// UPDATE USER
// ============================================

exports.updateUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.params.id;

        const {
            name,
            email,
            password,
            role,
            status
        } = req.body;

        const [users] = await pool.query(
            `
            SELECT *
            FROM users
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [
                userId,
                tenantId
            ]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const currentUser = users[0];

        // prevent owner from editing another owner
        if (currentUser.role === 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Owner account cannot be modified here'
            });
        }

        const allowedRoles = [
            'manager',
            'cashier'
        ];

        if (
            role !== undefined &&
            !allowedRoles.includes(role)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const allowedStatuses = [
            'active',
            'inactive'
        ];

        if (
            status !== undefined &&
            !allowedStatuses.includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        if (email && email !== currentUser.email) {
            const [existingEmail] = await pool.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                AND id != ?
                LIMIT 1
                `,
                [
                    email,
                    userId
                ]
            );

            if (existingEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        let newPassword = currentUser.password;

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must contain at least 8 characters'
                });
            }

            newPassword = await bcrypt.hash(
                password,
                10
            );
        }

        await pool.query(
            `
            UPDATE users
            SET
                name = ?,
                email = ?,
                password = ?,
                role = ?,
                status = ?
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                name ?? currentUser.name,
                email ?? currentUser.email,
                newPassword,
                role ?? currentUser.role,
                status ?? currentUser.status,
                userId,
                tenantId
            ]
        );

        const [updatedUsers] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                userId,
                tenantId
            ]
        );

        return res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUsers[0]
        });

    } catch (error) {
        console.error('Update user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// ============================================
// DELETE / DEACTIVATE USER
// ============================================

exports.deleteUser = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const userId = req.params.id;

        // Prevent deleting yourself
        if (Number(userId) === Number(req.user.userId)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
        }

        const [users] = await pool.query(
            `
            SELECT *
            FROM users
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [
                userId,
                tenantId
            ]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (users[0].role === 'owner') {
            return res.status(403).json({
                success: false,
                message: 'Owner account cannot be deactivated here'
            });
        }

        // Soft delete
        await pool.query(
            `
            UPDATE users
            SET status = 'inactive'
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                userId,
                tenantId
            ]
        );

        return res.json({
            success: true,
            message: 'User deactivated successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};