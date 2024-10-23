import React, { useEffect, useState } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";

const Board = ({
  myTurn,
  setMyTurn,
  socket,
  roomId,
  setRoomId,
  mySymbol,
  setRoom,
  setStartGame,
}) => {
  const [board, setBoard] = useState(new Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  const WINNIG_PATTERNS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const calculateWinner = (currentBoard) => {
    for (let i = 0; i < WINNIG_PATTERNS.length; i++) {
      const [a, b, c] = WINNIG_PATTERNS[i];
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return {
          winner: currentBoard[a],
          pattern: WINNIG_PATTERNS[i],
        };
      }
    }
    return null;
  };

  const handleClick = (index) => {
    const newBoard = [...board];
    newBoard[index] = mySymbol;
    setBoard(newBoard);
    setMyTurn(false);

    const res = calculateWinner(newBoard);
    if (res && res.winner) {
      setGameOver(true);
      setWinner(res.winner);
      for (let index = 0; index < res.pattern.length; index++) {
        const cell = document.getElementById(`cell${res.pattern[index]}`);
        cell.style.backgroundColor = res.winner === "X" ? "#3B82F6" : "#B91C1C";
        cell.style.color = "white";
      }
    }
    if (!res && !newBoard.includes(null)) {
      setWinner("Draw");
    }
    socket.emit("move", { board: newBoard, roomId });
  };

  useEffect(() => {
    socket.on("opponent-move", (resBoard) => {
      setBoard(resBoard);
      setMyTurn(true);

      const res = calculateWinner(resBoard);
      if (res && res.winner) {
        setGameOver(true);
        setWinner(res.winner);
        for (let index = 0; index < res.pattern.length; index++) {
          const cell = document.getElementById(`cell${res.pattern[index]}`);
          cell.style.backgroundColor =
            res.winner === "X" ? "#3B82F6" : "#B91C1C";
          cell.style.color = "white";
        }
        socket.emit("game-over", roomId);
      }
      if (!res && !resBoard.includes(null)) {
        setWinner("Draw");
      }
    });
  }, []);

  const handleLeave = () => {
    socket.emit("leave-room", roomId);
    setRoom(null);
    setStartGame(false);
    setRoomId("");
  };

  const handleExit = () => {
    setRoom(null);
    setStartGame(false);
    setRoomId("");
  };

  useEffect(() => {
    socket.on("opponent-disconnected", () => {
      toast("Opponent disconnected!", {
        position: "top-right",
        duration: 2000,
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
      setRoom(null);
      setStartGame(false);
      setRoomId("");
    });

    return () => {
      socket.off("opponent-disconnected");
    };
  }, [socket]);

  return (
    <div className="w-full h-full flex flex-col space-y-3 justify-center items-center">
      {winner ? (
        <p className="text-center text-xl">
          {winner === "X"
            ? mySymbol === "X"
              ? "You won!"
              : "You lost!"
            : winner === "O"
            ? mySymbol === "O"
              ? "You won!"
              : "You lost!"
            : winner}
        </p>
      ) : (
        <p className="text-xl">
          {myTurn ? "My" : "Opponent"} turn:{" "}
          <span
            className={`${
              myTurn
                ? mySymbol === "X"
                  ? "text-blue-500"
                  : "text-red-700"
                : mySymbol === "X"
                ? "text-red-700"
                : "text-blue-500"
            }`}
          >
            {myTurn ? mySymbol : mySymbol === "X" ? "O" : "X"}
          </span>
        </p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {board.map((item, i) => (
          <button
            onClick={() => handleClick(i)}
            key={i}
            id={`cell${i}`}
            className={`border w-28 h-28 max-[380px]:w-24 max-[380px]:h-24 lg:w-32 lg:h-32 bg-white bg-opacity-10 text-center text-6xl flex justify-center items-center hover:opacity-90 disabled:opacity-90 font-semibold ${
              item === "X" ? "text-blue-500" : "text-red-600"
            }`}
            disabled={item || gameOver || !myTurn}
          >
            <span>{item}</span>
          </button>
        ))}
      </div>
      {!winner ? (
        <button
          onClick={handleLeave}
          className="bg-red-700 p-2 text-white rounded-lg flex items-center gap-1"
        >
          <span>Leave</span>
          <span>
            <FaSignOutAlt />
          </span>
        </button>
      ) : (
        <button
          onClick={handleExit}
          className="bg-gray-700 p-2 text-white rounded-lg flex items-center gap-1"
        >
          <span>Exit</span>
          <span>
            <FaSignOutAlt />
          </span>
        </button>
      )}
    </div>
  );
};

export default Board;
