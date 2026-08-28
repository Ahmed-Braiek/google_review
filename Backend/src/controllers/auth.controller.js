const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const [users] = await pool.query(
            `
            SELECT id, tenant_id, name, email, password, role, status
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = users[0];

        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'User account is inactive'
            });
        }

        const passwordIsValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenant_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    tenant_id: user.tenant_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

exports.me = async (req, res) => {
    try {
        const [users] = await pool.query(
            `
            SELECT id, tenant_id, name, email, role, status, created_at
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
            [req.user.userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Me error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};