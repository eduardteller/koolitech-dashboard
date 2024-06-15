import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import express from 'express';
import https from 'https';

import config from '../private/config.js';

import cors from 'cors';

import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

import { sendMessage, cmpDBModDate, sendDBFile } from './func.js';

const privateKey = fs.readFileSync('./private/key.pem', 'utf8');
const certificate = fs.readFileSync('./private/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const server = https.createServer(credentials, app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const maindir = path.dirname(__filename);
const __dirname = path.join(maindir, '..');

app.use(express.json());
app.use(cors());

export const clients = new Map();

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Register route
app.post('/api/register', async (req, res) => {
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
});

// Login route
app.post('/api/login', async (req, res) => {
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
});

app.get('/api/connect', (req, res) => {
	const token = req.body.token;
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		res.status(200).send('Succesfull Auth!');
	}
});

app.post('/api/enable_plan', async (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Enable Failed!');
	} else {
		try {
			await sendMessage('desktop', JSON.stringify({ type: 'enable_req', name: req.body.name }), req.body.school);
			let gotClient = null;
			for (const [client, schoolName] of clients.entries()) {
				if (schoolName === req.body.school) {
					gotClient = client;
				}
			}
			if (!gotClient) {
				return res.status(400).send('Enable Failed!');
			}

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				gotClient.once('message', (data) => {
					const msg = JSON.parse(data);
					if (msg.type === 'plan_change_ok') {
						try {
							setTimeout(() => {
								const dbSystem = new sqlite3.Database('./data/system.db');

								dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
									dbSystem.close(() => {
										res.json({ data: rows, pc: 'online' });
										resolve();
									});
								});
							}, 100);
						} catch (error) {
							console.error('plan_change_ok error:', error.message);
							res.status(500).json({ pc: 'offline' });
							resolve();
						}
					} else {
						console.log('Wrong message?');
					}
				});
			});
		} catch (error) {
			console.error('Enable Req error:', error.message);
		}
	}
});

app.post('/api/del_plan', (req, res) => {
	const token = req.body.token;
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		try {
			const dbSystem = new sqlite3.Database('./data/system.db');
			const dbMain = new sqlite3.Database(`./data/${req.body.dbid}.db`);

			dbMain.run(`DELETE FROM Mondays`);
			dbMain.run(`DELETE FROM Tuesdays`);
			dbMain.run(`DELETE FROM Wednesdays`);
			dbMain.run(`DELETE FROM Thursdays`);
			dbMain.run(`DELETE FROM Fridays`);
			dbMain.run(`DELETE FROM Saturdays`);
			dbMain.run(`DELETE FROM Sundays`);

			dbSystem.run(`DELETE FROM PlanNames WHERE Name = ?`, [req.body.name], (err) => {
				if (err) {
					throw new Error(err.message);
				}
			});

			dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
				console.log('Deleted ' + req.body.name);
				dbMain.close(() => {
					dbSystem.close(() => {
						sendDBFile(`./data/system.db`, req.body.schoolName);
						sendDBFile(`./data/${req.body.dbid}.db`, req.body.schoolName);
						sendMessage('desktop', JSON.stringify({ type: 'refresh_req' }), req.body.schoolName);
						res.send(JSON.stringify({ type: 'preset_data', data: rows }));
					});
				});
			});
		} catch (error) {
			console.error('Delete Plan Error:', error.message);
		}
	}
});

app.post('/api/new_plan', (req, res) => {
	const token = req.body.token;
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		try {
			const dbSystem = new sqlite3.Database('./data/system.db');
			dbSystem.all('SELECT * FROM PlanNames ORDER BY DbId', [], (err, rows) => {
				if (err) {
					throw new Error(err.message);
				}
				let previousDbId = 0; // Assuming the first DbId can be 0 or 1
				let newDbId = 0;
				let newName = '';
				let newID = 0;

				rows.forEach((plan) => {
					if (parseInt(plan.DbId) - previousDbId > 1) {
						newDbId = previousDbId + 1;
						return; // Exit the loop, since you found the first gap
					}
					previousDbId = parseInt(plan.DbId);
				});
				if (newDbId === 0) {
					newDbId = previousDbId + 1;
				}
				if (req.body.name) {
					newName = req.body.name;
				} else {
					newName = 'UUS' + newDbId.toString();
				}
				if (rows) {
					rows.forEach((plan) => {
						if (plan.Id > newID) {
							newID = plan.Id;
						}
					});
				}
				newID++;
				dbSystem.run(`INSERT INTO PlanNames VALUES (?, ?, ?, ?)`, [newID, newName, newDbId, 0], (err) => {
					console.log(`New Plan with ID: ${newID}`);
					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						dbSystem.close(() => {
							res.send(JSON.stringify({ type: 'preset_data', data: rows }));
							sendDBFile(`./data/system.db`, req.body.schoolName);
							sendMessage('desktop', JSON.stringify({ type: 'refresh_req' }), req.body.schoolName);
						});
					});
				});
			});
		} catch (error) {
			console.error('req_new_plan error:', error.message);
		}
	}
});

app.get('/api/preset', (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader || !checkToken(authHeader)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		try {
			const dbSystem = new sqlite3.Database('./data/system.db');
			dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
				if (err) {
					console.error(err);
				}
				res.json({
					data: rows,
				});
				dbSystem.close();
			});
		} catch (error) {
			return res.status(500).send('Soments faki!');
		}
	}
});

app.get('/api/fetch', (req, res) => {
	const token = req.headers['authorization'];
	const dbid = req.headers['dbid'];
	const day = req.headers['day'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Fail!');
	} else {
		try {
			const dbMain = new sqlite3.Database(`./data/${dbid}.db`);
			dbMain.all(`SELECT * FROM ${day}`, [], (err, rows) => {
				if (err) {
					throw new Error(err.message);
				}
				dbMain.close(() => {
					const schoolName = checkToken(token);
					res.status(200).json({ data: rows, school: schoolName });
				});
			});
		} catch (error) {
			console.error('Fetch Error:', error.message);
			return res.status(400).send('Fail!');
		}
	}
});

app.post('/api/update', (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Fail!');
	} else {
		try {
			const dbMain = new sqlite3.Database(`./data/${req.body.dbid}.db`);
			dbMain.run(`DELETE FROM ${req.body.day}`, [], (err) => {
				if (err) {
					throw new Error(err.message);
				}
			});
			let i = 0;
			for (i = 0; i < req.body.tableData.length; i++) {
				const Id = req.body.tableData[i][0];
				const Nimi = req.body.tableData[i][1];
				const Aeg = req.body.tableData[i][2];
				const Kirjeldus = req.body.tableData[i][3];
				const Helifail = req.body.tableData[i][4];
				dbMain.run(`INSERT INTO ${req.body.day} VALUES (?, ?, ?, ?, ?)`, [Id, Nimi, Aeg, Kirjeldus, Helifail], (err) => {
					if (err) {
						throw new Error(err.message);
					}
					dbMain.close(() => {
						sendDBFile(`./data/${req.body.dbid}.db`, req.body.schoolName);
						sendMessage('desktop', JSON.stringify({ type: 'refresh_req' }), req.body.schoolName);

						console.log(`Succesfully updated ${req.body.dbid}.db by Web Client`);
						res.json({ message: 'OK' });
					});
				});
			}
		} catch (error) {
			console.error('update error:', error.message);
			return res.status(400).send('Fail!');
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

wss.on('connection', function connection(ws, req) {
	const clientType = ws.protocol;
	let clientName = '';

	if (clientType.split('_')[0] === 'desktop') {
		const cl = clientType.split('_')[0];
		const sch = clientType.split('_')[1];
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

	ws.on('message', function incoming(message) {
		const msg = JSON.parse(message);
		switch (msg.type) {
			case 'refresh_ok':
				console.log('Succesfully refreshed School PC');
				// sendMessage('web', JSON.stringify({ type: 'refresh_ok' }), ws.schoolName);
				break;

			case 'alarm_req':
				sendMessage('desktop', JSON.stringify({ type: 'alarm_req' }), ws.schoolName);
				break;

			case 'alarm_started':
				sendMessage('web', JSON.stringify({ type: 'alarm_started' }), ws.schoolName);
				break;

			case 'alarm_stopped':
				sendMessage('web', JSON.stringify({ type: 'alarm_stopped' }), ws.schoolName);
				break;

			case 'db_data':
				try {
					const fileData = Buffer.from(msg.data, 'base64');
					const fileMain = `./data/${msg.db_index}.db`;
					const filePath = path.join(__dirname, 'temp_data', `${msg.db_index}.db`);

					fs.writeFile(filePath, fileData, (err) => {
						if (err) {
							throw new Error(`Error writing file: ${err.message}`);
						}

						console.log(`Received ${fileData.length} bytes and saved to ${filePath}`);
						const oldDateInMilliseconds = msg.time_data;
						const oldDate = new Date(oldDateInMilliseconds);

						fs.utimes(filePath, oldDate, oldDate, (err) => {
							if (err) {
								throw new Error(`Error setting file times: ${err.message}`);
							}
							cmpDBModDate(fileMain, filePath, ws.schoolName);
							if (path.basename(filePath) === 'system.db') {
								sendMessage('desktop', JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
							}
						});
					});
				} catch (error) {
					console.error('db_data error:', error.message);
				}
				break;

			default:
				break;
		}
	});

	ws.on('close', () => {
		console.log(`Client disconnected: ${clientName}`);
		if (clientType === 'desktop') {
			sendMessage('web', JSON.stringify({ type: 'School PC OFFLINE' }), ws.schoolName);
		}
		clients.delete(ws);
	});
});

let p_ip = 'localhost';

async function get_ip() {
	let ip = await fetch('https://icanhazip.com').then((response) => response.text());
	return ip;
}

(async () => {
	p_ip = await get_ip();
	server.listen(443, () => {
		console.log(`E-Kell Web Server is running on https://localhost`);
	});
})();
