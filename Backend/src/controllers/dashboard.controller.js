const pool = require('../config/database');

exports.getStats = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const { store_id } = req.query;

        if (store_id) {
                const [stores] = await pool.query(
                    `
                    SELECT id
                    FROM stores
                    WHERE id = ?
                    AND tenant_id = ?
                    LIMIT 1
                    `,
                    [
                        store_id,
                        tenantId
                    ]
                );

                if (stores.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Store not found'
                    });
                }
            }

        const storeFilter = store_id ? ' AND store_id = ? ' : '';
        const params = store_id
            ? [tenantId, store_id]
            : [tenantId];

        // STORES
        const [storesRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM stores
            WHERE tenant_id = ?
            ${store_id ? 'AND id = ?' : ''}
            `,
            params
        );

        // GAMES
        const [gamesRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM games
            WHERE tenant_id = ?
            ${storeFilter}
            `,
            params
        );

        // CUSTOMERS
        const [customersRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM customers
            WHERE tenant_id = ?
            ${storeFilter}
            `,
            params
        );

        // PARTICIPATIONS
        const [participationsRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM participations
            WHERE tenant_id = ?
            ${storeFilter}
            `,
            params
        );

        // TODAY
        const [todayRows] = await pool.query(
            `
            SELECT COUNT(*) AS total
            FROM participations
            WHERE tenant_id = ?
            ${storeFilter}
            AND DATE(played_at) = CURDATE()
            `,
            params
        );

        // COUPONS
        const [couponRows] = await pool.query(
            `
            SELECT
                COUNT(*) AS total,
                SUM(status = 'active') AS active,
                SUM(status = 'used') AS used,
                SUM(status = 'expired') AS expired
            FROM coupons
            WHERE tenant_id = ?
            ${storeFilter}
            `,
            params
        );

        const totalCoupons = Number(couponRows[0].total || 0);
        const usedCoupons = Number(couponRows[0].used || 0);

        const redemptionRate =
            totalCoupons > 0
                ? Number(
                    ((usedCoupons / totalCoupons) * 100).toFixed(2)
                )
                : 0;

        // TOP PRIZES
        let topPrizeSql = `
            SELECT
                p.id,
                p.name,
                COUNT(pa.id) AS wins
            FROM participations pa
            INNER JOIN prizes p
                ON p.id = pa.prize_id
            WHERE pa.tenant_id = ?
        `;

        const topPrizeParams = [tenantId];

        if (store_id) {
            topPrizeSql += ` AND pa.store_id = ?`;
            topPrizeParams.push(store_id);
        }

        topPrizeSql += `
            GROUP BY p.id, p.name
            ORDER BY wins DESC
            LIMIT 5
        `;

        const [topPrizes] = await pool.query(
            topPrizeSql,
            topPrizeParams
        );

        // ACTIVITY BY STORE
        const [storeActivity] = await pool.query(
            `
            SELECT
                s.id,
                s.name,
                COUNT(pa.id) AS participations
            FROM stores s
            LEFT JOIN participations pa
                ON pa.store_id = s.id
                AND pa.tenant_id = s.tenant_id
            WHERE s.tenant_id = ?
            ${store_id ? 'AND s.id = ?' : ''}
            GROUP BY s.id, s.name
            ORDER BY participations DESC
            `,
            params
        );

        // LAST 7 DAYS
        let sevenDaysSql = `
            SELECT
                DATE(played_at) AS date,
                COUNT(*) AS participations
            FROM participations
            WHERE tenant_id = ?
            AND played_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        `;

        const sevenDaysParams = [tenantId];

        if (store_id) {
            sevenDaysSql += ` AND store_id = ?`;
            sevenDaysParams.push(store_id);
        }

        sevenDaysSql += `
            GROUP BY DATE(played_at)
            ORDER BY date ASC
        `;

        const [last7Days] = await pool.query(
            sevenDaysSql,
            sevenDaysParams
        );

        return res.json({
            success: true,
            data: {
                filters: {
                    store_id: store_id || null
                },

                overview: {
                    total_stores: Number(storesRows[0].total || 0),
                    total_games: Number(gamesRows[0].total || 0),
                    total_customers: Number(customersRows[0].total || 0),
                    total_participations: Number(
                        participationsRows[0].total || 0
                    ),
                    today_participations: Number(
                        todayRows[0].total || 0
                    )
                },

                coupons: {
                    total: totalCoupons,
                    active: Number(couponRows[0].active || 0),
                    used: usedCoupons,
                    expired: Number(couponRows[0].expired || 0),
                    redemption_rate: redemptionRate
                },

                top_prizes: topPrizes.map(row => ({
                    id: row.id,
                    name: row.name,
                    wins: Number(row.wins)
                })),

                stores: storeActivity.map(row => ({
                    id: row.id,
                    name: row.name,
                    participations: Number(row.participations)
                })),

                last_7_days: last7Days.map(row => ({
                    date: row.date,
                    participations: Number(row.participations)
                }))
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};