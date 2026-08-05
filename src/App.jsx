import React, { useEffect, useRef, useState } from 'react';
import Canvas from './components/Canvas';
import CountCoins, { updateCoinMagnet } from './components/CountCoins';
import CountExp, { updateExpMagnet } from './components/CountExp';
import CountKills from './components/CountKills';
import CountScore from './components/CountScore';
import SurvivalTimer, { formatTime } from './components/SurvivalTimer';
import FramerateCounter from './components/FramerateCounter';
import { renderMinimap } from './components/Minimap';
import Pause from './components/Pause';
import PlayerHpbar from './components/PlayerHpbar';
import Pitchling from './components/enemies/Pitchling';
import Pitchwalker from './components/enemies/Pitchwalker';
import { ENEMY_TYPES } from './config/enemies-config';
import { createExpOrbs } from './config/exp-config';
import { PLAYER_CONFIG } from './config/player-config';
import { renderPlayer } from './entities/Player';
import LevelUpOverlay from './components/LevelUpOverlay';
import DevModePanel from './components/DevModePanel';
import { CARD_UPGRADES } from './config/cards-config';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

export default function App() {
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
  const [isDevMode, setIsDevMode] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalTime, setFinalTime] = useState('00:00');

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const isGameOverRef = useRef(false);
  isGameOverRef.current = isGameOver;

  const playerRef = useRef(null);
  const [levelUpCards, setLevelUpCards] = useState(null);
  const isLevelingUpRef = useRef(false);
  const pendingLevelUpsRef = useRef(0);

  const handleSelectCard = (card) => {
    if (card && playerRef.current) {
      card.apply(playerRef.current);
      if (hpTextRef.current) hpTextRef.current.textContent = `${playerRef.current.hp} / ${playerRef.current.maxHp}`;
      if (hpBarRef.current) hpBarRef.current.style.width = `${(playerRef.current.hp / playerRef.current.maxHp) * 100}%`;
    }
    setLevelUpCards(null);
    isLevelingUpRef.current = false;
  };

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
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsDevMode((prev) => !prev);
        return;
      }
      keys[e.code] = true;
    };
    const handleKeyUp = (e) => {
      if (e.key !== 'Tab') {
        keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const stats = { score: 0, kills: 0, coins: 0, survivalTime: 0 };
    const playerState = { level: 1, exp: 0 };

    playerRef.current = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      ...PLAYER_CONFIG,
      lastShotTime: 0,
      aimAngle: 0,
    };
    const player = playerRef.current;

    let enemies = [];
    let bullets = [];
    let deathEffects = [];
    let droppedCoins = [];
    let expOrbs = [];
    let damageTexts = [];
    let bulletImpacts = [];
    let levelUpEffects = [];
    let lastSpawnTime = performance.now();
    let lastFrameTime = performance.now();
    
    let burstQueue = { count: 0, lastBurstTime: 0 };

    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();
    let dashOffset = 0;

    let animationFrameId;

    const fireSpread = (pObj, bArray) => {
      const wandTipX = pObj.x + Math.cos(pObj.aimAngle) * 22;
      const wandTipY = pObj.y + Math.sin(pObj.aimAngle) * 22;

      const totalBullets = 1 + (pObj.spreadshot || 0);
      const spreadAngle = totalBullets > 1 ? (Math.PI / 12) + (totalBullets * 0.05) : 0; 
      
      for (let i = 0; i < totalBullets; i++) {
        let angleOffset = 0;
        if (totalBullets > 1) {
          angleOffset = -spreadAngle / 2 + (spreadAngle / (totalBullets - 1)) * i;
        }
        const fireAngle = pObj.aimAngle + angleOffset;

        bArray.push({
          x: wandTipX,
          y: wandTipY,
          vx: Math.cos(fireAngle) * pObj.bulletSpeed,
          vy: Math.sin(fireAngle) * pObj.bulletSpeed,
          radius: pObj.bulletRadius || 6,
          damage: pObj.bulletDamage,
          distanceTraveled: 0,
          maxRange: pObj.bulletRange,
          pierce: pObj.pierce || 0,
          bounce: pObj.bounce || 0,
          hitEnemies: new Set(),
        });
      }
    };

    const getNearestEnemy = () => {
      let nearest = null;
      let minDistance = Infinity;

      for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.isDead) continue;
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= player.bulletRange && dist < minDistance) {
          minDistance = dist;
          nearest = enemy;
        }
      }
      return nearest;
    };

    const spawnEnemy = (typeKey) => {
      const type = ENEMY_TYPES[typeKey];
      const angle = Math.random() * Math.PI * 2;
      const distance = 550 + Math.random() * 200;
      let x = player.x + Math.cos(angle) * distance;
      let y = player.y + Math.sin(angle) * distance;

      x = Math.max(50, Math.min(WORLD_WIDTH - 50, x));
      y = Math.max(50, Math.min(WORLD_HEIGHT - 50, y));

      enemies.push({
        ...type,
        typeKey,
        // Unique ID string guarantees independent GIF animation streams
        id: `${typeKey}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        x,
        y,
        hp: type.maxHp,
        lastAttackTime: 0,
        hitTimer: 0,
        erraticAngle: Math.random() * Math.PI * 2,
        isDead: false,
      });
    };

    const rollCoinDrop = (enemy, x, y) => {
      const count = enemy.coinDropRoll();
      for (let i = 0; i < count; i++) {
        droppedCoins.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y + (Math.random() - 0.5) * 24,
          radius: 8,
          speed: 0,
        });
      }
    };

    const gameLoop = (currentTime) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
      lastFrameTime = currentTime;

      // Update FPS Counter
      frameCount++;
      if (currentTime - lastFpsUpdateTime >= 1000) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `${frameCount} FPS`;
        }
        frameCount = 0;
        lastFpsUpdateTime = currentTime;
      }

      if (isPausedRef.current || isGameOverRef.current || isLevelingUpRef.current) return;

      // Handle pending level ups
      if (pendingLevelUpsRef.current > 0 && !isLevelingUpRef.current) {
        pendingLevelUpsRef.current -= 1;
        isLevelingUpRef.current = true;
        
        const shuffled = [...CARD_UPGRADES].sort(() => 0.5 - Math.random());
        setLevelUpCards(shuffled.slice(0, 3));
        return; // Halt this frame
      }

      // Advance Survival Timer
      stats.survivalTime += dt;
      const formatted = formatTime(stats.survivalTime);
      if (timerRef.current) {
        timerRef.current.textContent = formatted;
      }

      // Player Movement
      let moveX = 0;
      let moveY = 0;
      if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
      if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
      if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
      if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;

      if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      player.x += moveX * player.speed * dt;
      player.y += moveY * player.speed * dt;
      player.x = Math.max(player.radius, Math.min(WORLD_WIDTH - player.radius, player.x));
      player.y = Math.max(player.radius, Math.min(WORLD_HEIGHT - player.radius, player.y));

      // Camera Position
      let camX = player.x - canvas.width / 2;
      let camY = player.y - canvas.height / 2;
      camX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, camX));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camY));

      setCameraPos({ x: camX, y: camY });

      // Clear Canvas & Render Background
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camX, -camY);

      // Grid Lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 50;
      const startX = Math.floor(camX / gridSize) * gridSize;
      const endX = Math.min(WORLD_WIDTH, camX + canvas.width + gridSize);
      const startY = Math.floor(camY / gridSize) * gridSize;
      const endY = Math.min(WORLD_HEIGHT, camY + canvas.height + gridSize);

      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }

      // Border
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 6;
      ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

      // Range Indicator
      ctx.save();
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.bulletRange, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      dashOffset = (dashOffset + 15 * dt) % 20;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -dashOffset;
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.02)';
      ctx.fill();
      ctx.restore();

      // Enemy Spawner
      if (currentTime - lastSpawnTime > 1100 && enemies.length < 28) {
        const spawnType = Math.random() < 0.65 ? 'PITCHLING' : 'PITCHWALKER';
        spawnEnemy(spawnType);
        lastSpawnTime = currentTime;
      }

      // Aiming & Shooting
      const target = getNearestEnemy();
      if (target) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        player.aimAngle = Math.atan2(dy, dx);
      }

      const timeSinceLastShot = currentTime - player.lastShotTime;

      // Charge-Up Phase
      if (target && timeSinceLastShot >= player.attackInterval - player.chargeDuration) {
        const chargeProgress = Math.min(
          1,
          (timeSinceLastShot - (player.attackInterval - player.chargeDuration)) / player.chargeDuration
        );

        const wandTipX = player.x + Math.cos(player.aimAngle) * 22;
        const wandTipY = player.y + Math.sin(player.aimAngle) * 22;

        ctx.save();
        ctx.beginPath();
        ctx.arc(wandTipX, wandTipY, 3 + chargeProgress * 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + chargeProgress * 0.7})`;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10 * chargeProgress;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(wandTipX, wandTipY, 6 + Math.sin(currentTime * 0.02) * 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(186, 230, 253, ${chargeProgress})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Burst Queue Logic
      if (burstQueue.count > 0 && currentTime - burstQueue.lastBurstTime >= 100) {
        fireSpread(player, bullets);
        burstQueue.count -= 1;
        burstQueue.lastBurstTime = currentTime;
      }

      // Fire Bullet(s) initial trigger
      if (target && timeSinceLastShot >= player.attackInterval) {
        fireSpread(player, bullets);
        burstQueue.count = player.multishot || 0;
        burstQueue.lastBurstTime = currentTime;
        player.lastShotTime = currentTime;
      }

      // Bullets Update & Hitboxes
      for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = bullets[bIndex];

        // Trace Logic (Homing)
        if (player.trace > 0) {
          let closestTraceEnemy = null;
          let minTraceDist = Infinity;
          for (let eIndex = 0; eIndex < enemies.length; eIndex++) {
            const enemy = enemies[eIndex];
            if (enemy.isDead || bullet.hitEnemies.has(enemy.id)) continue;
            const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);
            if (dist < minTraceDist && dist < 300) {
              minTraceDist = dist;
              closestTraceEnemy = enemy;
            }
          }

          if (closestTraceEnemy) {
            const desiredDx = closestTraceEnemy.x - bullet.x;
            const desiredDy = closestTraceEnemy.y - bullet.y;
            const desiredAngle = Math.atan2(desiredDy, desiredDx);
            
            // Adjust velocity towards desired angle based on trace strength
            const currentAngle = Math.atan2(bullet.vy, bullet.vx);
            let angleDiff = desiredAngle - currentAngle;
            // Normalize angleDiff to -PI to PI
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            const turnSpeed = 0.5 + (player.trace * 0.5); // Radians per second
            const turnAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnSpeed * dt);
            
            const newAngle = currentAngle + turnAmount;
            bullet.vx = Math.cos(newAngle) * player.bulletSpeed;
            bullet.vy = Math.sin(newAngle) * player.bulletSpeed;
          }
        }

        const stepX = bullet.vx * dt;
        const stepY = bullet.vy * dt;

        bullet.x += stepX;
        bullet.y += stepY;
        bullet.distanceTraveled += Math.hypot(stepX, stepY);

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();

        let destroyed = false;

        for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) {
          const enemy = enemies[eIndex];
          if (enemy.isDead || bullet.hitEnemies.has(enemy.id)) continue;

          const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);

          if (dist < enemy.radius + bullet.radius) {
            bullet.hitEnemies.add(enemy.id);
            enemy.hp -= bullet.damage;
            enemy.hitTimer = 0.12;

            damageTexts.push({
              x: enemy.x + (Math.random() - 0.5) * 16,
              y: enemy.y - 12,
              damage: bullet.damage,
              alpha: 1.0,
              lifetime: 0.6,
            });

            bulletImpacts.push({
              x: bullet.x,
              y: bullet.y,
              radius: bullet.radius,
              maxRadius: bullet.radius + 16,
              alpha: 1.0,
              lifetime: 0.2,
            });

            // Check Bounce
            if (bullet.bounce > 0) {
              bullet.bounce -= 1;
              let nextTarget = null;
              let minBncDist = Infinity;
              for (let n = 0; n < enemies.length; n++) {
                const bEnemy = enemies[n];
                if (bEnemy.isDead || bullet.hitEnemies.has(bEnemy.id)) continue;
                const bDist = Math.hypot(bEnemy.x - bullet.x, bEnemy.y - bullet.y);
                if (bDist < minBncDist && bDist < 400) {
                  minBncDist = bDist;
                  nextTarget = bEnemy;
                }
              }
              if (nextTarget) {
                const bncAngle = Math.atan2(nextTarget.y - bullet.y, nextTarget.x - bullet.x);
                bullet.vx = Math.cos(bncAngle) * player.bulletSpeed;
                bullet.vy = Math.sin(bncAngle) * player.bulletSpeed;
              }
            } else if (bullet.pierce > 0) {
              // Pierce
              bullet.pierce -= 1;
            } else {
              destroyed = true;
            }

            if (enemy.hp <= 0) {
              enemy.isDead = true;

              stats.score += enemy.scoreValue;
              stats.kills += 1;

              if (scoreRef.current) scoreRef.current.textContent = stats.score;
              if (killsRef.current) killsRef.current.textContent = stats.kills;

              deathEffects.push({
                id: enemy.id,
                typeKey: enemy.typeKey,
                x: enemy.x,
                y: enemy.y,
                radius: enemy.radius,
                spriteScale: enemy.spriteScale,
                deathSpriteSrc: enemy.deathSpriteSrc,
                spawnTime: currentTime,
                duration: 500,
              });

              rollCoinDrop(enemy, enemy.x, enemy.y);

              const newOrbs = createExpOrbs(enemy.x, enemy.y, enemy.expValue);
              expOrbs.push(...newOrbs);

              enemies.splice(eIndex, 1);
            }
            
            if (destroyed) {
              bullets.splice(bIndex, 1);
            }
            break; // Stop evaluating collisions for this bullet if it hit
          }
        }

        if (!destroyed && bullet && bullet.distanceTraveled >= bullet.maxRange) {
          bullets.splice(bIndex, 1);
        }
      }

      // Air Bullet Impacts
      for (let impIndex = bulletImpacts.length - 1; impIndex >= 0; impIndex--) {
        const impact = bulletImpacts[impIndex];
        impact.radius += (impact.maxRadius - impact.radius) * (dt / impact.lifetime);
        impact.alpha -= dt / impact.lifetime;

        if (impact.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(impact.x, impact.y, impact.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(56, 189, 248, ${impact.alpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        } else {
          bulletImpacts.splice(impIndex, 1);
        }
      }

      // Damage Text Popups
      for (let dtIndex = damageTexts.length - 1; dtIndex >= 0; dtIndex--) {
        const dtObj = damageTexts[dtIndex];
        dtObj.y -= 35 * dt;
        dtObj.alpha -= dt / dtObj.lifetime;

        if (dtObj.alpha > 0) {
          ctx.save();
          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = `rgba(239, 68, 68, ${dtObj.alpha})`;
          ctx.shadowColor = `rgba(0, 0, 0, ${dtObj.alpha * 0.5})`;
          ctx.shadowBlur = 4;
          ctx.fillText(`-${dtObj.damage}`, dtObj.x, dtObj.y);
          ctx.restore();
        } else {
          damageTexts.splice(dtIndex, 1);
        }
      }

      // Expire Death GIF Effects
      for (let dIndex = deathEffects.length - 1; dIndex >= 0; dIndex--) {
        const effect = deathEffects[dIndex];
        if (currentTime - effect.spawnTime >= effect.duration) {
          deathEffects.splice(dIndex, 1);
        }
      }
      setActiveDeathEffects([...deathEffects]);

      // Coin Magnet & Drawing
      for (let cIndex = droppedCoins.length - 1; cIndex >= 0; cIndex--) {
        const coin = droppedCoins[cIndex];

        updateCoinMagnet({
          coin,
          player,
          dt,
          stats,
          coinsRef,
          droppedCoins,
          index: cIndex,
        });

        if (droppedCoins[cIndex]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 6;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();
          ctx.restore();
        }
      }

      // EXP Magnet
      for (let eIndex = expOrbs.length - 1; eIndex >= 0; eIndex--) {
        const orb = expOrbs[eIndex];

        updateExpMagnet({
          orb,
          player,
          dt,
          playerState,
          hpBarRef,
          hpTextRef,
          expRef,
          expBarRef,
          levelRef,
          levelUpEffects,
          expOrbs,
          index: eIndex,
          onLevelUp: () => {
            pendingLevelUpsRef.current += 1;
          }
        });

        if (expOrbs[eIndex]) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
          ctx.fillStyle = orb.color;
          ctx.shadowColor = orb.color;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.restore();
        }
      }

      // Level-Up Particles
      for (let lIndex = levelUpEffects.length - 1; lIndex >= 0; lIndex--) {
        const p = levelUpEffects[lIndex];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt / p.lifetime;

        if (p.alpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.restore();
        } else {
          levelUpEffects.splice(lIndex, 1);
        }
      }

      // Enemies Update & Movement
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.hypot(dx, dy);

        if (distToPlayer > 0) {
          let moveAngle = Math.atan2(dy, dx);

          if (enemy.typeKey === 'PITCHWALKER') {
            enemy.erraticAngle += (Math.random() - 0.5) * 4 * dt;
            moveAngle += Math.sin(enemy.erraticAngle) * 0.75;
          }

          enemy.x += Math.cos(moveAngle) * enemy.speed * dt;
          enemy.y += Math.sin(moveAngle) * enemy.speed * dt;
        }

        if (enemy.hitTimer > 0) {
          enemy.hitTimer -= dt;
          ctx.save();
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, enemy.radius + 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fill();
          ctx.restore();
        }

        const barWidth = enemy.barWidth || 24;
        const barHeight = 3;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 8, barWidth, barHeight);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(
          enemy.x - barWidth / 2,
          enemy.y - enemy.radius - 8,
          Math.max(0, (enemy.hp / enemy.maxHp) * barWidth),
          barHeight
        );

        if (distToPlayer < enemy.radius + player.radius) {
          if (currentTime - enemy.lastAttackTime >= enemy.attackInterval) {
            player.hp = Math.max(0, player.hp - enemy.contactDamage);

            if (hpTextRef.current) hpTextRef.current.textContent = `${player.hp} / ${player.maxHp}`;
            if (hpBarRef.current) hpBarRef.current.style.width = `${(player.hp / player.maxHp) * 100}%`;

            if (player.hp <= 0) {
              setFinalTime(formatted);
              setIsGameOver(true);
            }

            enemy.lastAttackTime = currentTime;
          }
        }
      }

      setActiveEnemies([...enemies]);

      // Render Player
      renderPlayer(ctx, player);

      // Render Minimap
      ctx.restore();
      renderMinimap(ctx, canvas, WORLD_WIDTH, WORLD_HEIGHT, enemies, player);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-100 overflow-hidden select-none font-sans">
      <Canvas ref={canvasRef} />

      <DevModePanel 
        playerRef={playerRef} 
        isVisible={isDevMode} 
        hpTextRef={hpTextRef} 
        hpBarRef={hpBarRef} 
      />

      {/* LEVEL UP OVERLAY */}
      <LevelUpOverlay 
        cards={levelUpCards} 
        onSelectCard={handleSelectCard} 
        onSkip={() => handleSelectCard(null)} 
      />

      {/* HTML GIF OVERLAY */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeEnemies.map((enemy) =>
          enemy.typeKey === 'PITCHWALKER' ? (
            <Pitchwalker key={enemy.id} enemy={enemy} cameraPos={cameraPos} />
          ) : (
            <Pitchling key={enemy.id} enemy={enemy} cameraPos={cameraPos} />
          )
        )}

        {activeDeathEffects.map((effect) =>
          effect.typeKey === 'PITCHWALKER' ? (
            <Pitchwalker key={effect.id} enemy={{ ...effect, isDead: true }} cameraPos={cameraPos} />
          ) : (
            <Pitchling key={effect.id} enemy={{ ...effect, isDead: true }} cameraPos={cameraPos} />
          )
        )}
      </div>

      {/* TOP LEFT HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black text-slate-800 tracking-wider">WANDERSHOT</h1>
          
          {/* TAB PAUSE BUTTON */}
          <button
            onClick={() => setIsPaused((prev) => !prev)}
            className="pointer-events-auto flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md text-xs font-extrabold text-amber-700 shadow-xs transition-colors cursor-pointer"
          >
            <kbd className="bg-amber-200/80 px-1 py-0.5 rounded text-[10px] font-mono text-amber-900 border border-amber-300">
              TAB
            </kbd>
            <span>PAUSE</span>
          </button>
        </div>

        <PlayerHpbar hpTextRef={hpTextRef} hpBarRef={hpBarRef} />
      </div>

      {/* TOP RIGHT HUD */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
        <CountKills killsRef={killsRef} />
        <CountCoins coinsRef={coinsRef} />
        <CountScore scoreRef={scoreRef} />
        <SurvivalTimer timerRef={timerRef} />
      </div>

      {/* BOTTOM CENTER EXP BAR */}
      <CountExp levelRef={levelRef} expRef={expRef} expBarRef={expBarRef} />

      {/* BOTTOM RIGHT FPS COUNTER */}
      <FramerateCounter fpsRef={fpsRef} />

      {/* PAUSE OVERLAY */}
      <Pause isPaused={isPaused} isGameOver={isGameOver} />

      {/* GAME OVER SCREEN */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-30">
          <h2 className="text-4xl font-extrabold text-red-500 mb-2">DEFEATED</h2>
          <p className="text-slate-400 mb-2 text-sm">The enemies overwhelmed you.</p>

          <div className="text-amber-400 font-mono text-base font-bold mb-6">
            Survived: <span className="text-white">{finalTime}</span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}