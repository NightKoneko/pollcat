const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
const allowedOrigins = [
  'https://pollcat.vercel.app',
  'http://localhost:5173',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const SECRET_KEY = process.env.JWT_SECRET || 'JWT_SECRET';
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

const users = [];
let activePolls = [];
let votes = {};

const generateToken = (userId) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    console.log(`User registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user.username);
  console.log(`User logged in: ${username}`);
  res.json({ token });
});

app.get('/users', authenticateJWT, (req, res) => {
  console.log('User list requested');
  res.json(users.map(u => ({ username: u.username })));
});

app.delete('/users/:username', authenticateJWT, (req, res) => {
  const { username } = req.params;
  const userIndex = users.findIndex(u => u.username === username);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  users.splice(userIndex, 1);
  console.log(`User deleted: ${username}`);
  res.status(200).json({ message: `User ${username} deleted successfully` });
});

app.post('/polls', authenticateJWT, (req, res) => {
  const { question, options } = req.body;
  const pollId = Date.now();
  const newPoll = { id: pollId, question, options, creator: req.user.userId };
  activePolls.push(newPoll);
  votes[pollId] = Array(options.length).fill(0);
  io.emit('active-polls', activePolls);
  res.status(201).json({ message: 'Poll created', poll: newPoll });
});

app.post('/polls/:pollId/vote', authenticateJWT, (req, res) => {
  const { pollId } = req.params;
  const { optionIndex } = req.body;
  const poll = activePolls.find((p) => p.id === parseInt(pollId));

  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  if (!votes[pollId] || votes[pollId][optionIndex] === undefined) {
    return res.status(400).json({ error: 'Invalid vote option' });
  }

  votes[pollId][optionIndex] += 1;
  io.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
  res.status(200).json({ message: 'Vote recorded' });
});

app.delete('/polls/:pollId', authenticateJWT, (req, res) => {
  const { pollId } = req.params;
  const pollIndex = activePolls.findIndex((p) => p.id === parseInt(pollId) && p.creator === req.user.userId);

  if (pollIndex === -1) return res.status(404).json({ error: 'Poll not found or unauthorized' });

  activePolls.splice(pollIndex, 1);
  delete votes[pollId];
  io.emit('active-polls', activePolls);
  res.status(200).json({ message: 'Poll deleted' });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error: Token missing'));

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.userId);

  socket.emit('active-polls', activePolls);

  socket.on('create-poll', (pollData, callback) => {
    const pollId = Date.now();
    const newPoll = { id: pollId, question: pollData.question, options: pollData.options };
    activePolls.push(newPoll);
    votes[pollId] = Array(pollData.options.length).fill(0);
  
    io.emit('active-polls', activePolls);
    console.log("Poll created:", newPoll);
  
    if (callback) callback({ status: 'success', poll: newPoll });
  });  

  socket.on('vote', ({ pollId, optionIndex }) => {
    if (votes[pollId] && votes[pollId][optionIndex] !== undefined) {
      votes[pollId][optionIndex] += 1;
      const poll = activePolls.find((p) => p.id === parseInt(pollId));
      io.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
    } else {
      socket.emit('vote-failed', 'Invalid poll or option');
    }
  });

  socket.on('request-poll-results', (pollId) => {
    const poll = activePolls.find((p) => p.id === pollId);
    if (poll && votes[pollId]) {
      socket.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
    }
  });  

  socket.on('delete-poll', (pollId, callback) => {
    const pollIndex = activePolls.findIndex(poll => poll.id === pollId);
    
    if (pollIndex !== -1) {
      activePolls.splice(pollIndex, 1); // Remove the poll
      delete votes[pollId]; // Optionally remove related votes
      io.emit('active-polls', activePolls); // Emit updated poll list
      console.log("Deleted poll with ID:", pollId); // Log deletion
  
      if (callback) callback({ status: 'success' });
    } else {
      console.error("Poll not found, unable to delete:", pollId);
      if (callback) callback({ status: 'error', message: 'Poll not found' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.userId);
  });
});

server.listen(3000, () => {
  console.log('Backend server is running on port 3000');
});