const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const fs = require('fs');
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
const USERS_FILE = './users.json';
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const loadUsers = () => {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

const saveUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to users file:', error);
  }
};

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

let activePolls = [];
let votes = {};

const generateToken = (userId, isAdmin) => {
  return jwt.sign({ userId, isAdmin }, SECRET_KEY, { expiresIn: '1h' });
};

app.post('/register', async (req, res) => {
  try {
    const { username, password, isAdmin = false } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = loadUsers();
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { username, password: hashedPassword, isAdmin };
    users.push(newUser);
    saveUsers(users);
    console.log(`User registered: ${username}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user.username, user.isAdmin);
  console.log(`User logged in: ${username}`);
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

app.delete('/polls/:pollId', authenticateJWT, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Only admins can delete polls' });
  }

  const { pollId } = req.params;
  const pollIndex = activePolls.findIndex((p) => p.id === parseInt(pollId));

  if (pollIndex === -1) return res.status(404).json({ error: 'Poll not found' });

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

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.userId);
  });
});

server.listen(3000, () => {
  console.log('Backend server is running on port 3000');
});