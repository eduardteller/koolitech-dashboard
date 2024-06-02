const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
	db.run(
		'CREATE TABLE IF NOT EXISTS User (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)'
	);
});

module.exports = db;
const { JWT_SECRET } = require('./config');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register route
app.post('/api/register', async (req, res) => {
	const { username, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	const stmt = db.prepare(
		'INSERT INTO User (username, password) VALUES (?, ?)'
	);
	stmt.run([username, hashedPassword], function (err) {
		if (err) {
			return res.status(400).send('User registration failed');
		}
		res.status(201).send('User registered');
	});
});

// Login route
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;

	db.get(
		'SELECT * FROM User WHERE username = ?',
		[username],
		async (err, user) => {
			if (err || !user || !(await bcrypt.compare(password, user.password))) {
				return res.status(401).send('Invalid credentials');
			}
			const token = jwt.sign({ userId: user.id }, JWT_SECRET);
			res.json({ token });
		}
	);
});

// Socket.IO Authentication middleware
io.use((socket, next) => {
	const token = socket.handshake.query.token;
	if (!token) return next(new Error('Authentication error'));
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		socket.userId = decoded.userId;
		next();
	} catch (err) {
		next(new Error('Authentication error'));
	}
});

io.on('connection', (socket) => {
	console.log(`User connected: ${socket.userId}`);

	socket.on('message', (message) => {
		console.log(message);
		io.emit('message', message);
	});

	socket.on('disconnect', () => {
		console.log(`User disconnected: ${socket.userId}`);
	});
});

server.listen(3000, () => {
	console.log('Server is running on port 3000');
});
