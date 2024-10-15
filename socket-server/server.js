
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
let votes = {};

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send the list of active polls when a client connects
  socket.emit('active-polls', activePolls);

  socket.on('create-poll', (poll) => {
    const pollId = Date.now(); // Unique ID for each poll
    const newPoll = { ...poll, id: pollId };
    activePolls.push(newPoll);
    votes[pollId] = Array(poll.options.length).fill(0);

    io.emit('active-polls', activePolls); // Broadcast active polls to all clients
    io.emit('poll', newPoll); // Broadcast the new poll
  });

  socket.on('vote', ({ pollId, optionIndex }) => {
    if (votes[pollId] && votes[pollId][optionIndex] !== undefined) {
      votes[pollId][optionIndex] += 1;
      const poll = activePolls.find(p => p.id === pollId);
      io.emit('poll-results', { options: poll.options, votes: votes[pollId] });
    }
  });

  socket.on('delete-poll', (pollId) => {
    activePolls = activePolls.filter(poll => poll.id !== pollId);
    delete votes[pollId];
    io.emit('active-polls', activePolls); // Update clients with new list of polls
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});