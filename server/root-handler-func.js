import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../private/config.js';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const maindir = dirname(__filename);
export const __dirname = path.join(maindir, '..');

export const registerUserHandler = async (req, res) => {
	const UsersDB = new sqlite3.Database(path.join(__dirname, 'data', 'data.db'));

	const { username, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	const stmt = UsersDB.prepare('INSERT INTO User (username, password) VALUES (?, ?)');
	stmt.run([username, hashedPassword], function (err) {
		if (err) {
			UsersDB.close();
			return res.status(400).send('User registration failed');
		}
		res.status(201).send('User registered');
		UsersDB.close();
	});
};

export const loginUserHandler = async (req, res) => {
	const UsersDB = new sqlite3.Database(path.join(__dirname, 'data', 'data.db'));
	const { username, password } = req.body;

	UsersDB.get('SELECT * FROM User WHERE username = ?', [username], async (err, user) => {
		if (err || !user || !(await bcrypt.compare(password, user.password))) {
			UsersDB.close();
			return res.status(401).send('Invalid credentials');
		}
		const token = jwt.sign({ userName: user.username }, config.JWT_SECRET);
		res.json({ token });
		UsersDB.close();
	});
};

export const sendPageHandler = (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
};
