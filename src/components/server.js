const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Adjust to your React app's URL (e.g., Vite default)
    methods: ['GET', 'POST'],
  },
});

const sessions = new Map(); // Store active sessions

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createSession', ({ sessionId, peerId, userName }) => {
    sessions.set(sessionId, new Set()); // Initialize session
    socket.join(sessionId);
    sessions.get(sessionId).add(peerId);
    socket.to(sessionId).emit('userJoined', { peerId, userName });
    console.log(`Session created: ${sessionId} by ${userName}`);
  });

  socket.on('joinSession', ({ sessionId, peerId, userName }) => {
    if (!sessions.has(sessionId)) {
      socket.emit('sessionError', 'Invalid session ID');
      return;
    }
    socket.join(sessionId);
    sessions.get(sessionId).add(peerId);
    socket.to(sessionId).emit('userJoined', { peerId, userName });
    console.log(`User ${userName} joined session: ${sessionId}`);
  });

  socket.on('updateMicStatus', ({ peerId, isMicOn }) => {
    // Optional: Broadcast mic status to session
  });

  socket.on('updateVideoStatus', ({ peerId, isVideoOn }) => {
    // Optional: Broadcast video status to session
  });

  socket.on('updateStream', ({ peerId, userName }) => {
    // Optional: Notify session of stream changes
  });

  socket.on('disconnect', () => {
    sessions.forEach((peers, sessionId) => {
      if (peers.has(socket.id)) {
        peers.delete(socket.id);
        socket.to(sessionId).emit('userLeft', { peerId: socket.id, userName: 'Unknown' });
        if (peers.size === 0) {
          sessions.delete(sessionId);
        }
      }
    });
    console.log('User disconnected:', socket.id);
  });
});

server.listen(5000, () => {
  console.log('Socket.IO server running on http://localhost:5000');
});