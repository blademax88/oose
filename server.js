const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const adminPermissions = new Array(4).fill(false);
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow requests only from this origin
    methods: ["GET", "POST"] // Allow only GET and POST requests
  }
});

io.on('connection', (socket) => {
  console.log('Admin connected');

  // Listen for launch request from user
  socket.on('launchRequest', () => {
    // Notify all admins about launch request
    io.emit('launchRequest');
  });

  socket.on('systemData', (data) => {
    io.emit('systemData', data);
  });
  socket.on('disconnect', () => {
    console.log('Admin disconnected');
  });
  socket.on('canvasData', (data) => {
    io.emit('canvasData', data); // Broadcast canvas data to all clients
  });
  socket.on('canvasUpdate', (data) => {
    io.emit('canvasUpdate', data);
  });
  socket.on('permissionRequest', () => {
    // Notify all admin clients about the permission request
    io.emit('permissionRequest');
  });

  socket.on('permissionGranted', (adminIndex) => {
    console.log(`Admin ${adminIndex} has granted permission.`);
    adminPermissions[adminIndex - 1] = true; // Update permission status for the admin
    if (adminPermissions.every(status => status)) {
      io.emit('allPermissionsGranted'); // Emit event when all admins have granted permission
    }
  });

  socket.on('permissionGranted', () => {
    socket.broadcast.emit('permissionGranted');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
