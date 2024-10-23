// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import Game from "./pages/Game";
import About from "./pages/About";
import "./App.css";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="bg-black h-screen text-white scrollbar-hidden flex flex-col justify-between">
      <Router>
        <div className="w-full">
          <Toaster />
          <Navbar />
        </div>
        <div className="w-full h-full bg-black">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game" element={<Game />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
