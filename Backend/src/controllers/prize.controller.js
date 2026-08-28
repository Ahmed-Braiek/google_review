const pool = require('../config/database');

async function getGameForTenant(gameId, tenantId) {
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

    return games[0] || null;
}


// CREATE PRIZE
exports.createPrize = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;

        const {
            game_id,
            name,
            description,
            probability,
            coupon_prefix,
            active
        } = req.body;

        if (!game_id || !name || probability === undefined) {
            return res.status(400).json({
                success: false,
                message: 'game_id, name and probability are required'
            });
        }

        const probabilityNumber = Number(probability);

        if (
            Number.isNaN(probabilityNumber) ||
            probabilityNumber < 0 ||
            probabilityNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Probability must be between 0 and 100'
            });
        }

        const game = await getGameForTenant(game_id, tenantId);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const prizeActive = active === undefined ? true : Boolean(active);

        // Check total probability only for active prizes
        if (prizeActive) {
            const [totals] = await pool.query(
                `
                SELECT COALESCE(SUM(probability), 0) AS total
                FROM prizes
                WHERE game_id = ?
                AND tenant_id = ?
                AND active = 1
                `,
                [game_id, tenantId]
            );

            const currentTotal = Number(totals[0].total);

            if (currentTotal + probabilityNumber > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Total active prize probability cannot exceed 100%',
                    current_total: currentTotal,
                    attempted_total: currentTotal + probabilityNumber
                });
            }
        }

        const [result] = await pool.query(
            `
            INSERT INTO prizes (
                tenant_id,
                store_id,
                game_id,
                name,
                description,
                probability,
                coupon_prefix,
                active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                tenantId,
                game.store_id,
                game_id,
                name,
                description || null,
                probabilityNumber,
                coupon_prefix || null,
                prizeActive
            ]
        );

        const [prizes] = await pool.query(
            `
            SELECT *
            FROM prizes
            WHERE id = ?
            AND tenant_id = ?
            `,
            [result.insertId, tenantId]
        );

        return res.status(201).json({
            success: true,
            message: 'Prize created successfully',
            data: prizes[0]
        });

    } catch (error) {
        console.error('Create prize error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// GET PRIZES BY GAME
exports.getPrizesByGame = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const gameId = req.params.gameId;

        const game = await getGameForTenant(gameId, tenantId);

        if (!game) {
            return res.status(404).json({
                success: false,
                message: 'Game not found'
            });
        }

        const [prizes] = await pool.query(
            `
            SELECT *
            FROM prizes
            WHERE game_id = ?
            AND tenant_id = ?
            ORDER BY id ASC
            `,
            [gameId, tenantId]
        );

        const totalProbability = prizes
            .filter(prize => Number(prize.active) === 1)
            .reduce(
                (sum, prize) => sum + Number(prize.probability),
                0
            );

        return res.json({
            success: true,
            count: prizes.length,
            total_active_probability: totalProbability,
            probability_complete: totalProbability === 100,
            data: prizes
        });

    } catch (error) {
        console.error('Get prizes error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// UPDATE PRIZE
exports.updatePrize = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const prizeId = req.params.id;

        const {
            name,
            description,
            probability,
            coupon_prefix,
            active
        } = req.body;

        const [prizes] = await pool.query(
            `
            SELECT *
            FROM prizes
            WHERE id = ?
            AND tenant_id = ?
            LIMIT 1
            `,
            [prizeId, tenantId]
        );

        if (prizes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Prize not found'
            });
        }

        const current = prizes[0];

        const newProbability =
            probability === undefined
                ? Number(current.probability)
                : Number(probability);

        if (
            Number.isNaN(newProbability) ||
            newProbability < 0 ||
            newProbability > 100
        ) {
            return res.status(400).json({
                success: false,
                message: 'Probability must be between 0 and 100'
            });
        }

        const newActive =
            active === undefined
                ? Boolean(current.active)
                : Boolean(active);

        if (newActive) {
            const [totals] = await pool.query(
                `
                SELECT COALESCE(SUM(probability), 0) AS total
                FROM prizes
                WHERE game_id = ?
                AND tenant_id = ?
                AND active = 1
                AND id != ?
                `,
                [
                    current.game_id,
                    tenantId,
                    prizeId
                ]
            );

            const otherTotal = Number(totals[0].total);

            if (otherTotal + newProbability > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Total active prize probability cannot exceed 100%',
                    current_other_total: otherTotal,
                    attempted_total: otherTotal + newProbability
                });
            }
        }

        await pool.query(
            `
            UPDATE prizes
            SET
                name = ?,
                description = ?,
                probability = ?,
                coupon_prefix = ?,
                active = ?
            WHERE id = ?
            AND tenant_id = ?
            `,
            [
                name ?? current.name,
                description ?? current.description,
                newProbability,
                coupon_prefix ?? current.coupon_prefix,
                newActive,
                prizeId,
                tenantId
            ]
        );

        const [updated] = await pool.query(
            `
            SELECT *
            FROM prizes
            WHERE id = ?
            AND tenant_id = ?
            `,
            [prizeId, tenantId]
        );

        return res.json({
            success: true,
            message: 'Prize updated successfully',
            data: updated[0]
        });

    } catch (error) {
        console.error('Update prize error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


// DELETE PRIZE
exports.deletePrize = async (req, res) => {
    try {
        const tenantId = req.user.tenantId;
        const prizeId = req.params.id;

        const [result] = await pool.query(
            `
            DELETE FROM prizes
            WHERE id = ?
            AND tenant_id = ?
            `,
            [prizeId, tenantId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Prize not found'
            });
        }

        return res.json({
            success: true,
            message: 'Prize deleted successfully'
        });

    } catch (error) {
        console.error('Delete prize error:', error);

        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};