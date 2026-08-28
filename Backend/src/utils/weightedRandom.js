function weightedRandom(prizes) {
    if (!Array.isArray(prizes) || prizes.length === 0) {
        return null;
    }

    const activePrizes = prizes.filter(
        prize =>
            Number(prize.active) === 1 &&
            Number(prize.probability) > 0
    );

    if (activePrizes.length === 0) {
        return null;
    }

    const totalWeight = activePrizes.reduce(
        (sum, prize) => sum + Number(prize.probability),
        0
    );

    if (totalWeight <= 0) {
        return null;
    }

    let random = Math.random() * totalWeight;

    for (const prize of activePrizes) {
        random -= Number(prize.probability);

        if (random <= 0) {
            return prize;
        }
    }

    return activePrizes[activePrizes.length - 1];
}

module.exports = weightedRandom;