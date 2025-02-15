import './App.css'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import CharacterSelect from './pages/CharacterSelect'
import GameScreen from './pages/GameScreen'


function App() {
  return (
   <Router>
    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/character-select" element={<CharacterSelect />}/>
      <Route path="/game" element={<GameScreen />}/>
    </Routes>
   </Router>
  )
}

export default App
