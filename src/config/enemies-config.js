export const ENEMY_TYPES = {
  PITCHLING: {
    name: 'Pitchling',
    maxHp: 9,
    speed: 80,
    radius: 18,          // Collision hitbox size
    spriteScale: 3.0,    // Visual sprite multiplier relative to radius
    barWidth: 24,        // Overhead health bar width in pixels
    contactDamage: 6,
    attackInterval: 1000,
    scoreValue: 5,
    expValue: 2,
    spriteSrc: '/enemies/pitchling/pitchling.gif',
    deathSpriteSrc: '/enemies/pitchling/dead-pitchling.gif',
    coinDropRoll: () => {
      const rand = Math.random();
      if (rand <= 0.3) return 2;
      if (rand <= 0.9) return 1;
      return 0;
    },
  },
  PITCHWALKER: {
    name: 'Pitchwalker',
    maxHp: 6,
    speed: 160,
    radius: 16,          // Collision hitbox size
    spriteScale: 3.5,    // Pitchwalker sprite rendered slightly larger
    barWidth: 28,        // Overhead health bar width
    contactDamage: 8,
    attackInterval: 1000,
    scoreValue: 8,
    expValue: 4,
    spriteSrc: '/enemies/pitchwalker/pitchwalker.gif',
    deathSpriteSrc: '/enemies/pitchwalker/dead-pitchwalker.gif',
    coinDropRoll: () => {
      const rand = Math.random();
      if (rand <= 0.7) return 3;
      if (rand <= 0.9) return 2;
      return 1;
    },
  },
};