// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Vite's dev server
  },
});

let activePolls = []; // Store active polls
let votes = {}; // Store poll results
let userVotes = {}; // Track which polls users have voted in

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send the list of active polls when a client connects
  socket.emit('active-polls', activePolls);

  socket.on('create-poll', (poll) => {
    const pollId = Date.now(); // Unique ID for each poll
    const newPoll = { ...poll, id: pollId };
    activePolls.push(newPoll);
    votes[pollId] = Array(poll.options.length).fill(0);
    userVotes[socket.id] = userVotes[socket.id] || {};

    io.emit('active-polls', activePolls); // Broadcast active polls to all clients
  });

  socket.on('vote', ({ pollId, optionIndex }) => {
    if (!userVotes[socket.id][pollId]) {
      if (votes[pollId] && votes[pollId][optionIndex] !== undefined) {
        votes[pollId][optionIndex] += 1;
        userVotes[socket.id][pollId] = true; // Mark that the user has voted in this poll

        const poll = activePolls.find(p => p.id === pollId);
        io.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
      }
    } else {
      socket.emit('vote-failed', 'You have already voted in this poll.');
    }
  });

  socket.on('delete-poll', (pollId) => {
    activePolls = activePolls.filter(poll => poll.id !== pollId);
    delete votes[pollId];
    io.emit('active-polls', activePolls); // Update clients with new list of polls
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete userVotes[socket.id];
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
