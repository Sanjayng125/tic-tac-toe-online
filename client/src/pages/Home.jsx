// src/Components/Home.js
import React from "react";
import { Link } from "react-router-dom";
import game from "../assets/game.png";

const Home = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-5 md:p-10 md:gap-5 gap-2 max-md:flex-col">
      <div className="w-full h-full text-center bg-black flex flex-col justify-center items-center flex-1">
        <h1 className="w-full  text-5xl sm:text-5xl lg:text-7xl text-center text-red-700 font-bold break-words">
          Welcome to the <p className="text-blue-500">Tic-Tac-Toe-Online</p>{" "}
          Game!
        </h1>
        <p className="mt-4 text-blue-500 text-3xl sm:text-5xl">
          Play with your friends in real-time!.
        </p>
        <Link to={"/game"} className="p-3 rounded-lg bg-blue-500 w-max mt-5">
          Lets play!
        </Link>
      </div>
      <div className="h-full flex justify-center items-center">
        <img src={game} alt="game image" className="w-full max-w-96" />
      </div>
    </div>
  );
};

export default Home;
