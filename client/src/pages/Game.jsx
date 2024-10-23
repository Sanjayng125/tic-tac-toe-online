import React, { useEffect, useRef, useState } from "react";
import Board from "../Components/Board";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const Game = () => {
  const [roomId, setRoomId] = useState("");
  const socket = useRef();
  const [room, setRoom] = useState(null);
  const [myTurn, setMyTurn] = useState(true);
  const [startGame, setStartGame] = useState(false);
  const [mySymbol, setMySymbol] = useState(null);

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_API_URL);
  }, []);

  const handleJoinRoom = () => {
    if (roomId) {
      socket.current.emit("join-room", roomId);
    }
  };

  const handleCreateRoom = () => {
    if (socket.current) {
      socket.current.emit("create-room");
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("room-created", (resRoomId) => {
        setRoom(resRoomId);
        setMySymbol("X");
        setMyTurn(true);
      });

      socket.current.on("room-joined", (resRoomId) => {
        setMySymbol("O");
        setMyTurn(false);
        setRoom(resRoomId);
        setRoomId("");
      });

      socket.current.on("startGame", () => {
        setStartGame(true);
      });

      socket.current.on("invalid-room", () => {
        toast("Room not found!", {
          position: "top-right",
          duration: 2000,
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      });

      socket.current.on("room-full", () => {
        toast("Room is full!", {
          position: "top-right",
          duration: 2000,
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      });

      socket.current.on("player-left", () => {
        toast("Opponent left the game!", {
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
    }
  }, [socket]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      {room && !startGame && (
        <p className="p-3 text-center text-2xl font-semibold">
          Waiting for other player. invite your friends Room ID:{" "}
          <span className="font-bold">{room}</span>
        </p>
      )}
      {room && startGame && (
        <Board
          myTurn={myTurn}
          setMyTurn={setMyTurn}
          mySymbol={mySymbol}
          socket={socket.current}
          roomId={room}
          setRoomId={setRoomId}
          setRoom={setRoom}
          setStartGame={setStartGame}
        />
      )}
      {!room && !startGame && (
        <div className="w-full flex flex-col justify-center items-center p-3 text-center text-blue-500 font-bold">
          <p className="my-3 text-2xl">
            Create a Room or Join a Room with Room ID and start playing!.
          </p>
          <div className="max-[500px]:w-full w-2/5 p-3 max-w-[450px]">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full outline-none rounded-lg bg-transparent border p-3 text-white"
              placeholder="Room ID"
            />
            <div className="w-full flex flex-wrap items-center gap-2 mt-2">
              <button
                className="w-full p-2 rounded-lg border bg-red-700 text-white"
                onClick={handleJoinRoom}
              >
                Join
              </button>
              <button
                className="w-full p-2 rounded-lg border bg-blue-500 text-white"
                onClick={handleCreateRoom}
              >
                Create room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
