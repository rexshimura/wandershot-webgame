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
  PITCHSTUD: {
    name: 'Pitchstud',
    maxHp: 300,
    speed: 160, // fast movement
    radius: 16,
    spriteScale: 3.0,
    barWidth: 28,
    contactDamage: 25,
    attackInterval: 1000,
    scoreValue: 15,
    expValue: 8,
    spriteSrc: '/enemies/pitchstud/pitchstud.gif',
    deathSpriteSrc: '/enemies/pitchstud/dead-pitchstud.gif',
    coinDropRoll: () => {
      const rand = Math.random();
      if (rand <= 0.8) return 5;
      return 2;
    },
  },
  PITCHCREEP: {
    name: 'Pitchcreep',
    maxHp: 150,
    speed: 180, // fast movement normally
    radius: 14,
    spriteScale: 2.8,
    barWidth: 24,
    contactDamage: 10,
    attackInterval: 1000,
    behavior: 'KITE',
    erratic: true,
    preferredRange: 300,
    shootRange: 550,
    projectileDamage: 20,
    projectileSpeed: 300,
    projectileRadius: 8,
    shootInterval: 2000,
    projectileColor: '#ef4444', // red
    projectileGlowColor: 'rgba(244, 63, 94, 0.6)', // rose-500
    projectileShadowColor: '#9f1239', // rose-900
    scoreValue: 10,
    expValue: 5,
    spriteSrc: '/enemies/pitchcreep/pitchcreep.gif',
    deathSpriteSrc: '/enemies/pitchcreep/dead-pitchcreep.gif',
    coinDropRoll: () => {
      const rand = Math.random();
      if (rand <= 0.5) return 2;
      if (rand <= 0.85) return 1;
      return 0;
    },
  },
};