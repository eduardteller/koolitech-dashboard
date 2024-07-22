import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import express from 'express';
import http from 'http';
import cron from 'node-cron';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const maindir = path.dirname(__filename);
const __dirname = path.join(maindir, '..');

app.use(express.json());

async function getDatabaseConnection(dbPath) {
	const db = await open({
		filename: dbPath,
		driver: sqlite3.Database,
	});
	return db;
}

app.post('/new_timer', async (req, res) => {
	try {
		const timerDb = await getDatabaseConnection(
			path.join(__dirname, 'data', 'timers.db')
		);
		await timerDb.run('INSERT INTO data (name, time) VALUES (?, ?)', [
			req.body.user,
			31557600000,
		]);
		console.log('ADDED NEW TIMER FOR NEW USER:', req.body.user);
		await timerDb.close();
		res.json({ msg: 'OK' });
	} catch (err) {
		console.error('new timer', err);
		await timerDb.close();
		res.status(500).send();
	}
});

app.get('/get_timer', async (req, res) => {
	try {
		const username = req.headers['user'];
		const timerDb = await getDatabaseConnection(
			path.join(__dirname, 'data', 'timers.db')
		);
		const new_data = await timerDb.get('SELECT time FROM data WHERE name = ?', [
			username,
		]);
		await timerDb.close();
		res.json(new_data);
		console.log('SENT TIMER DATA TO:', username, new_data);
	} catch (err) {
		await timerDb.close();
		res.status(500).send();
		console.error(err);
	}
});

cron.schedule('* * * * *', async () => {
	try {
		const timerDb = await getDatabaseConnection(
			path.join(__dirname, 'data', 'timers.db')
		);
		await timerDb.run('UPDATE data SET time = time - 60000 WHERE time > 60000');
		await timerDb.close();
	} catch (err) {
		await timerDb.close();
		console.error('Error updating timers:', err);
	}
});

server.listen(5091, () => {
	console.log(`Timer is running on http://localhost:5091`);
});
