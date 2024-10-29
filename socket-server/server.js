const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || 'JWT_SECRET';
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://vite-react-fr3n.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
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

    // Check if the body data is received correctly
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if the username already exists
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user
    users.push({ username, password: hashedPassword });

    console.log(`User registered: ${username}`); // Log for debugging
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error); // Log the error
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
  res.json({ token });
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
  if (token) {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.user = decoded;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.userId);

  socket.emit('active-polls', activePolls);

  socket.on('vote', ({ pollId, optionIndex }) => {
    if (votes[pollId] && votes[pollId][optionIndex] !== undefined) {
      votes[pollId][optionIndex] += 1;
      const poll = activePolls.find((p) => p.id === parseInt(pollId));
      io.emit('poll-results', { pollId, options: poll.options, votes: votes[pollId] });
    } else {
      socket.emit('vote-failed', 'Invalid poll or option');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('Backend server is running on port 3000');
});
