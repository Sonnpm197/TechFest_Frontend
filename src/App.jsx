import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/nlp/LandingPage.jsx";
import Dashboard from "./components/nlp/Dashboard.jsx";
import FallSafe from "./components/dl/FallSafe";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dl" element={<FallSafe />} />
      </Routes>
    </Router>
  );
}

export default App; 