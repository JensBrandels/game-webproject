import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SelectionScreen from "./pages/SelectionScreen";
import GameScreen from "./pages/GameScreen";
import MapEditor from "./pages/MapEditor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/character-select" element={<SelectionScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/mapeditor" element={<MapEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
