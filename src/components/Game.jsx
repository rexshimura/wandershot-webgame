import React, { useEffect, useRef, useState } from 'react';
import Canvas from './Canvas';
import CountCoins, { updateCoinMagnet } from './CountCoins';
import CountExp, { updateExpMagnet } from './CountExp';
import CountKills from './CountKills';
import CountScore from './CountScore';
import SurvivalTimer, { formatTime } from './SurvivalTimer';
import FramerateCounter from './FramerateCounter';
import { renderMinimap } from './Minimap';
import Pause from './Pause';
import PlayerHpbar from './PlayerHpbar';
import { ENEMY_TYPES } from '../config/enemies-config';
import { createExpOrbs } from '../config/exp-config';
import { renderPlayer } from '../entities/Player';
import { CLASSES } from '../config/classes-config';
import Pitchling from './enemies/Pitchling';
import Pitchwalker from './enemies/Pitchwalker';
import SkillHUD from './SkillHUD';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

export default function Game({ selectedClass, onGameOver, backToMenu }) {
  const canvasRef = useRef(null);
  const hpTextRef = useRef(null);
  const hpBarRef = useRef(null);
  const killsRef = useRef(null);
  const coinsRef = useRef(null);
  const scoreRef = useRef(null);
  const timerRef = useRef(null);
  const fpsRef = useRef(null);
  const levelRef = useRef(null);
  const expRef = useRef(null);
  const expBarRef = useRef(null);

  const [activeEnemies, setActiveEnemies] = useState([]);
  const [activeDeathEffects, setActiveDeathEffects] = useState([]);
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [autoAttack, setAutoAttack] = useState(true);
  const autoAttackRef = useRef(autoAttack);
  autoAttackRef.current = autoAttack;
  
  // Expose HUD values via refs
  const manaTextRef = useRef(null);
  const manaBarRef = useRef(null);
  const energyTextRef = useRef(null);
  const energyBarRef = useRef(null);

  const cdRefs = {
    E: { overlay: useRef(null), text: useRef(null), box: useRef(null) },
    F: { overlay: useRef(null), text: useRef(null), box: useRef(null) },
    C: { overlay: useRef(null), text: useRef(null), box: useRef(null) },
    X: { overlay: useRef(null), text: useRef(null), box: useRef(null) },
    Q: { overlay: useRef(null), text: useRef(null), box: useRef(null) },
  };

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const playerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const keys = {};
    let isMouseDown = false;
    let mouseDownTime = 0;

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }
      if (e.key.toLowerCase() === 'r') {
        setAutoAttack(prev => !prev);
      }
      keys[e.code] = true;
    };
    const handleKeyUp = (e) => {
      if (e.key !== 'Tab') {
        keys[e.code] = false;
      }
    };

    let aimingSkill = null; // 'APPRENTICE_E', 'APPRENTICE_X', 'SQUIRE_X'

    const handleMouseDown = (e) => {
      if (e.button === 2) {
        aimingSkill = null;
        return;
      }
      if (aimingSkill) {
        if (aimingSkill === 'APPRENTICE_E') {
          const cost = playerRef.current.skills.E.cost;
          if (playerRef.current.mana >= cost.mana && playerRef.current.energy >= cost.energy) {
            playerRef.current.mana -= cost.mana;
            playerRef.current.energy -= cost.energy;
            playerRef.current.cdE = playerRef.current.skills.E.cd;
            bullets.push({
              x: playerRef.current.x, y: playerRef.current.y,
              vx: Math.cos(playerRef.current.aimAngle) * 150, vy: Math.sin(playerRef.current.aimAngle) * 150,
              radius: 20, damage: 12 * playerRef.current.damageMultiplier, distanceTraveled: 0, maxRange: 800, type: 'MANA_ORB',
              pierce: 9999, duration: 2.0, baseDamage: 60 * playerRef.current.damageMultiplier
            });
          }
        } else if (aimingSkill === 'APPRENTICE_X') {
          const cost = playerRef.current.skills.X.cost;
          if (playerRef.current.mana >= cost.mana && playerRef.current.energy >= cost.energy) {
            playerRef.current.mana -= cost.mana;
            playerRef.current.energy -= cost.energy;
            playerRef.current.cdX = playerRef.current.skills.X.cd;
            bullets.push({
              x: playerRef.current.x, y: playerRef.current.y,
              angle: playerRef.current.aimAngle,
              type: 'BEAM',
              duration: 2.3,
              tickTimer: 0,
              tickInterval: 2.3 / 12,
              tickCount: 0,
              damageSequence: [5, 12, 37, 55, 75, 88, 99, 135, 170, 200, 233, 299],
              length: 2500,
              width: 80
            });
          }
        } else if (aimingSkill === 'SQUIRE_X') {
          const cost = playerRef.current.skills.X.cost;
          if (playerRef.current.mana >= cost.mana && playerRef.current.energy >= cost.energy) {
            playerRef.current.mana -= cost.mana;
            playerRef.current.energy -= cost.energy;
            playerRef.current.cdX = playerRef.current.skills.X.cd;
            bullets.push({
              x: playerRef.current.x, y: playerRef.current.y,
              vx: Math.cos(playerRef.current.aimAngle) * 800, vy: Math.sin(playerRef.current.aimAngle) * 800,
              radius: 60, damage: 120 * playerRef.current.damageMultiplier, distanceTraveled: 0, maxRange: 800, type: 'SHOCKWAVE', pierce: 99
            });
          }
        }
        aimingSkill = null;
      } else {
        isMouseDown = true;
        mouseDownTime = performance.now();
      }
    };
    const handleMouseUp = () => {
      isMouseDown = false;
      // Handle Squire attack release logic if needed
      if (selectedClass === 'SQUIRE' && playerRef.current) {
        const holdDuration = performance.now() - mouseDownTime;
        if (holdDuration < 500) {
          triggerSquireSlash(playerRef.current, currentTimeRef.current);
        }
      }
      mouseDownTime = 0;
    };

    const handleGlobalMouseMove = (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const playerCanvasX = canvas.width / 2;
      const playerCanvasY = canvas.height / 2;
      
      if (playerRef.current) {
        playerRef.current.aimAngle = Math.atan2(mouseY - playerCanvasY, mouseX - playerCanvasX);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    const classConfig = CLASSES[selectedClass] || CLASSES.APPRENTICE;
    const stats = { score: 0, kills: 0, coins: 0, survivalTime: 0 };
    const playerState = { level: 1, exp: 0 };

    playerRef.current = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      ...classConfig,
      hp: classConfig.maxHp,
      mana: classConfig.maxMana,
      energy: classConfig.maxEnergy,
      magnetRange: 130,
      lastShotTime: 0,
      aimAngle: 0,
      radius: 16,
      cdE: 0, cdF: 0, cdC: 0, cdX: 0, cdQ: 0,
      damageMultiplier: 1.0,
      buffTimer: 0,
      isSpinning: false,
      spinTimer: 0,
    };
    const player = playerRef.current;

    let turrets = [];
    let enemies = [];
    let bullets = [];
    let meleeHits = []; // For squire slashes
    let deathEffects = [];
    let droppedCoins = [];
    let expOrbs = [];
    let damageTexts = [];
    let bulletImpacts = [];
    let levelUpEffects = [];
    
    let lastSpawnTime = performance.now();
    let lastFrameTime = performance.now();
    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();
    let currentTimeRef = { current: performance.now() };

    let dashOffset = { x: 0, y: 0 };
    let isDashing = false;

    const getNearestEnemy = () => {
      let nearest = null;
      let minDistance = Infinity;
      for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].isDead) continue;
        const dist = Math.hypot(enemies[i].x - player.x, enemies[i].y - player.y);
        if (dist <= (player.bulletRange || 800) && dist < minDistance) {
          minDistance = dist;
          nearest = enemies[i];
        }
      }
      return nearest;
    };

    const triggerSquireSlash = (p, time) => {
      if (time - p.lastShotTime < p.attackInterval) return;
      p.lastShotTime = time;
      
      const reach = 60;
      const arc = Math.PI / 2;
      
      meleeHits.push({
        x: p.x + Math.cos(p.aimAngle) * reach * 0.5,
        y: p.y + Math.sin(p.aimAngle) * reach * 0.5,
        radius: reach,
        damage: p.bulletDamage * p.damageMultiplier,
        lifetime: 0.15,
        color: '#fbbf24' // Yellowish slash
      });
    };

    const triggerSquireHeavy = (p, time) => {
      if (p.energy < 1 || time - p.lastShotTime < p.attackInterval) return;
      p.energy -= 1;
      p.lastShotTime = time;
      
      const reach = 100;
      meleeHits.push({
        x: p.x + Math.cos(p.aimAngle) * reach * 0.5,
        y: p.y + Math.sin(p.aimAngle) * reach * 0.5,
        radius: reach,
        damage: p.bulletDamage * p.heavyDamageMult * p.damageMultiplier,
        lifetime: 0.25,
        color: '#f43f5e' // Reddish heavy slash
      });
    };

    const fireApprenticeBullet = (p) => {
      bullets.push({
        x: p.x + Math.cos(p.aimAngle) * 22,
        y: p.y + Math.sin(p.aimAngle) * 22,
        vx: Math.cos(p.aimAngle) * p.bulletSpeed,
        vy: Math.sin(p.aimAngle) * p.bulletSpeed,
        radius: p.bulletRadius,
        damage: p.bulletDamage * p.damageMultiplier,
        distanceTraveled: 0,
        maxRange: p.bulletRange,
        type: 'WIND'
      });
    };

    let animationFrameId;

    const gameLoop = (currentTime) => {
      animationFrameId = requestAnimationFrame(gameLoop);
      currentTimeRef.current = currentTime;
      const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
      lastFrameTime = currentTime;
      
      let isBeamActive = false;
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].type === 'BEAM') isBeamActive = true;
      }

      frameCount++;
      if (currentTime - lastFpsUpdateTime >= 1000) {
        if (fpsRef.current) fpsRef.current.textContent = `${frameCount} FPS`;
        frameCount = 0;
        lastFpsUpdateTime = currentTime;
      }

      if (isPausedRef.current) return;

      stats.survivalTime += dt;
      if (timerRef.current) timerRef.current.textContent = formatTime(stats.survivalTime);

      // Resource Regen
      player.mana = Math.min(player.maxMana, player.mana + player.manaRegen * dt);
      player.energy = Math.min(player.maxEnergy, player.energy + player.energyRegen * dt);
      
      if (manaTextRef.current) manaTextRef.current.textContent = `${Math.floor(player.mana)} / ${player.maxMana}`;
      if (manaBarRef.current) manaBarRef.current.style.width = `${(player.mana / player.maxMana) * 100}%`;
      if (energyTextRef.current) energyTextRef.current.textContent = `${Math.floor(player.energy)} / ${player.maxEnergy}`;
      if (energyBarRef.current) energyBarRef.current.style.width = `${(player.energy / player.maxEnergy) * 100}%`;

      // Cooldowns & Buffs
      if (player.cdQ > 0) player.cdQ -= dt;
      if (player.cdE > 0) player.cdE -= dt;
      if (player.cdF > 0) player.cdF -= dt;
      if (player.cdC > 0) player.cdC -= dt;
      if (player.cdX > 0) player.cdX -= dt;

      const updateCdUI = (key, currentCd, maxCd) => {
        if (cdRefs[key] && cdRefs[key].overlay.current) {
          const pct = currentCd > 0 ? (currentCd / maxCd) * 100 : 0;
          cdRefs[key].overlay.current.style.height = `${pct}%`;
        }
        if (cdRefs[key] && cdRefs[key].text.current) {
          cdRefs[key].text.current.textContent = currentCd > 0 ? Math.ceil(currentCd) : '';
        }
      };
      
      updateCdUI('Q', player.cdQ, player.skills.Q.cd);
      updateCdUI('E', player.cdE, player.skills.E.cd);
      if (player.skills.F) updateCdUI('F', player.cdF, player.skills.F.cd);
      updateCdUI('C', player.cdC, player.skills.C.cd);
      updateCdUI('X', player.cdX, player.skills.X.cd);

      // Highlight active skill box
      ['Q', 'E', 'F', 'C', 'X'].forEach(key => {
        if (cdRefs[key] && cdRefs[key].box.current) {
          cdRefs[key].box.current.style.borderColor = '#cbd5e1'; // slate-300
          cdRefs[key].box.current.style.boxShadow = '';
        }
      });
      if (aimingSkill) {
        let activeKey = null;
        if (aimingSkill === 'APPRENTICE_E') activeKey = 'E';
        if (aimingSkill === 'APPRENTICE_X' || aimingSkill === 'SQUIRE_X') activeKey = 'X';
        if (activeKey && cdRefs[activeKey].box.current) {
          cdRefs[activeKey].box.current.style.borderColor = '#3b82f6'; // blue-500
          cdRefs[activeKey].box.current.style.boxShadow = '0 0 12px rgba(59, 130, 246, 0.8)';
        }
      }

      if (player.buffTimer > 0) {
        player.buffTimer -= dt;
        if (player.buffTimer <= 0) player.damageMultiplier = 1.0;
      }
      
      if (player.isSpinning) {
        player.spinTimer -= dt;
        if (player.spinTimer <= 0) player.isSpinning = false;
        else {
          // Continuous spin damage
          meleeHits.push({
            x: player.x,
            y: player.y,
            radius: 80,
            damage: 10 * player.damageMultiplier,
            lifetime: 0.05,
            color: '#60a5fa'
          });
        }
      }

      // Movement & Dash
      let vx = 0;
      let vy = 0;
      if (keys['KeyW']) vy -= 1;
      if (keys['KeyS']) vy += 1;
      if (keys['KeyA']) vx -= 1;
      if (keys['KeyD']) vx += 1;
      if (vx !== 0 && vy !== 0) {
        const length = Math.hypot(vx, vy);
        vx /= length;
        vy /= length;
      }

      if (keys['KeyQ'] && player.cdQ <= 0 && player.energy >= player.skills.Q.cost.energy) {
        player.energy -= player.skills.Q.cost.energy;
        player.cdQ = player.skills.Q.cd;
        isDashing = true;
        let dx = vx; let dy = vy;
        if (dx === 0 && dy === 0) {
          dx = Math.cos(player.aimAngle);
          dy = Math.sin(player.aimAngle);
        }
        dashOffset = { x: dx * 200, y: dy * 200 };
      }

      if (isDashing) {
        player.x += dashOffset.x * dt * 10;
        player.y += dashOffset.y * dt * 10;
        dashOffset.x -= dashOffset.x * dt * 10;
        dashOffset.y -= dashOffset.y * dt * 10;
        if (Math.hypot(dashOffset.x, dashOffset.y) < 10) isDashing = false;
        
        meleeHits.push({
          x: player.x, y: player.y, radius: player.radius, damage: 0,
          lifetime: 0.15, color: 'rgba(59, 130, 246, 0.4)'
        });
      } else if (!isBeamActive) {
        player.x += vx * player.speed * dt;
        player.y += vy * player.speed * dt;
      }

      player.x = Math.max(0, Math.min(WORLD_WIDTH, player.x));
      player.y = Math.max(0, Math.min(WORLD_HEIGHT, player.y));
      setCameraPos({ x: player.x, y: player.y });

      // Turret Logic
      for (let i = turrets.length - 1; i >= 0; i--) {
        const t = turrets[i];
        t.duration -= dt;
        if (t.duration <= 0) {
          t.owner.cdC = t.owner.skills.C.cd; // Start cooldown
          turrets.splice(i, 1);
          continue;
        }
        
        const desiredX = t.owner.x - 50;
        const desiredY = t.owner.y - 50;
        t.x += (desiredX - t.x) * 5 * dt;
        t.y += (desiredY - t.y) * 5 * dt;

        if (currentTime - t.lastShotTime >= t.fireRate * 1000) {
          let nearest = null; let minD = Infinity;
          for (let e of enemies) {
            if (e.isDead) continue;
            const d = Math.hypot(e.x - t.x, e.y - t.y);
            if (d <= t.range && d < minD) { minD = d; nearest = e; }
          }
          if (nearest) {
            t.angle = Math.atan2(nearest.y - t.y, nearest.x - t.x);
            bullets.push({
              x: t.x, y: t.y,
              vx: Math.cos(t.angle) * 1000, vy: Math.sin(t.angle) * 1000,
              radius: 8, damage: 15 * t.owner.damageMultiplier, distanceTraveled: 0, maxRange: t.range, type: 'MANA_GUN_ORB'
            });
            t.lastShotTime = currentTime;
          }
        }
      }

      // Skills (E, C, X)
      if (keys['KeyE']) {
        if (selectedClass === 'APPRENTICE') {
          if (aimingSkill === 'APPRENTICE_E') {
            aimingSkill = null;
          } else if (player.cdE <= 0 && player.mana >= player.skills.E.cost.mana && player.energy >= player.skills.E.cost.energy) {
            aimingSkill = 'APPRENTICE_E';
          }
        } else if (selectedClass === 'SQUIRE' && player.cdE <= 0 && player.mana >= player.skills.E.cost.mana && player.energy >= player.skills.E.cost.energy) {
          player.mana -= player.skills.E.cost.mana;
          player.energy -= player.skills.E.cost.energy;
          player.cdE = player.skills.E.cd;
          player.damageMultiplier = 1.9;
          player.buffTimer = 6;
        }
        keys['KeyE'] = false;
      }
      
      if (keys['KeyF']) {
        if (selectedClass === 'APPRENTICE' && player.cdF <= 0 && player.mana >= player.skills.F.cost.mana && player.energy >= player.skills.F.cost.energy) {
          player.mana -= player.skills.F.cost.mana;
          player.energy -= player.skills.F.cost.energy;
          player.cdF = player.skills.F.cd;
          bullets.push({
            x: player.x, y: player.y,
            type: 'MANA_PUSH',
            radius: 0,
            maxRadius: 250,
            duration: 0.3,
            tickTimer: 0,
            tickInterval: 0.1,
            damage: 8 * player.damageMultiplier,
            hitList: new Map(),
            vx: 0,
            vy: 0
          });
        }
        keys['KeyF'] = false;
      }

      if (keys['KeyC']) {
        const activeTurret = turrets.find(t => t.owner === player);
        if (selectedClass === 'APPRENTICE' && !activeTurret && player.cdC <= 0 && player.mana >= player.skills.C.cost.mana && player.energy >= player.skills.C.cost.energy) {
          player.mana -= player.skills.C.cost.mana;
          player.energy -= player.skills.C.cost.energy;
          turrets.push({
            owner: player, x: player.x, y: player.y,
            duration: 5.0, range: 450, lastShotTime: 0, fireRate: 0.25, angle: 0
          });
        } else if (selectedClass === 'SQUIRE' && player.cdC <= 0 && player.mana >= player.skills.C.cost.mana && player.energy >= player.skills.C.cost.energy) {
          player.mana -= player.skills.C.cost.mana;
          player.energy -= player.skills.C.cost.energy;
          player.cdC = player.skills.C.cd;
          player.isSpinning = true;
          player.spinTimer = 3;
        }
        keys['KeyC'] = false;
      }

      if (keys['KeyX']) {
        if (selectedClass === 'APPRENTICE') {
          if (aimingSkill === 'APPRENTICE_X') {
            aimingSkill = null;
          } else if (player.cdX <= 0 && player.mana >= player.skills.X.cost.mana && player.energy >= player.skills.X.cost.energy) {
            aimingSkill = 'APPRENTICE_X';
          }
        } else if (selectedClass === 'SQUIRE') {
          if (aimingSkill === 'SQUIRE_X') {
            aimingSkill = null;
          } else if (player.cdX <= 0 && player.mana >= player.skills.X.cost.mana && player.energy >= player.skills.X.cost.energy) {
            aimingSkill = 'SQUIRE_X';
          }
        }
        keys['KeyX'] = false;
      }

      // Basic Attack Logic
      const timeSinceLastShot = currentTime - player.lastShotTime;
      if (selectedClass === 'APPRENTICE') {
        const shouldAttack = autoAttackRef.current ? getNearestEnemy() : (isMouseDown && !aimingSkill);
        if (shouldAttack && timeSinceLastShot >= player.attackInterval) {
          if (autoAttackRef.current && shouldAttack.x !== undefined) {
             player.aimAngle = Math.atan2(shouldAttack.y - player.y, shouldAttack.x - player.x);
          }
          fireApprenticeBullet(player);
          player.lastShotTime = currentTime;
        }
      } else if (selectedClass === 'SQUIRE') {
        if (isMouseDown && !aimingSkill) {
          if (currentTime - mouseDownTime >= 500) {
            triggerSquireHeavy(player, currentTime);
            mouseDownTime = currentTime; // reset so it triggers repeatedly if held
          }
        }
      }

      // Drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      
      // Camera Zoom Out (0.75x)
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(0.75, 0.75);
      ctx.translate(-player.x, -player.y);

      // Grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 100;
      const startX = Math.floor((player.x - canvas.width / 2) / gridSize) * gridSize;
      const startY = Math.floor((player.y - canvas.height / 2) / gridSize) * gridSize;
      for (let x = startX; x < player.x + canvas.width / 2; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, player.y - canvas.height / 2); ctx.lineTo(x, player.y + canvas.height / 2); ctx.stroke();
      }
      for (let y = startY; y < player.y + canvas.height / 2; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(player.x - canvas.width / 2, y); ctx.lineTo(player.x + canvas.width / 2, y); ctx.stroke();
      }

      renderPlayer(ctx, player, selectedClass);

      // Draw Beams
      for (let b of bullets) {
        if (b.type === 'BEAM') {
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          
          const timeActive = 2.3 - b.duration;
          const currentWidth = Math.max(4, Math.min(b.width, b.width * (timeActive / 0.8)));
          
          const drawFunnel = (width, extraGlow = 0) => {
            const baseW = Math.max(2, width / 6);
            const funnelDist = 60; // distance from base to reach full width
            ctx.beginPath();
            ctx.moveTo(0, -baseW / 2 - extraGlow);
            ctx.lineTo(funnelDist, -width / 2 - extraGlow);
            ctx.lineTo(b.length, -width / 2 - extraGlow);
            ctx.lineTo(b.length, width / 2 + extraGlow);
            ctx.lineTo(funnelDist, width / 2 + extraGlow);
            ctx.lineTo(0, baseW / 2 + extraGlow);
            ctx.closePath();
            ctx.fill();
          };
          
          // Outer glow
          ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
          drawFunnel(currentWidth, 15);
          
          // Inner core
          ctx.fillStyle = '#c084fc';
          drawFunnel(currentWidth, 0);
          
          // White hot center
          ctx.fillStyle = '#ffffff';
          drawFunnel(currentWidth / 2, 0);
          
          ctx.restore();
        }
      }

      // Draw Turrets
      for (let i = 0; i < turrets.length; i++) {
        const t = turrets[i];
        
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
        ctx.lineWidth = 3;
        ctx.setLineDash([15, 15]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.save();
        ctx.translate(t.x, t.y);
        ctx.rotate(t.angle);
        ctx.fillStyle = '#0ea5e9'; // base
        ctx.fillRect(-12, -12, 24, 24);
        ctx.fillStyle = '#bae6fd'; // barrel
        ctx.fillRect(0, -5, 22, 10);
        ctx.restore();
      }

      // Spawning
      const spawnEnemy = (typeKey) => {
        const type = ENEMY_TYPES[typeKey];
        const angle = Math.random() * Math.PI * 2;
        const distance = 550 + Math.random() * 200;
        let x = player.x + Math.cos(angle) * distance;
        let y = player.y + Math.sin(angle) * distance;
        x = Math.max(50, Math.min(WORLD_WIDTH - 50, x));
        y = Math.max(50, Math.min(WORLD_HEIGHT - 50, y));
        enemies.push({
          ...type, typeKey, id: Math.random().toString(),
          x, y, hp: type.maxHp, hitTimer: 0, isDead: false,
        });
      };

      if (currentTime - lastSpawnTime > 2000) {
        const types = Object.keys(ENEMY_TYPES);
        spawnEnemy(types[Math.floor(Math.random() * types.length)]);
        lastSpawnTime = currentTime;
      }

      const killEnemy = (enemy, index) => {
        enemy.isDead = true;
        stats.score += enemy.scoreValue;
        stats.kills += 1;
        if (scoreRef.current) scoreRef.current.textContent = stats.score;
        if (killsRef.current) killsRef.current.textContent = stats.kills;
        
        deathEffects.push({
          id: enemy.id, typeKey: enemy.typeKey, x: enemy.x, y: enemy.y,
          radius: enemy.radius, spriteScale: enemy.spriteScale, deathSpriteSrc: enemy.deathSpriteSrc,
          spawnTime: currentTimeRef.current, duration: 500
        });
        
        // Coins
        const count = enemy.coinDropRoll();
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 10 + Math.random() * 50; // spread away from center
          droppedCoins.push({ 
            x: enemy.x + Math.cos(angle) * dist, 
            y: enemy.y + Math.sin(angle) * dist, 
            radius: 8, 
            speed: 0 
          });
        }
        expOrbs.push(...createExpOrbs(enemy.x, enemy.y, enemy.expValue));
        enemies.splice(index, 1);
      };

      // Updates and Drawing for Bullets/Melee
      for (let m = meleeHits.length - 1; m >= 0; m--) {
        const hit = meleeHits[m];
        hit.lifetime -= dt;
        if (hit.lifetime <= 0) {
          meleeHits.splice(m, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(hit.x, hit.y, hit.radius, 0, Math.PI * 2);
        ctx.fillStyle = hit.color;
        ctx.globalAlpha = hit.lifetime * 4;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        for (let i = 0; i < enemies.length; i++) {
          const e = enemies[i];
          if (e.isDead || e.hitTimer > 0) continue;
          if (Math.hypot(e.x - hit.x, e.y - hit.y) < e.radius + hit.radius) {
            if (hit.damage > 0) {
              e.hp -= hit.damage;
              e.hitTimer = 0.2;
              damageTexts.push({ x: e.x, y: e.y - 20, text: Math.floor(hit.damage), lifetime: 0.5, color: '#f43f5e' });
              if (e.hp <= 0) killEnemy(e, i);
            }
          }
        }
      }

      for (let b = bullets.length - 1; b >= 0; b--) {
        const bullet = bullets[b];
        let destroyed = false;
        
        if (bullet.type === 'BEAM') {
          bullet.x = player.x;
          bullet.y = player.y;
          // Optionally track mouse during firing
          // bullet.angle = player.aimAngle;
          
          bullet.duration -= dt;
          bullet.tickTimer -= dt;
          if (bullet.tickTimer <= 0) {
            bullet.tickTimer += bullet.tickInterval;
            
            const endX = bullet.x + Math.cos(bullet.angle) * bullet.length;
            const endY = bullet.y + Math.sin(bullet.angle) * bullet.length;
            const p1 = { x: bullet.x, y: bullet.y };
            const p2 = { x: endX, y: endY };
            const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
            
            const timeActive = 2.3 - bullet.duration;
            const currentWidth = Math.max(4, Math.min(bullet.width, bullet.width * (timeActive / 0.8)));
            
            for (let i = enemies.length - 1; i >= 0; i--) {
              const e = enemies[i];
              if (e.isDead) continue;
              let t = Math.max(0, Math.min(1, ((e.x - p1.x) * (p2.x - p1.x) + (e.y - p1.y) * (p2.y - p1.y)) / l2));
              const proj = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
              const distToLine = Math.hypot(e.x - proj.x, e.y - proj.y);
              
              if (distToLine <= e.radius + currentWidth / 2) {
                const baseDmg = bullet.damageSequence ? (bullet.damageSequence[bullet.tickCount] || 20) : 20;
                const dmg = baseDmg * player.damageMultiplier;
                e.hp -= dmg;
                e.hitTimer = 0.12;
                damageTexts.push({ x: e.x, y: e.y - 20, text: Math.floor(dmg), lifetime: 0.5, color: '#d8b4fe' });
                if (e.hp <= 0) killEnemy(e, i);
              }
            }
            if (bullet.tickCount !== undefined) bullet.tickCount++;
          }
          if (bullet.duration <= 0) {
            bullets.splice(b, 1);
          }
          continue; // Skip the rest of bullet logic for BEAM
        }
        
        // Homing Trace
        if (bullet.trace > 0) {
          let closest = getNearestEnemy();
          if (closest) {
            const desiredDx = closest.x - bullet.x;
            const desiredDy = closest.y - bullet.y;
            const desiredAngle = Math.atan2(desiredDy, desiredDx);
            const currentAngle = Math.atan2(bullet.vy, bullet.vx);
            let angleDiff = desiredAngle - currentAngle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const turnSpeed = 0.5 + bullet.trace;
            const turnAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed * dt);
            const newAngle = currentAngle + turnAmount;
            const speed = Math.hypot(bullet.vx, bullet.vy);
            bullet.vx = Math.cos(newAngle) * speed;
            bullet.vy = Math.sin(newAngle) * speed;
          }
        }

        const stepX = bullet.vx * dt;
        const stepY = bullet.vy * dt;
        bullet.x += stepX;
        bullet.y += stepY;
        bullet.distanceTraveled += Math.hypot(stepX, stepY);
        
        if (bullet.type === 'MANA_PUSH') {
          bullet.duration -= dt;
          bullet.tickTimer -= dt;
          bullet.radius = bullet.maxRadius * (1 - bullet.duration / 0.3);
          
          if (bullet.tickTimer <= 0) {
            bullet.tickTimer += bullet.tickInterval;
            for (let i = 0; i < enemies.length; i++) {
              const e = enemies[i];
              if (e.isDead) continue;
              if (Math.hypot(e.x - bullet.x, e.y - bullet.y) < bullet.radius + e.radius) {
                const hits = bullet.hitList.get(e.id) || 0;
                if (hits < 3) {
                  e.hp -= bullet.damage;
                  e.hitTimer = 0.12;
                  damageTexts.push({ x: e.x, y: e.y - 20, text: Math.floor(bullet.damage), lifetime: 0.5, color: '#60a5fa' });
                  bullet.hitList.set(e.id, hits + 1);
                  
                  const angle = Math.atan2(e.y - bullet.y, e.x - bullet.x);
                  e.x += Math.cos(angle) * 80;
                  e.y += Math.sin(angle) * 80;
                  e.slowTimer = 1.6;
                  
                  if (e.hp <= 0) killEnemy(e, i);
                }
              }
            }
          }
          if (bullet.duration <= 0) destroyed = true;
        }
        
        if (bullet.type === 'MANA_ORB') {
          const pullRange = 180;
          const pullForce = 250;
          for (let e of enemies) {
            if (e.isDead) continue;
            const dx = bullet.x - e.x;
            const dy = bullet.y - e.y;
            const dist = Math.hypot(dx, dy);
            if (dist < pullRange) {
              e.x += (dx / dist) * pullForce * dt;
              e.y += (dy / dist) * pullForce * dt;
            }
          }
        }

        if (bullet.type === 'MANA_ORB') {
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();
          
          ctx.save();
          ctx.translate(bullet.x, bullet.y);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const timeOffset = currentTime / 200 + (i * Math.PI * 2 / 3);
            const radius = bullet.radius + Math.sin(currentTime / 150 + i) * 5;
            ctx.arc(0, 0, radius, timeOffset, timeOffset + Math.PI);
            ctx.stroke();
          }

          ctx.fillStyle = '#bae6fd';
          for (let i = 0; i < 6; i++) {
             const phase = (currentTime / 600 + i / 6) % 1; 
             const r = 50 * (1 - phase);
             const angle = phase * Math.PI * 4 + i * (Math.PI / 3);
             ctx.beginPath();
             ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 2.5, 0, Math.PI * 2);
             ctx.fill();
          }
          ctx.restore();
        } else if (bullet.type === 'MANA_PUSH') {
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(96, 165, 250, ${Math.max(0, bullet.duration / 0.3)})`;
          ctx.lineWidth = 15;
          ctx.stroke();
          ctx.fillStyle = `rgba(96, 165, 250, ${Math.max(0, (bullet.duration / 0.3) * 0.3)})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
          ctx.fillStyle = bullet.type === 'LASER' ? '#8b5cf6' : (bullet.type === 'MANA_GUN_ORB' ? '#0ea5e9' : '#0ea5e9');
          ctx.fill();
        }
        
        if (bullet.type !== 'MANA_PUSH' && bullet.duration !== undefined) {
          bullet.duration -= dt;
          if (bullet.duration <= 0) {
            if (bullet.type === 'MANA_ORB') {
              meleeHits.push({
                x: bullet.x, y: bullet.y, radius: 150, damage: bullet.baseDamage, lifetime: 0.2, color: 'rgba(59, 130, 246, 0.7)'
              });
            }
            destroyed = true;
          }
        }

        if (bullet.type !== 'MANA_PUSH') {
          for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            if (e.isDead) continue;
            if (Math.hypot(e.x - bullet.x, e.y - bullet.y) < e.radius + bullet.radius) {
              e.hp -= bullet.damage;
              e.hitTimer = 0.12;
              damageTexts.push({ x: e.x, y: e.y - 20, text: Math.floor(bullet.damage), lifetime: 0.5, color: '#fcd34d' });
              if (e.hp <= 0) killEnemy(e, i);
              if (!bullet.pierce || bullet.pierce <= 0) destroyed = true;
              else bullet.pierce -= 1;
              break;
            }
          }
        }
        if (destroyed || bullet.distanceTraveled >= bullet.maxRange) {
          bullets.splice(b, 1);
        }
      }


      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.isDead) continue;
        if (e.hitTimer > 0) e.hitTimer -= dt;
        if (e.slowTimer > 0) e.slowTimer -= dt;

        const dx = player.x - e.x;
        const dy = player.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist > e.radius + player.radius) {
          const statusSlow = e.slowTimer > 0 ? 0.5 : 1.0;
          const slowMult = isBeamActive ? 0.15 : 1.0;
          let moveX = (dx / dist) * e.speed * slowMult * statusSlow * dt;
          let moveY = (dy / dist) * e.speed * slowMult * statusSlow * dt;
          
          if (e.behavior === 'ERRATIC') {
            const wobble = Math.sin(currentTime / 150 + parseFloat(e.id) * 100) * 120 * slowMult * statusSlow * dt;
            moveX += (-dy / dist) * wobble;
            moveY += (dx / dist) * wobble;
          }
          
          e.x += moveX;
          e.y += moveY;
        } else if (currentTime - e.lastAttackTime >= 1000) {
          player.hp -= e.contactDamage;
          e.lastAttackTime = currentTime;
          if (hpTextRef.current) hpTextRef.current.textContent = `${Math.floor(player.hp)} / ${player.maxHp}`;
          if (hpBarRef.current) hpBarRef.current.style.width = `${(player.hp / player.maxHp) * 100}%`;
          if (player.hp <= 0 && !isGameOverRef.current) {
            isGameOverRef.current = true;
            setFinalTime(formatTime(stats.survivalTime));
            onGameOver();
          }
        }
      }
      setActiveEnemies([...enemies]);

      // Process Death Effects
      for (let i = deathEffects.length - 1; i >= 0; i--) {
        const d = deathEffects[i];
        if (currentTime - d.spawnTime >= d.duration) {
          deathEffects.splice(i, 1);
        }
      }
      setActiveDeathEffects([...deathEffects]);

      for (let i = expOrbs.length - 1; i >= 0; i--) {
        updateExpMagnet({
          orb: expOrbs[i], player, dt, playerState,
          hpBarRef, hpTextRef, expRef, expBarRef, levelRef, levelUpEffects, expOrbs, index: i, onLevelUp: () => {}
        });
      }
      for (let i = droppedCoins.length - 1; i >= 0; i--) {
        updateCoinMagnet({ coin: droppedCoins[i], player, dt, coinsRef, stats, droppedCoins, index: i });
      }

      for (let i = 0; i < expOrbs.length; i++) {
        ctx.beginPath();
        ctx.arc(expOrbs[i].x, expOrbs[i].y, expOrbs[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      for (let i = 0; i < droppedCoins.length; i++) {
        ctx.beginPath();
        ctx.arc(droppedCoins[i].x, droppedCoins[i].y, droppedCoins[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw Enemy Marks and HP Bars
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        if (e.isDead) continue;
        
        if (e.isMarked) {
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.radius + 15, 0, Math.PI * 2);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(e.x, e.y - e.radius - 20); ctx.lineTo(e.x, e.y - e.radius - 10); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(e.x, e.y + e.radius + 10); ctx.lineTo(e.x, e.y + e.radius + 20); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(e.x - e.radius - 20, e.y); ctx.lineTo(e.x - e.radius - 10, e.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(e.x + e.radius + 10, e.y); ctx.lineTo(e.x + e.radius + 20, e.y); ctx.stroke();
        }
        
        if (e.hp < e.maxHp) {
          const barW = e.barWidth || 24;
          const hpPct = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = '#334155';
          ctx.fillRect(e.x - barW / 2, e.y - e.radius - 32, barW, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(e.x - barW / 2, e.y - e.radius - 32, barW * hpPct, 4);
        }
      }

      // Draw Damage Texts
      for (let i = damageTexts.length - 1; i >= 0; i--) {
        const dmgTxt = damageTexts[i];
        dmgTxt.lifetime -= dt;
        dmgTxt.y -= 0.6; // float up
        if (dmgTxt.lifetime <= 0) {
          damageTexts.splice(i, 1);
          continue;
        }
        ctx.fillStyle = dmgTxt.color;
        ctx.globalAlpha = Math.min(1, dmgTxt.lifetime * 2);
        ctx.font = '900 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.strokeText(dmgTxt.text, dmgTxt.x, dmgTxt.y);
        ctx.fillText(dmgTxt.text, dmgTxt.x, dmgTxt.y);
        ctx.globalAlpha = 1.0;
      }

      // Draw Aiming Area & Indicator Text
      if (aimingSkill) {
        ctx.save();
        ctx.setLineDash([15, 15]);
        
        if (aimingSkill === 'APPRENTICE_E') {
          const targetX = player.x + Math.cos(player.aimAngle) * 300;
          const targetY = player.y + Math.sin(player.aimAngle) * 300;
          
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
          ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
          
          // Path
          ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(targetX, targetY);
          ctx.lineWidth = 40; ctx.stroke();
          
          // Explosion radius
          ctx.beginPath(); ctx.arc(targetX, targetY, 150, 0, Math.PI * 2);
          ctx.lineWidth = 4;
          ctx.fill(); ctx.stroke();
        } else if (aimingSkill === 'APPRENTICE_X') {
          ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
          ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
          ctx.setLineDash([20, 20]);
          
          ctx.beginPath(); ctx.moveTo(player.x, player.y);
          ctx.lineTo(player.x + Math.cos(player.aimAngle) * 2000, player.y + Math.sin(player.aimAngle) * 2000);
          ctx.lineWidth = 60; ctx.stroke();
        } else if (aimingSkill === 'SQUIRE_X') {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
          ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
          ctx.setLineDash([20, 20]);
          
          ctx.beginPath(); ctx.moveTo(player.x, player.y);
          ctx.lineTo(player.x + Math.cos(player.aimAngle) * 800, player.y + Math.sin(player.aimAngle) * 800);
          ctx.lineWidth = 120; ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
      
      // Screen Tint (drawn after camera restore, before UI/Minimap)
      if (isBeamActive) {
        ctx.fillStyle = 'rgba(139, 92, 246, 0.15)'; // purple tint
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      renderMinimap(ctx, canvas, WORLD_WIDTH, WORLD_HEIGHT, enemies, player);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [selectedClass]); // autoAttack is removed from dependency array!

  return (
    <div 
      className="relative w-screen h-screen bg-slate-100 overflow-hidden select-none font-sans"
      onContextMenu={(e) => e.preventDefault()}
    >
      <Canvas ref={canvasRef} />

      {/* TOP LEFT HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <PlayerHpbar hpBarRef={hpBarRef} hpTextRef={hpTextRef} maxHp={CLASSES[selectedClass]?.maxHp || 100} />
        
        {/* Mana Bar (Segmented) */}
        <div className="w-56 bg-white/90 border border-slate-300 p-2 rounded-lg shadow-sm backdrop-blur-sm -mt-1">
          <div className="flex justify-between text-xs text-slate-700 font-bold mb-1">
            <span>Mana</span>
            <span ref={manaTextRef}>{CLASSES[selectedClass]?.maxMana} / {CLASSES[selectedClass]?.maxMana}</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
            <div ref={manaBarRef} className="bg-blue-500 h-full transition-all duration-75" style={{ width: '100%' }} />
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {Array.from({ length: CLASSES[selectedClass]?.maxMana - 1 || 0 }).map((_, i) => (
                <div key={i} className="h-full w-[1px] bg-slate-900/20" />
              ))}
            </div>
          </div>
        </div>

        {/* Energy Bar (Segmented) */}
        <div className="w-56 bg-white/90 border border-slate-300 p-2 rounded-lg shadow-sm backdrop-blur-sm -mt-1">
          <div className="flex justify-between text-xs text-slate-700 font-bold mb-1">
            <span>Energy</span>
            <span ref={energyTextRef}>{CLASSES[selectedClass]?.maxEnergy} / {CLASSES[selectedClass]?.maxEnergy}</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden relative">
            <div ref={energyBarRef} className="bg-amber-500 h-full transition-all duration-75" style={{ width: '100%' }} />
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {Array.from({ length: CLASSES[selectedClass]?.maxEnergy - 1 || 0 }).map((_, i) => (
                <div key={i} className="h-full w-[1px] bg-slate-900/20" />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1 pointer-events-auto w-fit">
          <button 
            onClick={() => setAutoAttack(prev => !prev)}
            className="px-3 py-1 bg-white text-slate-800 rounded hover:bg-slate-200 font-bold border border-slate-300 w-full cursor-pointer shadow-lg text-xs transition-colors"
          >
            Auto Attack: {autoAttack ? 'ON' : 'OFF'}
          </button>
          <span className="text-[10px] text-slate-500 font-bold text-center tracking-wide">Press 'R' to toggle</span>
        </div>
      </div>

      {/* TOP RIGHT HUD */}
      <div className="absolute top-4 right-4 z-10 flex gap-4 pointer-events-none">
        <CountScore scoreRef={scoreRef} />
        <CountKills killsRef={killsRef} />
        <CountCoins coinsRef={coinsRef} />
        <SurvivalTimer timerRef={timerRef} />
      </div>

      <SkillHUD selectedClass={selectedClass} cdRefs={cdRefs} />

      {/* BOTTOM EXP BAR */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[600px] z-10 flex flex-col gap-1 pointer-events-none">
        <CountExp levelRef={levelRef} expRef={expRef} expBarRef={expBarRef} />
      </div>

      {isPaused && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-30 pointer-events-auto">
          <Pause setIsPaused={setIsPaused} />
          <button 
            onClick={backToMenu}
            className="absolute bottom-16 px-8 py-3 bg-rose-900 hover:bg-rose-800 text-white rounded font-bold cursor-pointer transition-colors"
          >
            Quit to Menu
          </button>
        </div>
      )}

      {/* HTML GIF OVERLAY */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[5]">
        {activeEnemies.map((enemy) =>
          enemy.isDead ? null : (
            <div
              key={enemy.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: (enemy.x - cameraPos.x) * 0.75 + window.innerWidth / 2, top: (enemy.y - cameraPos.y) * 0.75 + window.innerHeight / 2 }}
            >
              <img 
                src={enemy.spriteSrc} 
                className="drop-shadow-lg rendering-pixelated object-contain" 
                style={{ 
                  width: enemy.radius * enemy.spriteScale * 2 * 0.75, 
                  height: enemy.radius * enemy.spriteScale * 2 * 0.75,
                  filter: enemy.hitTimer > 0 
                    ? 'brightness(200%) hue-rotate(300deg)' 
                    : enemy.slowTimer > 0
                      ? 'sepia(1) hue-rotate(180deg) saturate(2)'
                      : 'none' 
                }} 
              />
            </div>
          )
        )}
        {activeDeathEffects.map((effect) => (
          <div
            key={effect.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: (effect.x - cameraPos.x) * 0.75 + window.innerWidth / 2, top: (effect.y - cameraPos.y) * 0.75 + window.innerHeight / 2 }}
          >
            <img 
              src={effect.deathSpriteSrc} 
              className="drop-shadow-lg rendering-pixelated object-contain opacity-75" 
              style={{ 
                width: effect.radius * effect.spriteScale * 2 * 0.75, 
                height: effect.radius * effect.spriteScale * 2 * 0.75
              }} 
            />
          </div>
        ))}
      </div>

      <FramerateCounter fpsRef={fpsRef} />
    </div>
  );
}
