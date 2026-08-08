export const ENEMY_TYPES = {
  PITCHLING: {
    name: 'Pitchling',
    maxHp: 60,
    speed: 55, // slow movement
    radius: 14,
    spriteScale: 2.5,
    barWidth: 20,
    contactDamage: 15,
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
    maxHp: 80,
    speed: 130, // fast movement
    radius: 12,
    spriteScale: 3.0,
    barWidth: 24,
    contactDamage: 4,
    attackInterval: 1000,
    behavior: 'ERRATIC', // Added erratic behavior flag
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