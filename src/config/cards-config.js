export const CARD_UPGRADES = [
  {
    id: 'quickshot',
    name: 'Quickshot',
    description: 'Increase attack speed by 30%',
    apply: (player) => {
      player.attackInterval *= 0.7;
    },
  },
  {
    id: 'spreadshot',
    name: 'Spreadshot',
    description: '+1 Projectile fired in a shotgun spread pattern',
    apply: (player) => {
      player.spreadshot += 1;
    },
  },
  {
    id: 'multishot',
    name: 'Multishot',
    description: '+1 Projectile fired sequentially in a rapid burst',
    apply: (player) => {
      player.multishot += 1;
    },
  },
  {
    id: 'quicksteps',
    name: 'Quicksteps',
    description: 'Player Movement Speed + 12%',
    apply: (player) => {
      player.speed *= 1.12;
    },
  },
  {
    id: 'health_boost',
    name: 'Health Boost',
    description: 'Increase max HP by 35% and fully heal',
    apply: (player) => {
      player.maxHp = Math.floor(player.maxHp * 1.35);
      player.hp = player.maxHp;
    },
  },
  {
    id: 'bloatshot',
    name: 'Bloatshot',
    description: 'Increase bullet size',
    apply: (player) => {
      // Ensure we have a default starting radius 
      if (!player.bulletRadius) player.bulletRadius = 6;
      player.bulletRadius *= 1.5;
    },
  },
  {
    id: 'pierce',
    name: 'Pierce',
    description: 'Increases bullet penetration',
    apply: (player) => {
      player.pierce += 1;
    },
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'Bullets bounce to another nearby enemy',
    apply: (player) => {
      player.bounce += 1;
    },
  },
  {
    id: 'trace',
    name: 'Trace',
    description: 'Bullets slightly home in on enemies',
    apply: (player) => {
      player.trace += 1;
    },
  },
];
