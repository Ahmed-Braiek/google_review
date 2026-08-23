const pool = require('../config/database');

// CREATE STORE
exports.createStore = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            name,
            slug,
            address,
            phone,
            google_review_url,
            logo_url,
            primary_color
        } = req.body;

        if (!name || !slug) {
            return res.status(400).json({
                success: false,
                message: 'Name and slug are required'
            });
        }

        const [existing] = await pool.query(
            `
            SELECT id
            FROM stores
            WHERE slug = ?
            LIMIT 1
            `,
            [slug]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Slug already exists'
            });
        }

        const [result] = await pool.query(
            `
            INSERT INTO stores (
                tenant_id,
                name,
                slug,
                address,
                phone,
                google_review_url,
                logo_url,
                primary_color,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
            `,
            [
                tenantId,
                name,
                slug,
                address || null,
                phone || null,
                google_review_url || null,
                logo_url || null,
                primary_color || '#000000'
            ]
        );

        const [stores] = await pool.query(
            `
            SELECT *
            FROM stores
            WHERE id = ? AND tenant_id = ?
            LIMIT 1
            `,
            [result.insertId, tenantId]
        );

        return res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: stores[0]
        });

    } catch (error) {
        console.error('Create store error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// GET ALL STORES
exports.getStores = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const [stores] = await pool.query(
            `
            SELECT *
            FROM stores
            WHERE tenant_id = ?
            ORDER BY id DESC
            `,
            [tenantId]
        );

        return res.json({
            success: true,
            count: stores.length,
            data: stores
        });

    } catch (error) {
        console.error('Get stores error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// GET ONE STORE
exports.getStoreById = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const storeId = req.params.id;

        const [stores] = await pool.query(
            `
            SELECT *
            FROM stores
            WHERE id = ? AND tenant_id = ?
            LIMIT 1
            `,
            [storeId, tenantId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        return res.json({
            success: true,
            data: stores[0]
        });

    } catch (error) {
        console.error('Get store error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// UPDATE STORE
exports.updateStore = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const storeId = req.params.id;

        const {
            name,
            slug,
            address,
            phone,
            google_review_url,
            logo_url,
            primary_color,
            status
        } = req.body;

        const [stores] = await pool.query(
            `
            SELECT *
            FROM stores
            WHERE id = ? AND tenant_id = ?
            LIMIT 1
            `,
            [storeId, tenantId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const current = stores[0];

        if (slug && slug !== current.slug) {
            const [existingSlug] = await pool.query(
                `
                SELECT id
                FROM stores
                WHERE slug = ? AND id != ?
                LIMIT 1
                `,
                [slug, storeId]
            );

            if (existingSlug.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Slug already exists'
                });
            }
        }

        await pool.query(
            `
            UPDATE stores
            SET
                name = ?,
                slug = ?,
                address = ?,
                phone = ?,
                google_review_url = ?,
                logo_url = ?,
                primary_color = ?,
                status = ?
            WHERE id = ? AND tenant_id = ?
            `,
            [
                name ?? current.name,
                slug ?? current.slug,
                address ?? current.address,
                phone ?? current.phone,
                google_review_url ?? current.google_review_url,
                logo_url ?? current.logo_url,
                primary_color ?? current.primary_color,
                status ?? current.status,
                storeId,
                tenantId
            ]
        );

        const [updatedStores] = await pool.query(
            `
            SELECT *
            FROM stores
            WHERE id = ? AND tenant_id = ?
            `,
            [storeId, tenantId]
        );

        return res.json({
            success: true,
            message: 'Store updated successfully',
            data: updatedStores[0]
        });

    } catch (error) {
        console.error('Update store error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// DELETE STORE
exports.deleteStore = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const storeId = req.params.id;

        const [result] = await pool.query(
            `
            DELETE FROM stores
            WHERE id = ? AND tenant_id = ?
            `,
            [storeId, tenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        return res.json({
            success: true,
            message: 'Store deleted successfully'
        });

    } catch (error) {
        console.error('Delete store error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};