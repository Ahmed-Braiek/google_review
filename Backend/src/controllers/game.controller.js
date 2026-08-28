const pool = require('../config/database');

// CREATE GAME
exports.createGame = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            store_id,
            name,
            type,
            title,
            description,
            active
        } = req.body;

        if (!store_id || !name) {
            return res.status(400).json({
                success: false,
                message: 'store_id and name are required'
            });
        }

        const allowedTypes = ['wheel', 'scratch', 'slot'];

        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid game type'
            });
        }

        // Verify store belongs to logged tenant
        const [stores] = await pool.query(
            `
            SELECT id
            FROM stores
            WHERE id = ?
            AND tenant_id = ?
            AND status = 'active'
            LIMIT 1
            `,
            [store_id, tenantId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO games (
                tenant_id,
                store_id,
                name,
                type,
                title,
                description,
                active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                tenantId,
                store_id,
                name,
                type || 'wheel',
                title || null,
                description || null,
                active === undefined ? true : Boolean(active)
            ]
        );

        const [games] = await pool.query(
            `
            SELECT *
            FROM games
            WHERE id = ?
            AND tenant_id = ?
            `,
            [result.insertId, tenantId]
        );

        return res.status(201).json({
            success: true,
            message: 'Game created successfully',
            data: games[0]
        });

    } catch (error) {
        console.error('Create game error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// GET ALL GAMES
exports.getGames = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const { store_id } = req.query;

        let query = `
            SELECT
                g.*,
                s.name AS store_name,
                s.slug AS store_slug
            FROM games g
            INNER JOIN stores s ON s.id = g.store_id
            WHERE g.tenant_id = ?
        `;

        const params = [tenantId];

        if (store_id) {
            query += ` AND g.store_id = ?`;
            params.push(store_id);
        }

        query += ` ORDER BY g.id DESC`;

        const [games] = await pool.query(query, params);

        return res.json({
            success: true,
            count: games.length,
            data: games
        });

    } catch (error) {
        console.error('Get games error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// GET ONE GAME
exports.getGameById = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const gameId = req.params.id;

        const [games] = await pool.query(
            `
            SELECT
                g.*,
                s.name AS store_name,
                s.slug AS store_slug
            FROM games g
            INNER JOIN stores s ON s.id = g.store_id
            WHERE g.id = ?
            AND g.tenant_id = ?
            LIMIT 1
            `,
            [gameId, tenantId]
        );

        if (games.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        return res.json({
            success: true,
            data: games[0]
        });

    } catch (error) {
        console.error('Get game error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// UPDATE GAME
exports.updateGame = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const gameId = req.params.id;

        const {
            store_id,
            name,
            type,
            title,
            description,
            active
        } = req.body;

        const [games] = await pool.query(
            `
            SELECT *
            FROM games
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [gameId, tenantId]
        );

        if (games.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const current = games[0];

        const newStoreId = store_id ?? current.store_id;

        // Verify store still belongs to tenant
        const [stores] = await pool.query(
            `
            SELECT id
            FROM stores
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [newStoreId, tenantId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const allowedTypes = ['wheel', 'scratch', 'slot'];

        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid game type'
            });
        }

        await pool.query(
            `
            UPDATE games
            SET
                store_id = ?,
                name = ?,
                type = ?,
                title = ?,
                description = ?,
                active = ?
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                newStoreId,
                name ?? current.name,
                type ?? current.type,
                title ?? current.title,
                description ?? current.description,
                active === undefined ? current.active : Boolean(active),
                gameId,
                tenantId
            ]
        );

        const [updatedGames] = await pool.query(
            `
            SELECT *
            FROM games
            WHERE id = ?
            AND tenant_id = ?
            `,
            [gameId, tenantId]
        );

        return res.json({
            success: true,
            message: 'Game updated successfully',
            data: updatedGames[0]
        });

    } catch (error) {
        console.error('Update game error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// DELETE GAME
exports.deleteGame = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const gameId = req.params.id;

        const [result] = await pool.query(
            `
            DELETE FROM games
            WHERE id = ?
            AND tenant_id = ?
            `,
            [gameId, tenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        return res.json({
            success: true,
            message: 'Game deleted successfully'
        });

    } catch (error) {
        console.error('Delete game error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};