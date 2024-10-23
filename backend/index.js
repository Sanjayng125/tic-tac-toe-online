import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 8000;

const __dirname1 = path.resolve();

// for build
app.use(express.static(path.join(__dirname1, "./client/dist")));

// middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// for build
app.use("*", (req, res) => {
  res.sendFile(path.join(__dirname1, "./client/dist/index.html"));
});

server.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});

// socket.io ------------------------------------------------------------------------------
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  },
});

const rooms = {};
const playerRooms = {};

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

io.on("connection", (socket) => {
  // create a room
  socket.on("create-room", () => {
    let roomId = generateRoomId();
    while (rooms[roomId]) roomId = generateRoomId();

    rooms[roomId] = {
      players: [socket.id],
    };
    playerRooms[socket.id] = roomId;

    socket.join(roomId);

    io.to(socket.id).emit("room-created", roomId);
  });

  // join a room
  socket.on("join-room", (roomId) => {
    if (rooms[roomId]) {
      if (rooms[roomId].players.length < 2) {
        socket.join(roomId);

        rooms[roomId].players.push(socket.id);
        playerRooms[socket.id] = roomId;

        io.to(socket.id).emit("room-joined", roomId);

        io.to(roomId).emit("startGame");
      } else {
        io.to(socket.id).emit("room-full");
      }
    } else {
      io.to(socket.id).emit("invalid-room");
    }
    // console.log(rooms);
  });

  // handle move
  socket.on("move", ({ board, roomId }) => {
    for (let i = 0; i < rooms[roomId].players.length; i++) {
      if (rooms[roomId].players[i] !== socket.id) {
        io.to(rooms[roomId].players[i]).emit("opponent-move", board);
      }
    }
  });

  // handle room leave
  socket.on("leave-room", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].players = rooms[roomId].players.filter(
        (player) => player !== socket.id
      );
      // inform to other player
      io.to(rooms[roomId].players[0]).emit("player-left");
      // remove other player from player to room mapping
      if (playerRooms[rooms[roomId].players[0]])
        delete playerRooms[rooms[roomId].players[0]];
      // delete the room
      delete rooms[roomId];
    }
    // remove the player from player to room mapping
    if (playerRooms[socket.id]) delete playerRooms[socket.id];
  });

  // handle game over
  socket.on("game-over", (roomId) => {
    if (rooms[roomId]) {
      for (let i = 0; i < rooms[roomId].players.length; i++) {
        const playerId = rooms[roomId].players[i];
        if (playerRooms[playerId]) delete playerRooms[playerId];
      }
      delete rooms[roomId];
    }
  });

  socket.on("disconnect", () => {
    // get room Id
    const roomId = playerRooms[socket.id];
    if (roomId && rooms[roomId]) {
      const otherPlayerId = rooms[roomId].players.filter(
        (playerId) => playerId !== socket.id
      );

      if (otherPlayerId) socket.to(otherPlayerId).emit("opponent-disconnected");

      // delete both players room mappings
      delete playerRooms[socket.id];
      delete playerRooms[otherPlayerId];

      // delete room
      delete rooms[roomId];
    }
  });
});
