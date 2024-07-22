import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import express from 'express';
import http from 'http';
import config from '../private/config.js';
import cors from 'cors';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { sendMessage, cmpDBModDate, sendDBFile } from './func.js';
import nodemailer from 'nodemailer';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const maindir = path.dirname(__filename);
const __dirname = path.join(maindir, '..');

app.use(express.json());
app.use(cors());

export const clients = new Map();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/contact', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/cookies', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'cookies.html'));
});

app.get('/client', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

const weekDaysMap = new Map([
	['Mondays', 'Esmaspäev'],
	['Tuesdays', 'Teisipäev'],
	['Wednesdays', 'Kolmapäev'],
	['Thursdays', 'Neljapäev'],
	['Fridays', 'Reede'],
	['Saturdays', 'Laupäev'],
	['Sundays', 'Pühapäev'],
]);

const weekDays = [
	'Mondays',
	'Tuesdays',
	'Wednesdays',
	'Thursdays',
	'Fridays',
	'Saturdays',
	'Sundays',
];

async function getDatabaseConnection(dbPath) {
	const db = await open({
		filename: dbPath,
		driver: sqlite3.Database,
	});
	return db;
}

app.post('/api/email-form', (req, res) => {
	const { name, school, email, phone, text } = req.body;

	// Validate the incoming data
	if (!name || !school || !email) {
		return res
			.status(400)
			.json({ error: 'Nimi, Kool, ja Emaili aadress on kohustuslikud.' });
	}

	// Setup Nodemailer transporter
	const transporter = nodemailer.createTransport({
		service: 'gmail', // or use your email service provider
		auth: {
			user: 'eduardteller1@gmail.com', // your email address
			pass: 'snzy cwwy qgug gzsp', // your email password or application-specific password
		},
	});

	// Construct the email options
	const mailOptions = {
		from: email,
		to: 'info@koolitech.ee',
		subject: 'Uus kiri',
		text: `
					Name: ${name}
					School: ${school}
					Email: ${email}
					Phone: ${phone}
					Message: ${text}
			`,
	};

	// Send the email
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return res.status(500).json({ error: 'Failed to send email.' });
		}
		res.status(200).json({ text: 'Email sent successfully!' });
	});
});

// Register route
app.post('/api/register', async (req, res) => {
	const UsersDB = await getDatabaseConnection(
		path.join(__dirname, 'data', 'data.db')
	);

	try {
		const { username, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		await UsersDB.run('INSERT INTO User (username, password) VALUES (?, ?)', [
			username,
			hashedPassword,
		]);

		const responseTimer = await fetch('http://localhost:5091/new_timer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ user: username }),
		});

		if (!responseTimer.ok) {
			throw new Error('response shit');
		}

		await UsersDB.close();

		res.json({ status: 'OK' });
	} catch (error) {
		await UsersDB.close();
		res.status(500).send();
		console.error(error);
	}
});

// Login route
app.post('/api/login', async (req, res) => {
	const UsersDB = await getDatabaseConnection(
		path.join(__dirname, 'data', 'data.db')
	);
	try {
		const { username, password } = req.body;
		const user = await UsersDB.get('SELECT * FROM User WHERE username = ?', [
			username,
		]);
		if (!user || !(await bcrypt.compare(password, user.password))) {
			const error = new Error();
			throw error;
		}
		const token = jwt.sign({ userName: user.username }, config.JWT_SECRET);
		await UsersDB.close();
		res.json({ token });
	} catch (err) {
		await UsersDB.close();
		res.status(500).send();
		console.log(err);
	}
});

app.get('/api/get_timer_left', async (req, res) => {
	try {
		const schoolName = req.headers['school'];
		const response = await fetch('http://localhost:5091/get_timer', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				user: schoolName,
			},
		});

		if (response.ok) {
			const processed = await response.json();
			if (processed.time > 60000) {
				res.send(
					JSON.stringify({
						expired: false,
						time_left: processed.time,
					})
				);
			} else {
				res.send(JSON.stringify({ expired: true, time_left: processed.time }));
			}
		} else {
			throw new Error('TIMER FETCH RESPONSE NOT OK ', response.status);
		}
	} catch (err) {
		console.error(err);
	}
});

cron.schedule('* * * * *', async () => {
	if (clients) {
		try {
			for (const [client, schoolName] of clients.entries()) {
				const response = await fetch('http://localhost:5091/get_timer', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						user: schoolName,
					},
				});

				if (!response.ok) {
					throw new Error('Cron error');
				}
				const processed = await response.json();

				await sendMessage(
					JSON.stringify({
						type: 'timer_left',
						timer: processed.time,
						expired: processed.time > 60000 ? false : true,
					}),
					schoolName
				);
			}
		} catch (err) {
			console.error('Error sending timer info:', err);
		}
	}
});

app.get('/api/auth', (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		res.status(404).json({ status: false });
	} else {
		res.json({ status: true });
	}
});

function findClient(school) {
	let gotClient = null;
	for (const [client, schoolName] of clients.entries()) {
		if (schoolName === school) {
			gotClient = client;
			return gotClient;
		}
	}
	if (!gotClient) {
		return false;
	}
}

app.post('/api/enable_plan', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const selClient = findClient(req.body.school);

			if (!selClient) {
				const error = new Error();
				error.type = 'NOCLIENT'; // Add a custom property
				throw error;
			}

			await sendMessage(
				JSON.stringify({ type: 'enable_req', name: req.body.name }),
				req.body.school
			);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WEBSOCKET MESSAGE TIMEOUT'));
				}, 5000);

				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				});
			});

			const answer = await JSON.parse(responseFromWebSocket);

			if (answer.type === 'plan_change_ok') {
				res.json({ STATUS: 'ONLINE' });
				console.log(
					`SUCCESFULLY ENABLED ${req.body.name} BY WEB CLIENT FROM ${school}`
				);
			} else {
				throw new Error();
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE' });
				console.log(`NOT ENABLED PLAN ${req.body.name} | ${school}`);
				return;
			}
			res.status(500).send();
			console.error('ENABLE ERROR:', error.type);
		}
	}
});

app.post('/api/del_plan', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		let new_data = null;
		try {
			const dbSystem = await getDatabaseConnection(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);
			const dbMain = await getDatabaseConnection(
				path.join(
					__dirname,
					'data',
					`${school}`,
					`central_data`,
					`${req.body.dbid}.db`
				)
			);

			for (const day of weekDays) {
				await dbMain.run(`DELETE FROM ${day}`);
			}

			await dbSystem.run(`DELETE FROM PlanNames WHERE Name = ?`, [
				req.body.name,
			]);

			new_data = await dbSystem.all('SELECT * FROM PlanNames');

			await dbMain.close();
			await dbSystem.close();

			const selClient = findClient(school);

			if (!selClient) {
				const error = new Error();
				error.type = 'NOCLIENT'; // Add a custom property
				throw error;
			}

			const pathArr = ['system.db', `${req.body.dbid}.db`];

			for (const data of pathArr) {
				await sendDBFile(
					path.join(__dirname, 'data', `${school}`, `central_data`, `${data}`),
					school
				);
			}

			await sendMessage(JSON.stringify({ type: 'refresh_req' }), school);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WebSocket message timeout'));
				}, 5000);

				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				});
			});

			const msg = await JSON.parse(responseFromWebSocket);
			if (msg.type === 'refresh_ok') {
				console.log(
					`SUCCESFULLY DELETED ${req.body.name} BY WEB CLIENT FROM ${school}`
				);
				res.json({ STATUS: 'ONLINE', data: new_data });
			} else {
				throw new Error('UNEXPECTED MESSAGE TYPE');
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE', data: new_data });
				console.log(
					`SUCCESFULLY DELETED ${req.body.name} BY WEB CLIENT FROM ${school}`
				);
				return;
			}
			res.status(500).send();
			console.error('DELETE PLAN ERROR:', error);
		}
	}
});

function insertNewPlan(data, name) {
	let previousDbId = 0; // Assuming the first DbId can be 0 or 1
	let newDbId = 0;
	let newName = '';
	let newID = 0;

	for (const plan of data) {
		if (parseInt(plan.DbId) - previousDbId > 1) {
			newDbId = previousDbId + 1;
			return; // Exit the loop, since you found the first gap
		}
		previousDbId = parseInt(plan.DbId);
	}

	if (newDbId === 0) {
		newDbId = previousDbId + 1;
	}
	if (name) {
		newName = name;
	} else {
		newName = 'UUS' + newDbId.toString();
	}
	for (const plan of data) {
		if (plan.Id > newID) {
			newID = plan.Id;
		}
	}
	newID++;

	return { dbid: newDbId, name: newName, id: newID };
}

app.post('/api/new_plan', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		let dataToSend = null;
		try {
			const dbSystem = await getDatabaseConnection(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);

			const new_data = await dbSystem.all(
				'SELECT * FROM PlanNames ORDER BY DbId'
			);

			const { dbid, name, id } = insertNewPlan(new_data, req.body.name);

			await dbSystem.run(`INSERT INTO PlanNames VALUES (?, ?, ?, ?)`, [
				id,
				name,
				dbid,
				0,
			]);
			dataToSend = await dbSystem.all('SELECT * FROM PlanNames');

			await dbSystem.close();
			const selClient = findClient(school);

			if (!selClient) {
				const error = new Error();
				error.type = 'NOCLIENT'; // Add a custom property
				throw error;
			}
			await sendDBFile(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`),
				school
			);
			await sendMessage(JSON.stringify({ type: 'refresh_req' }), school);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WebSocket message timeout'));
				}, 5000);
				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				});
			});

			const msg = JSON.parse(responseFromWebSocket);
			if (msg.type === 'refresh_ok') {
				res.json({ STATUS: 'ONLINE', data: dataToSend });
				console.log(`SUCCESFULLY ADDED NEW PLAN BY WEB CLIENT FROM ${school}`);
			} else {
				throw new Error('UNEXPECTED MESSAGE TYPE');
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE', data: dataToSend });
				console.log(`SUCCESFULLY ADDED NEW PLAN BY WEB CLIENT FROM ${school}`);
				return;
			}
			console.error('NEW PLAN PLAN ERROR:', error);
			res.status(500).send();
		}
	}
});

async function checkDBExistance(filePath) {
	try {
		await fs.access(filePath, fs.constants.F_OK);
		return;
	} catch (error) {
		try {
			const template = path.join(__dirname, 'data', `template`);
			const dest = path.dirname(filePath);
			await fs.mkdir(dest, { recursive: true });
			for (let i = 0; i < 11; i++) {
				if (i < 10) {
					let file = i + 1;
					await fs.copyFile(
						path.join(template, `${file}.db`),
						path.join(dest, `${file}.db`)
					);
				} else {
					let file = 'system';
					await fs.copyFile(
						path.join(template, `${file}.db`),
						path.join(dest, `${file}.db`)
					);
				}
			}
		} catch (mkdirError) {
			console.error(mkdirError);
		}
	}
}

app.get('/api/preset', async (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const school = checkToken(token);

			const pathToDB = path.join(
				__dirname,
				'data',
				`${school}`,
				`central_data`,
				`system.db`
			);

			await checkDBExistance(pathToDB);

			const dbSystem = await getDatabaseConnection(pathToDB);

			const response = await dbSystem.all('SELECT * FROM PlanNames');

			await dbSystem.close();

			if (response) {
				res.json({
					data: response,
					school: school,
				});
			}
		} catch (error) {
			console.error('PRESET ERROR:', error);
			res.status(500).send();
		}
	}
});

app.get('/api/fetch', async (req, res) => {
	const token = req.headers['authorization'];
	const dbid = req.headers['dbid'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			let available = false;

			const dbMain = await getDatabaseConnection(
				path.join(__dirname, 'data', `${school}`, `central_data`, `${dbid}.db`)
			);

			if (findClient(school)) {
				available = true;
			}

			let results = {};
			let queriesCompleted = 0;

			for (const day of weekDays) {
				results[day] = await dbMain.all(`SELECT * FROM ${day}`);
				queriesCompleted += 1;
			}

			await dbMain.close();

			res.json({ data: results, STATUS: available });
		} catch (error) {
			res.status(500).send();
			console.error('FETCH ERROR:', error);
		}
	}
});

app.post('/api/update', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const dbMain = await getDatabaseConnection(
				path.join(
					__dirname,
					'data',
					`${school}`,
					`central_data`,
					`${req.body.dbid}.db`
				)
			);

			for (const [key, value] of weekDaysMap) {
				await dbMain.run(`DELETE FROM ${key}`);
				const tableData = req.body.tableData[value];
				for (let i = 0; i < tableData.length; i++) {
					const { Id, Nimi, Aeg, Kirjeldus, Helifail } = tableData[i];
					await dbMain.run(
						`INSERT OR REPLACE INTO ${key} (Id, Nimi, Aeg, Kirjeldus, Helifail) VALUES (?, ?, ?, ?, ?)`,
						[Id, Nimi, Aeg, Kirjeldus, Helifail]
					);
				}
			}

			const selClient = findClient(school);

			if (!selClient) {
				const error = new Error();
				error.type = 'NOCLIENT'; // Add a custom property
				throw error;
			}
			await sendDBFile(
				path.join(
					__dirname,
					'data',
					`${school}`,
					`central_data`,
					`${req.body.dbid}.db`
				),
				school
			);
			await sendMessage(JSON.stringify({ type: 'refresh_req' }), school);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WebSocket message timeout'));
				}, 5000);
				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				});
			});

			const msg = await JSON.parse(responseFromWebSocket);
			if (msg.type === 'refresh_ok') {
				console.log(
					`SUCCESFULLY UPDATED ${req.body.dbid}.db BY WEB CLIENT FROM ${school}`
				);
				res.json({ STATUS: 'ONLINE' });
			} else {
				throw new Error('UNEXPECTED MESSAGE TYPE');
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE' });
				console.log(
					`SUCCESFULLY UPDATED ${req.body.dbid}.db BY WEB CLIENT FROM ${school}`
				);
				return;
			}
			console.error('UPDATE ERROR:', error);
			res.status(500).send();
		}
	}
});

function checkToken(token) {
	try {
		const decoded = jwt.verify(token, config.JWT_SECRET);
		return decoded.userName;
	} catch (err) {
		console.log(err);
		return false;
	}
}

app.get('/api/alarm_req', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	const alType = req.headers['type'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const selClient = findClient(school);

			if (!selClient) {
				const error = new Error();
				error.type = 'NOCLIENT'; // Add a custom property
				throw error;
			}

			await sendMessage(
				JSON.stringify({ type: 'alarm_req', alarm: alType }),
				school
			);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WebSocket message timeout'));
				}, 5000);
				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					resolve(data);
				});
			});

			const msg = await JSON.parse(responseFromWebSocket);
			if (msg.type === 'alarm_started' || msg.type === 'alarm_stopped') {
				console.log(`${msg.type} IN ${school}`);
				res.json({ STATUS: 'ONLINE', alarm: msg.type });
			} else {
				throw new Error('UNEXPECTED MESSAGE TYPE');
			}
		} catch (error) {
			res.status(500).send();
			console.error('ALARM ERROR:', error.message);
		}
	}
});

wss.on('connection', function connection(ws, req) {
	const clientType = ws.protocol;
	let clientName = '';

	if (clientType.split('|')[0] === 'desktop') {
		const cl = clientType.split('|')[0];
		const sch = clientType.split('|')[1];
		ws.clientType = cl;
		ws.schoolName = sch;
		clientName = ws.schoolName + '|' + ws.clientType;
		clients.set(ws, ws.schoolName);
		console.log(`Client connected: ${clientName}`);
	} else {
		console.log('Unknown Client');
		ws.close(1008, 'Authentication error');
		return;
	}

	ws.on('message', async function incoming(message) {
		const msg = await JSON.parse(message);
		if (msg.type === 'db_data') {
			try {
				const fileData = Buffer.from(msg.data, 'base64');
				const fileMain = path.join(
					__dirname,
					'data',
					`${ws.schoolName}`,
					`central_data`,
					`${msg.db_index}.db`
				);
				const filePath = path.join(
					__dirname,
					'data',
					`${ws.schoolName}`,
					`temp_data`,
					`${msg.db_index}.db`
				);

				await fs.mkdir(path.dirname(fileMain), { recursive: true });
				await fs.mkdir(path.dirname(filePath), { recursive: true });

				await fs.writeFile(filePath, fileData);

				console.log(
					`Received ${fileData.length} bytes and saved to ${filePath}`
				);
				const oldDateInMilliseconds = msg.time_data;
				const oldDate = new Date(oldDateInMilliseconds);

				await fs.utimes(filePath, oldDate, oldDate);

				await cmpDBModDate(fileMain, filePath, ws.schoolName);
			} catch (error) {
				console.error('db_data error:', error);
			}
		}
	});

	ws.on('close', () => {
		console.log(`Client disconnected: ${clientName}`);
		clients.delete(ws);
	});
});

server.listen(5090, () => {
	console.log(`E-Kell Web Server is running on http://localhost:5090`);
});
