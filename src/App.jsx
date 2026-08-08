import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import CharacterSelect from './components/CharacterSelect';
import Almanac from './components/Almanac';
import Credits from './components/Credits';
import Game from './components/Game';

export default function App() {
  const [gameState, setGameState] = useState('MENU');
  const [selectedClass, setSelectedClass] = useState(null);

  const startGame = (classId) => {
    setSelectedClass(classId);
    setGameState('PLAYING');
  };

  const handleGameOver = () => {
    setGameState('MENU');
  };

  return (
    <>
      {gameState === 'MENU' && <MainMenu setGameState={setGameState} />}
      {gameState === 'CHARACTER_SELECT' && <CharacterSelect setGameState={setGameState} startGame={startGame} />}
      {gameState === 'ALMANAC' && <Almanac setGameState={setGameState} />}
      {gameState === 'CREDITS' && <Credits setGameState={setGameState} />}
      
      {gameState === 'PLAYING' && (
        <Game 
          selectedClass={selectedClass} 
          onGameOver={handleGameOver} 
          backToMenu={() => setGameState('MENU')} 
        />
      )}
    </>
  );
}