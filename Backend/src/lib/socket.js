import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle call events
  socket.on("startCall", ({ to, isVideo, offer }) => {
    console.log("Call start request received:", { from: userId, to, isVideo });
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      console.log(`Emitting incomingCall to socket ${toSocketId}`);
      io.to(toSocketId).emit("incomingCall", {
        from: userId,
        isVideo,
        offer,
      });
    } else {
      console.log(`User ${to} is not online. Socket not found.`);
      socket.emit("callDeclined", { message: "User is offline" });
    }
  });

  socket.on("acceptCall", ({ to, answer }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      io.to(toSocketId).emit("callAccepted", { answer });
    }
  });

  socket.on("endCall", ({ to }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      io.to(toSocketId).emit("callEnded");
    }
  });

  socket.on("callDeclined", ({ to }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      io.to(toSocketId).emit("callDeclined");
      // Also notify the decliner that the call has ended
      socket.emit("callDeclined");
    }
  });

  socket.on("declineCall", ({ to }) => {
    const toSocketId = userSocketMap[to];
    if (toSocketId) {
      io.to(toSocketId).emit("callDeclined");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };