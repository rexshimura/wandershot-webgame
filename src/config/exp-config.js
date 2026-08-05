export const EXP_TIERS = [
  { color: '#45abc4', value: 1 },
  { color: '#45c491', value: 3 },
  { color: '#9ec445', value: 5 },
  { color: '#c47845', value: 8 },
  { color: '#c44545', value: 12 },
  { color: '#c44589', value: 20 },
];

// Helper to determine EXP needed for a given level
export function getExpForNextLevel(level) {
  // Base 10 EXP for level 2, scaling up per level
  return Math.floor(10 * Math.pow(1.3, level - 1));
}

// Spawns appropriate color-coded EXP orbs matching total value
export function createExpOrbs(x, y, totalExpValue) {
  const orbs = [];
  let remaining = totalExpValue;

  // Pick largest value tiers first
  for (let i = EXP_TIERS.length - 1; i >= 0; i--) {
    const tier = EXP_TIERS[i];
    while (remaining >= tier.value) {
      orbs.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        radius: 6,
        color: tier.color,
        value: tier.value,
        speed: 0,
      });
      remaining -= tier.value;
    }
  }
  return orbs;
}