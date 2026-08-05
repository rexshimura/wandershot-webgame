import React from 'react';

export default function Pitchling({ enemy, cameraPos }) {
  const screenX = enemy.x - cameraPos.x - enemy.radius * 1.5;
  const screenY = enemy.y - cameraPos.y - enemy.radius * 1.5;
  const size = enemy.radius * 3;

  return (
    <img
      src={enemy.isDead ? enemy.deathSpriteSrc : enemy.spriteSrc}
      alt={enemy.name}
      className="absolute pointer-events-none"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
}