import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ZoomFly from './pages/ZoomFly';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/zoomfly" element={<ZoomFly />} />
      </Routes>
    </Router>
  );
};

export default App;
