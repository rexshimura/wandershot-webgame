import React, { useEffect, useRef, useState } from 'react';
import Canvas from './components/Canvas';
import CountCoins, { updateCoinMagnet } from './components/CountCoins';
import CountKills from './components/CountKills';
import CountScore from './components/CountScore';
import FramerateCounter from './components/FramerateCounter';
import { renderMinimap } from './components/Minimap';
import Pause from './components/Pause';
import PlayerHpbar from './components/PlayerHpbar';
import Pitchling from './components/enemies/Pitchling';
import { ENEMY_TYPES } from './config/enemies-config';
import { PLAYER_CONFIG } from './config/player-config';
import { renderPlayer } from './entities/Player';

const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;

export default function App() {
  const canvasRef = useRef(null);
  const hpTextRef = useRef(null);
  const hpBarRef = useRef(null);
  const killsRef = useRef(null);
  const coinsRef = useRef(null);
  const scoreRef = useRef(null);
  const fpsRef = useRef(null);

  const [activeEnemies, setActiveEnemies] = useState([]);
  const [activeDeathEffects, setActiveDeathEffects] = useState([]);
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;

  const isGameOverRef = useRef(false);
  isGameOverRef.current = isGameOver;

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
      keys[e.code] = true;
    };
    const handleKeyUp = (e) => {
      if (e.key !== 'Tab') {
        keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const stats = { score: 0, kills: 0, coins: 0 };
    const player = {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 2,
      ...PLAYER_CONFIG,
      lastShotTime: 0,
      aimAngle: 0,
    };

    let enemies = [];
    let bullets = [];
    let deathEffects = [];
    let droppedCoins = [];
    let damageTexts = [];
    let bulletImpacts = [];
    let lastSpawnTime = performance.now();
    let lastFrameTime = performance.now();

    let frameCount = 0;
    let lastFpsUpdateTime = performance.now();
    let dashOffset = 0;

    let animationFrameId;

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
        id: Math.random(),
        x,
        y,
        hp: type.maxHp,
        lastAttackTime: 0,
        hitTimer: 0,
        isDead: false,
      });
    };

    const rollCoinDrop = (x, y) => {
      const rand = Math.random();
      let count = 0;
      if (rand <= 0.3) count = 2;
      else if (rand <= 0.9) count = 1;

      for (let i = 0; i < count; i++) {
        droppedCoins.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y + (Math.random() - 0.5) * 24,
          radius: 7,
          speed: 0,
        });
      }
    };

    const gameLoop = (currentTime) => {
      animationFrameId = requestAnimationFrame(gameLoop);

      const dt = Math.min((currentTime - lastFrameTime) / 1000, 0.1);
      lastFrameTime = currentTime;

      frameCount++;
      if (currentTime - lastFpsUpdateTime >= 1000) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `${frameCount} FPS`;
        }
        frameCount = 0;
        lastFpsUpdateTime = currentTime;
      }

      if (isPausedRef.current || isGameOverRef.current) return;

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

      // Camera
      let camX = player.x - canvas.width / 2;
      let camY = player.y - canvas.height / 2;
      camX = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, camX));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, camY));

      setCameraPos({ x: camX, y: camY });

      // Render Clear
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(-camX, -camY);

      // Render Grid
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

      // Player Range Indicator
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
      if (currentTime - lastSpawnTime > 1200 && enemies.length < 25) {
        spawnEnemy('PITCHLING');
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

      // Charge-Up
      if (target && timeSinceLastShot >= player.attackInterval - player.chargeDuration) {
        const chargeProgress = Math.min(
          1,
          (timeSinceLastShot - (player.attackInterval - player.chargeDuration)) / player.chargeDuration
        );

        const wandLength = 22;
        const wandTipX = player.x + Math.cos(player.aimAngle) * wandLength;
        const wandTipY = player.y + Math.sin(player.aimAngle) * wandLength;

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

      // Fire Bullet
      if (target && timeSinceLastShot >= player.attackInterval) {
        const wandLength = 22;
        const wandTipX = player.x + Math.cos(player.aimAngle) * wandLength;
        const wandTipY = player.y + Math.sin(player.aimAngle) * wandLength;

        bullets.push({
          x: wandTipX,
          y: wandTipY,
          vx: Math.cos(player.aimAngle) * player.bulletSpeed,
          vy: Math.sin(player.aimAngle) * player.bulletSpeed,
          radius: 6,
          damage: player.bulletDamage,
          distanceTraveled: 0,
          maxRange: player.bulletRange,
        });

        player.lastShotTime = currentTime;
      }

      // Bullets Update & Hitboxes
      for (let bIndex = bullets.length - 1; bIndex >= 0; bIndex--) {
        const bullet = bullets[bIndex];
        const stepX = bullet.vx * dt;
        const stepY = bullet.vy * dt;

        bullet.x += stepX;
        bullet.y += stepY;
        bullet.distanceTraveled += Math.hypot(stepX, stepY);

        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();

        for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) {
          const enemy = enemies[eIndex];
          if (enemy.isDead) continue;

          const dist = Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y);

          if (dist < enemy.radius + bullet.radius) {
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
              radius: 6,
              maxRadius: 22,
              alpha: 1.0,
              lifetime: 0.2,
            });

            bullets.splice(bIndex, 1);

            if (enemy.hp <= 0) {
              enemy.isDead = true;

              stats.score += enemy.scoreValue;
              stats.kills += 1;

              if (scoreRef.current) scoreRef.current.textContent = stats.score;
              if (killsRef.current) killsRef.current.textContent = stats.kills;

              deathEffects.push({
                id: Math.random(),
                x: enemy.x,
                y: enemy.y,
                radius: enemy.radius,
                deathSpriteSrc: enemy.deathSpriteSrc,
                spawnTime: currentTime,
                duration: 500,
              });

              rollCoinDrop(enemy.x, enemy.y);
              enemies.splice(eIndex, 1);
            }
            break;
          }
        }

        if (bullet && bullet.distanceTraveled >= bullet.maxRange) {
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

      // Damage Numbers
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

      // Coin Drops & Magnet
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
          ctx.beginPath();
          ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();
        }
      }

      // Enemies Logic & HP Bars
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.hypot(dx, dy);

        if (distToPlayer > 0) {
          enemy.x += (dx / distToPlayer) * enemy.speed * dt;
          enemy.y += (dy / distToPlayer) * enemy.speed * dt;
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

        const barWidth = 24;
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

      {/* HTML OVERLAY FOR FULLY ANIMATED GIF SPRITES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeEnemies.map((enemy) => (
          <Pitchling key={enemy.id} enemy={enemy} cameraPos={cameraPos} />
        ))}

        {activeDeathEffects.map((effect) => (
          <Pitchling key={effect.id} enemy={{ ...effect, isDead: true }} cameraPos={cameraPos} />
        ))}
      </div>

      {/* TOP LEFT HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-wider">WANDERSHOT</h1>
          <p className="text-slate-500 text-xs">
            WASD to Move • Auto-Attack • <span className="text-amber-600 font-bold">[TAB] Pause</span>
          </p>
        </div>

        <PlayerHpbar hpTextRef={hpTextRef} hpBarRef={hpBarRef} />
      </div>

      {/* TOP RIGHT HUD */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3 pointer-events-none">
        <CountKills killsRef={killsRef} />
        <CountCoins coinsRef={coinsRef} />
        <CountScore scoreRef={scoreRef} />
      </div>

      {/* BOTTOM RIGHT FPS COUNTER */}
      <FramerateCounter fpsRef={fpsRef} />

      {/* PAUSE OVERLAY */}
      <Pause isPaused={isPaused} isGameOver={isGameOver} />

      {/* GAME OVER SCREEN */}
      {isGameOver && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-30">
          <h2 className="text-4xl font-extrabold text-red-500 mb-2">DEFEATED</h2>
          <p className="text-slate-400 mb-6 text-sm">The Pitchlings overwhelmed you.</p>

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