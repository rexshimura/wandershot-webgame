import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import CharacterSelect from './components/CharacterSelect';
import Almanac from './components/Almanac';
import Credits from './components/Credits';
import Game from './components/Game';

export default function App() {
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/play/select" element={<CharacterSelect setSelectedClass={setSelectedClass} />} />
        <Route path="/almanac" element={<Almanac />} />
        <Route path="/credits" element={<Credits />} />
        <Route 
          path="/play/game" 
          element={
            selectedClass ? (
              <Game selectedClass={selectedClass} />
            ) : (
              <Navigate to="/play/select" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}