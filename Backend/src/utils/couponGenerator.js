const crypto = require('crypto');

function generateCouponCode(prefix = 'WIN') {
    const cleanPrefix = String(prefix || 'WIN')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 12);

    const randomPart = crypto
        .randomBytes(4)
        .toString('hex')
        .toUpperCase();

    return `${cleanPrefix}-${randomPart}`;
}

module.exports = generateCouponCode;