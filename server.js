// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');
// const checkIdFor = require('./middlewares/validateId');



// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static('public'));

// // // Serve index.html for different dashboard paths
// // app.get('/public/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));
// // app.get('/team/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));
// // app.get('/developer/:id', (req, res) => res.sendFile(__dirname + '/public/index.html'));

// app.get('/public/:id', checkIdFor('public'), (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });
// app.get('/team/:id', checkIdFor('team'), (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });
// app.get('/developer/:id', checkIdFor('developer'), (req, res) => {
//   res.sendFile(__dirname + '/public/index.html');
// });

// io.on('connection', (socket) => {
//   console.log('New client connected');
//   socket.on('placeBid', ({ playerId, bid, teamId }) => { io.emit('bidUpdate', { playerId, bid, teamId }); });
//   socket.on('nextPlayer', () => { io.emit('nextPlayer'); });
//   socket.on('disconnect', () => { console.log('Client disconnected'); });
//   socket.on('ping', (callback) => {
//     console.log("client ping")
//     callback();
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on  ${PORT}`);
// });

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const checkIdFor = require('./middlewares/validateId');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [
  { id: 1, name: 'Virat Kohli', age: 36, city: 'Delhi', basePrice: 200000, category: 'Batsman', currentBid: 200000, team: null, image: 'https://ih1.redbubble.net/image.2918240806.2114/flat,750x,075,f-pad,750x1000,f8f8f8.jpg' },
  { id: 2, name: 'Rohit Sharma', age: 38, city: 'Mumbai', basePrice: 180000, category: 'Batsman', currentBid: 180000, team: null, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2LTjAFR8pK4zVrRAlg2YYkQyqFdoyAJE7rGrlYVdJtR3R0pPbm1WtQe8g1g-MZN6UQ9s&usqp=CAU' },
  { id: 3, name: 'Jasprit Bumrah', age: 31, city: 'Ahmedabad', basePrice: 150000, category: 'Bowler', currentBid: 150000, team: null, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2FOXoSn64PairOc3SdDKuHDxp-SUlL2gxWyAqKtaX7sqIdp4Q9SGDHFOj_kECwzZGPjc&usqp=CAU' },
];
let teams = [
  { id: 1, name: 'Team A', budget: 1000000 },
  { id: 2, name: 'Team B', budget: 500000 },
];
let currentPlayerIndex = 0;
let bidHistory = [];



app.use(express.static('public'));

app.get('/public/:id', checkIdFor('public'), (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/team/:id', checkIdFor('team'), (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});
app.get('/developer/:id', checkIdFor('developer'), (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('requestInitState', () => {
    console.log('Sending initial state to client:', socket.id);
    socket.emit('initState', { players, teams, currentPlayerIndex, bidHistory });
  });

  socket.on('placeBid', ({ playerId, bid, teamId }) => {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.id === teamId);
    if (player && team && bid > player.currentBid && bid <= team.budget && !player.team) {
      players = players.map(p =>
        p.id === playerId ? { ...p, currentBid: bid } : p
      );
      bidHistory.push({ playerId, bid, teamId, timestamp: new Date(), action: 'Bid' });
      io.emit('bidUpdate', { playerId, bid, teamId });
    } else if (bid > team.budget) {
      socket.emit('bidError', { message: 'Bid exceeds team budget.' });
    }
  });

  socket.on('sellPlayer', ({ playerId, bid, teamId }) => {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.id === teamId);
    if (player && team && bid > player.basePrice && team.budget >= bid && !player.team) {
      players = players.map(p =>
        p.id === playerId ? { ...p, currentBid: bid, team: teamId } : p
      );
      teams = teams.map(t =>
        t.id === teamId ? { ...t, budget: t.budget - bid } : t
      );
      bidHistory.push({ playerId, bid, teamId, timestamp: new Date(), action: 'Sold' });
      io.emit('playerSold', { playerId, bid, teamId });
    }
  });

  socket.on('nextPlayer', () => {
    if (currentPlayerIndex + 1 < players.length) {
      currentPlayerIndex += 1;
      io.emit('nextPlayer');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  socket.on('ping', (callback) => {
    console.log('Client ping:', socket.id);
    callback();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});