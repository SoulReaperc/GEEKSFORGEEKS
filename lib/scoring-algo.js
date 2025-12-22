/**
 * Calculates the score for a submission based on runtime and test case results.
 * 
 * @param {boolean} allPassed - Whether all test cases passed
 * @param {number} runtimeMs - The runtime execution time in milliseconds
 * @param {number} basePoints - Base points for the problem (default 100)
 * @returns {number} - The calculated score
 */
export function calculateScore(allPassed, runtimeMs, basePoints = 100) {
    if (!allPassed) return 0;

    // Minimum runtime to avoid division by zero or excessive points for 0ms
    const effectiveRuntime = Math.max(runtimeMs, 10);

    // Bonus based on speed. Faster = More points.
    // Logic: Base + (1000 / effectiveRuntime) * Multiplier
    // Example: 
    // 100ms -> 100 + (1000/100)*2 = 120
    // 50ms -> 100 + (1000/50)*2 = 140
    // 1000ms -> 100 + (1000/1000)*2 = 102

    // Cap bonus to avoid breaking leaderboard
    const speedBonus = Math.min((1000 / effectiveRuntime) * 5, 50);

    return Math.floor(basePoints + speedBonus);
}
