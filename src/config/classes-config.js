export const CLASSES = {
  APPRENTICE: {
    id: 'APPRENTICE',
    name: 'Apprentice',
    weapon: 'Wand',
    maxHp: 100,
    maxMana: 10,
    maxEnergy: 5,
    manaRegen: 1.0, // per second
    energyRegen: 0.5, // per second
    speed: 180,
    
    // Auto attack stats
    attackInterval: 400,
    bulletSpeed: 550,
    bulletDamage: 25,
    bulletRadius: 6,
    bulletRange: 800,
    
    // Skills Cooldowns (in seconds)
    skills: {
      E: { name: 'Mana Orb', cost: { mana: 4, energy: 0 }, cd: 5 },
      F: { name: 'Mana Push', cost: { mana: 4, energy: 0 }, cd: 8 },
      C: { name: 'Mana Gun', cost: { mana: 5, energy: 0 }, cd: 5 },
      X: { name: 'Condensed Mana', cost: { mana: 9, energy: 0 }, cd: 12 },
      Q: { name: 'Dash', cost: { mana: 0, energy: 2 }, cd: 1 },
    }
  },
  SQUIRE: {
    id: 'SQUIRE',
    name: 'Squire',
    weapon: 'Sword',
    maxHp: 150,
    maxMana: 5,
    maxEnergy: 10,
    manaRegen: 0.5,
    energyRegen: 1.0,
    speed: 200,

    // Melee attack stats
    attackInterval: 300, // Slash cooldown
    bulletDamage: 35, // Base slash damage
    heavyDamageMult: 2.5, // Heavy swing damage multiplier
    
    // Skills Cooldowns (in seconds)
    skills: {
      E: { name: 'Courage Buff', cost: { mana: 0, energy: 3 }, cd: 10 },
      C: { name: 'Sword Spin', cost: { mana: 0, energy: 3 }, cd: 8 },
      X: { name: 'Heavy Strike', cost: { mana: 3, energy: 5 }, cd: 15 },
      Q: { name: 'Dash', cost: { mana: 0, energy: 2 }, cd: 1 },
    }
  }
};
