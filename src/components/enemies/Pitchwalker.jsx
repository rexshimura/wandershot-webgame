import React from 'react';

export default function Pitchling({ enemy, cameraPos }) {
  const scale = enemy.spriteScale || 3.0;
  const size = enemy.radius * scale;
  const screenX = enemy.x - cameraPos.x - size / 2;
  const screenY = enemy.y - cameraPos.y - size / 2;

  // Append unique query parameter to death GIF so it plays once from frame 0 on death
  const imgSrc = enemy.isDead
    ? `${enemy.deathSpriteSrc}?death=${enemy.id}`
    : enemy.spriteSrc;

  return (
    <img
      src={imgSrc}
      alt={enemy.name}
      className="absolute top-0 left-0 pointer-events-none"
      style={{
        transform: `translate(${screenX}px, ${screenY}px)`,
        width: `${size}px`,
        height: `${size}px`,
        willChange: 'transform',
      }}
    />
  );
}