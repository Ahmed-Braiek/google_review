const express = require('express');
const router = express.Router();

const pool = require('../config/database');

router.get('/', async (req, res) => {
    try {

        const [rows] = await pool.query(
            'SELECT NOW() AS database_time'
        );

        res.status(200).json({
            success: true,
            message: 'Google Review SaaS API is running',
            database: 'connected',
            database_time: rows[0].database_time
        });

    } catch (error) {

        console.error('Database error:', error);

        res.status(500).json({
            success: false,
            message: 'API is running but database connection failed',
            error: error.message
        });

    }
});

module.exports = router;