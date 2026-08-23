const pool = require('../config/database');


// GET COUPON DETAILS
exports.getCoupon = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const { code } = req.params;

        const [coupons] = await pool.query(
            `
            SELECT
                c.id,
                c.code,
                c.status,
                c.expires_at,
                c.used_at,
                c.store_id,
                c.participation_id,
                c.prize_id,

                p.name AS prize_name,
                p.description AS prize_description,

                s.name AS store_name,

                cu.first_name AS customer_name,
                cu.email AS customer_email,
                cu.phone AS customer_phone

            FROM coupons c

            INNER JOIN prizes p
                ON p.id = c.prize_id

            INNER JOIN stores s
                ON s.id = c.store_id

            INNER JOIN participations pa
                ON pa.id = c.participation_id

            INNER JOIN customers cu
                ON cu.id = pa.customer_id

            WHERE c.code = ?
            AND c.tenant_id = ?

            LIMIT 1
            `,
            [
                code,
                tenantId
            ]
        );

        if (coupons.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        const coupon = coupons[0];

        const now = new Date();

        let validity = 'valid';

        if (coupon.status === 'used') {
            validity = 'used';
        }

        else if (
            coupon.expires_at &&
            new Date(coupon.expires_at) < now
        ) {
            validity = 'expired';
        }

        return res.json({
            success: true,
            data: {
                ...coupon,
                validity
            }
        });

    } catch (error) {
        console.error('Get coupon error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// VALIDATE COUPON
exports.validateCoupon = async (req, res) => {

    let connection;

    try {
        const tenantId = req.user.tenantId;

        const {
            code,
            store_id
        } = req.body;

        if (!code || !store_id) {
            return res.status(400).json({
                success: false,
                message: 'code and store_id are required'
            });
        }

        connection = await pool.getConnection();

        await connection.beginTransaction();


        // Verify store belongs to tenant
        const [stores] = await connection.query(
            `
            SELECT id, name
            FROM stores
            WHERE id = ?
            AND tenant_id = ?
            AND status = 'active'
            LIMIT 1
            `,
            [
                store_id,
                tenantId
            ]
        );

        if (stores.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }


        // Lock coupon row while validating
        const [coupons] = await connection.query(
            `
            SELECT
                c.*,
                p.name AS prize_name,
                p.description AS prize_description
            FROM coupons c

            INNER JOIN prizes p
                ON p.id = c.prize_id

            WHERE c.code = ?
            AND c.tenant_id = ?

            LIMIT 1

            FOR UPDATE
            `,
            [
                code,
                tenantId
            ]
        );

        if (coupons.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        const coupon = coupons[0];


        // Coupon must belong to same store
        if (Number(coupon.store_id) !== Number(store_id)) {

            await connection.rollback();

            return res.status(403).json({
                success: false,
                message: 'Coupon does not belong to this store'
            });
        }


        // Already used
        if (coupon.status === 'used') {

            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: 'Coupon has already been used',
                used_at: coupon.used_at
            });
        }


        // Already expired status
        if (coupon.status === 'expired') {

            await connection.rollback();

            return res.status(410).json({
                success: false,
                message: 'Coupon has expired'
            });
        }


        // Check date expiration
        if (
            coupon.expires_at &&
            new Date(coupon.expires_at) < new Date()
        ) {

            await connection.query(
                `
                UPDATE coupons
                SET status = 'expired'
                WHERE id = ?
                `,
                [coupon.id]
            );

            await connection.commit();

            return res.status(410).json({
                success: false,
                message: 'Coupon has expired'
            });
        }


        // Mark as used
        await connection.query(
            `
            UPDATE coupons
            SET
                status = 'used',
                used_at = NOW()
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                coupon.id,
                tenantId
            ]
        );


        await connection.commit();


        return res.json({
            success: true,
            message: 'Coupon validated successfully',

            data: {
                coupon_id: coupon.id,
                code: coupon.code,

                prize: {
                    id: coupon.prize_id,
                    name: coupon.prize_name,
                    description:
                        coupon.prize_description
                },

                store: {
                    id: stores[0].id,
                    name: stores[0].name
                },

                status: 'used',
                used_at: new Date()
            }
        });

    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error(
            'Validate coupon error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    } finally {

        if (connection) {
            connection.release();
        }
    }
};