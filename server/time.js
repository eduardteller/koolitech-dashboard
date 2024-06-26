import sqlite3 from 'sqlite3';
import path from 'path';
import express from 'express';
import http from 'http';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const maindir = path.dirname(__filename);
const __dirname = path.join(maindir, '..');

app.use(express.json());

app.post('/new_timer', async (req, res) => {
	try {
		const timerDb = new sqlite3.Database(
			path.join(__dirname, 'data', 'timers.db')
		);

		const runAsyncTime = promisify(timerDb.run.bind(timerDb));
		const closeAsyncTime = promisify(timerDb.close.bind(timerDb));

		await runAsyncTime('INSERT INTO data (name, time) VALUES (?, ?)', [
			req.body.user,
			31557600000,
		]);
		await closeAsyncTime();

		console.log('ADDED NEW TIMER FOR NEW USER:', req.body.user);

		res.json({ msg: 'OK' });
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

app.get('/get_timer', async (req, res) => {
	try {
		const username = req.headers['user'];

		const timerDb = new sqlite3.Database(
			path.join(__dirname, 'data', 'timers.db')
		);

		const closeAsyncTime = promisify(timerDb.close.bind(timerDb));

		const new_data = await new Promise((resolve, reject) => {
			timerDb.get(
				'SELECT time FROM data WHERE name = ?',
				[username],
				(err, data) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(data); // Resolve the Promise with the fetched data
				}
			);
		});

		await closeAsyncTime();

		console.log('SENT TIMER DATA TO:', username, new_data);

		res.json(new_data);
	} catch (err) {
		console.error(err);
		res.status(500).send();
	}
});

cron.schedule('* * * * *', async () => {
	try {
		const timerDb = new sqlite3.Database(
			path.join(__dirname, 'data', 'timers.db')
		);
		const runAsyncTime = promisify(timerDb.run.bind(timerDb));
		const closeAsyncTime = promisify(timerDb.close.bind(timerDb));

		// Update all timers, decrease by 60000ms (1 minute)
		await runAsyncTime(
			'UPDATE data SET time = time - 60000 WHERE time > 60000'
		);
		await closeAsyncTime();

		console.log('Updated timer values for all users.');
	} catch (err) {
		console.error('Error updating timers:', err);
	}
});

server.listen(5091, () => {
	console.log(`Timer is running on http://localhost:5091`);
});
