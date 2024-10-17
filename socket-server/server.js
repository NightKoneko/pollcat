const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const backendURL = process.env.REACT_APP_BACKEND_URL
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: backendURL,
    methods: ['GET', 'POST'],
  },
});

let activePolls = [];
let votes = {};
let userVotes = {};

io.on('connection', (socket) => {
  console.log('a user connected');
 
  socket.emit('active-polls', activePolls);

  socket.on('create-poll', (poll) => {
    const pollId = Date.now();
    const newPoll = { ...poll, id: pollId };
    activePolls.push(newPoll);
    votes[pollId] = Array(poll.options.length).fill(0);
    userVotes[socket.id] = userVotes[socket.id] || {};

    io.emit('active-polls', activePolls);
  });

  socket.on('vote', ({ pollId, optionIndex }) => {
    if (!userVotes[socket.id]) {
      userVotes[socket.id] = {};
    }
  
    if (!userVotes[socket.id][pollId]) {
      if (votes[pollId] && votes[pollId][optionIndex] !== undefined) {
        votes[pollId][optionIndex] += 1;
        userVotes[socket.id][pollId] = true;
  
        const poll = activePolls.find(p => p.id === pollId);
        io.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
      }
    } else {
      socket.emit('vote-failed', 'You have already voted in this poll.');
    }
  });
  

  socket.on('toggle-poll', (pollId) => {
    const poll = activePolls.find(p => p.id === pollId);
    if (poll) {
      // Emit both poll details and current vote counts when a poll is expanded
      io.to(socket.id).emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
    }
  });  

  socket.on('delete-poll', (pollId) => {
    activePolls = activePolls.filter(poll => poll.id !== pollId);
    delete votes[pollId];
    io.emit('active-polls', activePolls);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    delete userVotes[socket.id];
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});
