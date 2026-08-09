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
    attackInterval: 750, // Increased cooldown
    bulletSpeed: 900,
    bulletDamage: 25,
    bulletRadius: 6,
    bulletRange: 800,
    
    // Skills Cooldowns (in seconds)
    skills: {
      E: { name: 'Mana Orb', cost: { mana: 4, energy: 0 }, cd: 5 },
      F: { name: 'Mana Push', cost: { mana: 4, energy: 0 }, cd: 8 },
      C: { name: 'Mana Gun', cost: { mana: 5, energy: 0 }, cd: 5 },
      X: { name: 'Condensed Mana', cost: { mana: 9, energy: 0 }, cd: 12 },
      Q: { name: 'Teleport', cost: { mana: 0, energy: 2 }, cd: 1 },
    }
  }
};
