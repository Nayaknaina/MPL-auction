const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Serve index.html for different dashboard paths
app.get('/public/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/team/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/developer/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('placeBid', ({ playerId, bid, teamId }) => { io.emit('bidUpdate', { playerId, bid, teamId }); });
  socket.on('nextPlayer', () => { io.emit('nextPlayer'); });
  socket.on('disconnect', () => { console.log('Client disconnected'); });
  socket.on('ping', (callback) => {
    console.log("client ping")
    callback();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
