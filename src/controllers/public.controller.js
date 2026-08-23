const pool = require('../config/database');

const weightedRandom = require('../utils/weightedRandom');
const generateCouponCode = require('../utils/couponGenerator');


// ============================================
// GET PUBLIC STORE
// ============================================

exports.getPublicStore = async (req, res) => {
    try {
        const { slug } = req.params;

        const [stores] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                name,
                slug,
                address,
                phone,
                google_review_url,
                logo_url,
                primary_color,
                status
            FROM stores
            WHERE slug = ?
            AND status = 'active'
            LIMIT 1
            `,
            [slug]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const store = stores[0];

        const [games] = await pool.query(
            `
            SELECT
                id,
                name,
                type,
                title,
                description
            FROM games
            WHERE store_id = ?
            AND tenant_id = ?
            AND active = 1
            ORDER BY id DESC
            LIMIT 1
            `,
            [
                store.id,
                store.tenant_id
            ]
        );

        if (games.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active game found for this store'
            });
        }

        const game = games[0];

        const [prizes] = await pool.query(
            `
            SELECT
                id,
                name,
                description,
                probability
            FROM prizes
            WHERE game_id = ?
            AND tenant_id = ?
            AND active = 1
            ORDER BY id ASC
            `,
            [
                game.id,
                store.tenant_id
            ]
        );

        return res.json({
            success: true,

            data: {
                store: {
                    id: store.id,
                    name: store.name,
                    slug: store.slug,
                    address: store.address,
                    phone: store.phone,
                    logo_url: store.logo_url,
                    primary_color: store.primary_color
                },

                game: {
                    id: game.id,
                    name: game.name,
                    type: game.type,
                    title: game.title,
                    description: game.description,

                    prizes: prizes.map(prize => ({
                        id: prize.id,
                        name: prize.name,
                        description: prize.description
                    }))
                }
            }
        });

    } catch (error) {
        console.error('Public store error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// ============================================
// PLAY GAME
// ============================================

exports.playGame = async (req, res) => {

    let connection;

    try {

        const { slug } = req.params;

        const {
            first_name,
            email,
            phone,
            marketing_optin
        } = req.body;

        if (!first_name) {
            return res.status(400).json({
                success: false,
                message: 'first_name is required'
            });
        }

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone is required'
            });
        }

        connection = await pool.getConnection();

        await connection.beginTransaction();


        // =====================================
        // STORE
        // =====================================

        const [stores] = await connection.query(
            `
            SELECT *
            FROM stores
            WHERE slug = ?
            AND status = 'active'
            LIMIT 1
            `,
            [slug]
        );

        if (stores.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const store = stores[0];


        // =====================================
        // GAME
        // =====================================

        const [games] = await connection.query(
            `
            SELECT *
            FROM games
            WHERE store_id = ?
            AND tenant_id = ?
            AND active = 1
            ORDER BY id DESC
            LIMIT 1
            `,
            [
                store.id,
                store.tenant_id
            ]
        );

        if (games.length === 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: 'No active game available'
            });
        }

        const game = games[0];


        // =====================================
        // PRIZES
        // =====================================

        const [prizes] = await connection.query(
            `
            SELECT *
            FROM prizes
            WHERE game_id = ?
            AND store_id = ?
            AND tenant_id = ?
            AND active = 1
            AND probability > 0
            ORDER BY id ASC
            `,
            [
                game.id,
                store.id,
                store.tenant_id
            ]
        );

        if (prizes.length === 0) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: 'No prizes configured'
            });
        }


        // =====================================
        // CHECK PROBABILITY
        // =====================================

        const totalProbability = prizes.reduce(
            (sum, prize) =>
                sum + Number(prize.probability),
            0
        );

        if (Math.abs(totalProbability - 100) > 0.01) {

            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: 'Game probabilities must total 100%',
                total_probability: totalProbability
            });
        }


        // =====================================
        // CUSTOMER
        // =====================================

        let customer = null;

        if (email) {

            const [existingCustomers] =
                await connection.query(
                    `
                    SELECT *
                    FROM customers
                    WHERE store_id = ?
                    AND tenant_id = ?
                    AND email = ?
                    LIMIT 1
                    `,
                    [
                        store.id,
                        store.tenant_id,
                        email
                    ]
                );

            if (existingCustomers.length > 0) {
                customer = existingCustomers[0];
            }
        }


        if (!customer && phone) {

            const [existingCustomers] =
                await connection.query(
                    `
                    SELECT *
                    FROM customers
                    WHERE store_id = ?
                    AND tenant_id = ?
                    AND phone = ?
                    LIMIT 1
                    `,
                    [
                        store.id,
                        store.tenant_id,
                        phone
                    ]
                );

            if (existingCustomers.length > 0) {
                customer = existingCustomers[0];
            }
        }


        if (!customer) {

            const [customerResult] =
                await connection.query(
                    `
                    INSERT INTO customers (
                        tenant_id,
                        store_id,
                        first_name,
                        email,
                        phone,
                        marketing_optin
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [
                        store.tenant_id,
                        store.id,
                        first_name,
                        email || null,
                        phone || null,
                        Boolean(marketing_optin)
                    ]
                );

            customer = {
                id: customerResult.insertId,
                first_name,
                email: email || null,
                phone: phone || null
            };

        } else {

            await connection.query(
                `
                UPDATE customers
                SET
                    first_name = ?,
                    marketing_optin = ?
                WHERE id = ?
                AND tenant_id = ?
                `,
                [
                    first_name,
                    Boolean(marketing_optin),
                    customer.id,
                    store.tenant_id
                ]
            );
        }


        // =====================================
        // 30 DAY PARTICIPATION LIMIT
        // =====================================

        const [recentParticipations] =
            await connection.query(
                `
                SELECT
                    id,
                    played_at,
                    DATE_ADD(played_at, INTERVAL 30 DAY) AS next_play_at
                FROM participations
                WHERE customer_id = ?
                AND store_id = ?
                AND tenant_id = ?
                AND played_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                ORDER BY played_at DESC
                LIMIT 1
                `,
                [
                    customer.id,
                    store.id,
                    store.tenant_id
                ]
            );

        if (recentParticipations.length > 0) {

            await connection.rollback();

            return res.status(429).json({
                success: false,
                message: 'You have already participated this month',
                next_play_available_in: '30 days',
                next_play_at: recentParticipations[0].next_play_at
            });
        }


        // =====================================
        // WINNER
        // =====================================

        const winner = weightedRandom(prizes);

        if (!winner) {

            await connection.rollback();

            return res.status(500).json({
                success: false,
                message: 'Unable to select prize'
            });
        }


        // =====================================
        // PARTICIPATION
        // =====================================

        const ipAddress =
            req.headers['x-forwarded-for']?.split(',')[0]
                ?.trim()
            ||
            req.socket.remoteAddress
            ||
            null;

        const userAgent =
            req.headers['user-agent'] || null;


        const [participationResult] =
            await connection.query(
                `
                INSERT INTO participations (
                    tenant_id,
                    store_id,
                    game_id,
                    customer_id,
                    prize_id,
                    ip_address,
                    user_agent
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    store.tenant_id,
                    store.id,
                    game.id,
                    customer.id,
                    winner.id,
                    ipAddress,
                    userAgent
                ]
            );


        // =====================================
        // COUPON
        // =====================================

        let couponCode;
        let couponCreated = false;

        for (let i = 0; i < 5; i++) {

            couponCode = generateCouponCode(
                winner.coupon_prefix
            );

            const [existingCoupons] =
                await connection.query(
                    `
                    SELECT id
                    FROM coupons
                    WHERE code = ?
                    LIMIT 1
                    `,
                    [couponCode]
                );

            if (existingCoupons.length === 0) {
                couponCreated = true;
                break;
            }
        }


        if (!couponCreated) {

            await connection.rollback();

            return res.status(500).json({
                success: false,
                message: 'Unable to generate unique coupon'
            });
        }


        // valid for 30 days
        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 30
        );


        const [couponResult] =
            await connection.query(
                `
                INSERT INTO coupons (
                    tenant_id,
                    store_id,
                    participation_id,
                    prize_id,
                    code,
                    status,
                    expires_at
                )
                VALUES (?, ?, ?, ?, ?, 'active', ?)
                `,
                [
                    store.tenant_id,
                    store.id,
                    participationResult.insertId,
                    winner.id,
                    couponCode,
                    expiresAt
                ]
            );


        await connection.commit();


        // =====================================
        // RESPONSE
        // =====================================

        return res.status(201).json({

            success: true,

            message: 'Congratulations!',

            data: {

                participation_id:
                    participationResult.insertId,

                customer: {
                    id: customer.id,
                    first_name
                },

                store: {
                    id: store.id,
                    name: store.name
                },

                game: {
                    id: game.id,
                    name: game.name,
                    type: game.type
                },

                prize: {
                    id: winner.id,
                    name: winner.name,
                    description: winner.description
                },

                coupon: {
                    id: couponResult.insertId,
                    code: couponCode,
                    status: 'active',
                    expires_at: expiresAt
                },

                google_review_url:
                    store.google_review_url
            }
        });


    } catch (error) {

        if (connection) {
            await connection.rollback();
        }

        console.error('Play game error:', error);

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

exports.trackReviewClick = async (req, res) => {
    try {
        const { slug } = req.params;

        const {
            participation_id
        } = req.body;

        const [stores] = await pool.query(
            `
            SELECT
                id,
                tenant_id,
                google_review_url
            FROM stores
            WHERE slug = ?
            AND status = 'active'
            LIMIT 1
            `,
            [slug]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        const store = stores[0];

        if (!store.google_review_url) {
            return res.status(400).json({
                success: false,
                message: 'Google review URL is not configured'
            });
        }

        let validParticipationId = null;

        if (participation_id) {

            const [participations] = await pool.query(
                `
                SELECT id
                FROM participations
                WHERE id = ?
                AND store_id = ?
                AND tenant_id = ?
                LIMIT 1
                `,
                [
                    participation_id,
                    store.id,
                    store.tenant_id
                ]
            );

            if (participations.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Participation not found'
                });
            }

            validParticipationId =
                participations[0].id;
        }

        if (validParticipationId) {
    const [existingClicks] = await pool.query(
        `
        SELECT id
        FROM review_clicks
        WHERE participation_id = ?
        LIMIT 1
        `,
        [validParticipationId]
    );

    if (existingClicks.length > 0) {
        return res.status(200).json({
            success: true,
            message: 'Review click already tracked',
            data: {
                review_click_id: existingClicks[0].id,
                google_review_url: store.google_review_url
            }
        });
    }
}

        const [result] = await pool.query(
            `
            INSERT INTO review_clicks (
                tenant_id,
                store_id,
                participation_id
            )
            VALUES (?, ?, ?)
            `,
            [
                store.tenant_id,
                store.id,
                validParticipationId
            ]
        );

        return res.status(201).json({
            success: true,
            message: 'Review click tracked successfully',

            data: {
                review_click_id: result.insertId,
                google_review_url:
                    store.google_review_url
            }
        });

    } catch (error) {
        console.error(
            'Track review click error:',
            error
        );

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};