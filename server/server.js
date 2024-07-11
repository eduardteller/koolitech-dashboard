import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
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
import { promisify } from 'util';
import { sendMessage, cmpDBModDate, sendDBFile } from './func.js';
import nodemailer from 'nodemailer';

// const privateKey = await fs.readFile('./private/key.pem', 'utf8');
// const certificate = await fs.readFile('./private/cert.pem', 'utf8');
// const credentials = { key: privateKey, cert: certificate };

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

// app.get('/about', (req, res) => {
// 	res.sendFile(path.join(__dirname, 'public', 'login.html'));
// });

app.get('/contact', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/cookies', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'cookies.html'));
});

app.get('/client', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'client.html'));
});

app.post('/api/email-form', (req, res) => {
	const { name, school, email, phone, text } = req.body;

	console.log(req.body);

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
	const UsersDB = new sqlite3.Database(path.join(__dirname, 'data', 'data.db'));

	const runAsyncSys = promisify(UsersDB.run.bind(UsersDB));
	const closeAsyncSys = promisify(UsersDB.close.bind(UsersDB));
	try {
		const { username, password } = req.body;
		const hashedPassword = await bcrypt.hash(password, 10);

		await runAsyncSys('INSERT INTO User (username, password) VALUES (?, ?)', [
			username,
			hashedPassword,
		]);
		await closeAsyncSys();

		const response2 = await fetch('http://localhost:5091/new_timer', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ user: username }),
		});

		if (!response2.ok) {
			throw new Error('response shit');
		}

		res.json({ status: 'OK' });
	} catch (error) {
		console.error(error);
		await closeAsyncSys();
		return res.status(500).send();
	}
});

// Login route
app.post('/api/login', async (req, res) => {
	const UsersDB = new sqlite3.Database(path.join(__dirname, 'data', 'data.db'));
	const runAsyncSys = promisify(UsersDB.get.bind(UsersDB));
	const closeAsyncSys = promisify(UsersDB.close.bind(UsersDB));
	try {
		const { username, password } = req.body;

		const user = await runAsyncSys('SELECT * FROM User WHERE username = ?', [
			username,
		]);

		if (!user || !(await bcrypt.compare(password, user.password))) {
			const error = new Error();
			throw error;
		}
		const token = await jwt.sign(
			{ userName: user.username },
			config.JWT_SECRET
		);

		await res.json({ token });

		await closeAsyncSys();
	} catch {
		await closeAsyncSys();
		return res.status(500).send();
	}
});

cron.schedule('*/10 * * * *', async () => {
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

				if (response.ok) {
					const processed = await response.json();
					if (processed.time > 60000) {
						sendMessage(
							JSON.stringify({ type: 'timer_left', status: false }),
							schoolName
						);
					} else {
						sendMessage(
							JSON.stringify({ type: 'timer_left', status: true }),
							schoolName
						);
					}
				} else {
					throw new Error('somenths wrong');
				}
			}
		} catch (err) {
			console.error('Error sending timer info:', err);
		}
	}
});

app.get('/api/auth', async (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			res.json({ resp: 'OK' });
		} catch (error) {
			console.log('FAIL');
		}
	}
});

function findClient(school) {
	let gotClient = null;
	for (const [client, schoolName] of clients.entries()) {
		if (schoolName === school) {
			gotClient = client;
		}
	}
	if (!gotClient) {
		return false;
	}
	return gotClient;
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
				selClient.once('message', async (data) => {
					clearTimeout(timeoutId);
					const msg = await JSON.parse(data);
					if (msg.type === 'plan_change_ok') {
						resolve({ STATUS: 'ONLINE' });
						console.log(
							`SUCCESFULLY ENABLED ${req.body.name} BY WEB CLIENT FROM ${school}`
						);
					} else {
						reject(new Error('UNEXPECTED MESSAGE TYPE'));
					}
				});
			});
			if (responseFromWebSocket) {
				res.json(responseFromWebSocket);
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE' });
				console.log(`NOT ENABLED PLAN ${req.body.name} | ${school}`);
				return;
			} else {
				console.error('ENABLE ERROR:', error.type);
				return res.status(500).send();
			}
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
			const dbSystem = new sqlite3.Database(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);
			const dbMain = new sqlite3.Database(
				path.join(
					__dirname,
					'data',
					`${school}`,
					`central_data`,
					`${req.body.dbid}.db`
				)
			);

			// Promisify the run and close methods
			const runAsyncMain = promisify(dbMain.run.bind(dbMain));
			const runAsyncSys = promisify(dbSystem.run.bind(dbSystem));
			const closeAsyncMain = promisify(dbMain.close.bind(dbMain));
			const closeAsyncSys = promisify(dbSystem.close.bind(dbSystem));

			await runAsyncMain(`DELETE FROM Mondays`);
			await runAsyncMain(`DELETE FROM Tuesdays`);
			await runAsyncMain(`DELETE FROM Wednesdays`);
			await runAsyncMain(`DELETE FROM Thursdays`);
			await runAsyncMain(`DELETE FROM Fridays`);
			await runAsyncMain(`DELETE FROM Saturdays`);
			await runAsyncMain(`DELETE FROM Sundays`);

			await runAsyncSys(`DELETE FROM PlanNames WHERE Name = ?`, [
				req.body.name,
			]);

			new_data = await new Promise((resolve, reject) => {
				dbSystem.all('SELECT * FROM PlanNames', (err, rows) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(rows); // Resolve the Promise with the fetched data
				});
			});
			await closeAsyncMain();
			await closeAsyncSys();

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
					const msg = JSON.parse(data);
					if (msg.type === 'refresh_ok') {
						console.log(
							`SUCCESFULLY DELETED ${req.body.name} BY WEB CLIENT FROM ${school}`
						);
						resolve({ STATUS: 'ONLINE', data: new_data });
					} else {
						reject(new Error('UNEXPECTED MESSAGE TYPE'));
					}
				});
			});
			if (responseFromWebSocket) {
				res.json(responseFromWebSocket);
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE', data: new_data });
				console.log(
					`SUCCESFULLY DELETED ${req.body.name} BY WEB CLIENT FROM ${school}`
				);

				return;
			} else {
				console.error('DELETE PLAN ERROR:', error.type);
				return res.status(500).send();
			}
		}
	}
});

app.post('/api/new_plan', async (req, res) => {
	const token = req.headers['authorization'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send('Authentication Failed!');
	} else {
		let new_dat = null;
		try {
			const dbSystem = new sqlite3.Database(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);
			const runAsyncSys = promisify(dbSystem.run.bind(dbSystem));
			const closeAsyncSys = promisify(dbSystem.close.bind(dbSystem));

			const new_data = await new Promise((resolve, reject) => {
				dbSystem.all('SELECT * FROM PlanNames ORDER BY DbId', (err, rows) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(rows); // Resolve the Promise with the fetched data
				});
			});

			let previousDbId = 0; // Assuming the first DbId can be 0 or 1
			let newDbId = 0;
			let newName = '';
			let newID = 0;

			await new_data.forEach((plan) => {
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
			if (new_data) {
				new_data.forEach((plan) => {
					if (plan.Id > newID) {
						newID = plan.Id;
					}
				});
			}
			newID++;

			await runAsyncSys(`INSERT INTO PlanNames VALUES (?, ?, ?, ?)`, [
				newID,
				newName,
				newDbId,
				0,
			]);
			// console.log(`New Plan with ID: ${newID}`);
			new_dat = await new Promise((resolve, reject) => {
				dbSystem.all('SELECT * FROM PlanNames', (err, rows) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(rows); // Resolve the Promise with the fetched data
				});
			});
			await closeAsyncSys();
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
					const msg = JSON.parse(data);
					if (msg.type === 'refresh_ok') {
						console.log(
							`SUCCESFULLY ADDED NEW PLAN BY WEB CLIENT FROM ${school}`
						);
						resolve({ STATUS: 'ONLINE', data: new_dat });
					} else {
						reject(new Error('UNEXPECTED MESSAGE TYPE'));
					}
				});
			});
			if (responseFromWebSocket) {
				res.json(responseFromWebSocket);
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE', data: new_dat });
				console.log(`SUCCESFULLY ADDED NEW PLAN BY WEB CLIENT FROM ${school}`);

				return;
			} else {
				console.error('NEW PLAN PLAN ERROR:', error);
				return res.status(500).send();
			}
		}
	}
});

function checkDBExistance(filePath) {
	return new Promise(async (resolve, reject) => {
		try {
			await fs.access(filePath, fs.constants.F_OK);
			resolve();
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

				resolve();
			} catch (mkdirError) {
				reject(mkdirError);
			}
		}
	});
}

app.get('/api/preset', async (req, res) => {
	const token = req.headers['authorization'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const school = checkToken(token);

			await checkDBExistance(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);

			const dbSystem = new sqlite3.Database(
				path.join(__dirname, 'data', `${school}`, `central_data`, `system.db`)
			);
			// const fileMain = path.join(__dirname, 'data', `${ws.schoolName}`, `central_data`, `${msg.db_index}.db`);

			const closeAsyncSys = promisify(dbSystem.close.bind(dbSystem));

			const resp = await new Promise((resolve, reject) => {
				dbSystem.all('SELECT * FROM PlanNames', (err, rows) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(rows); // Resolve the Promise with the fetched data
				});
			});
			await closeAsyncSys();

			if (resp) {
				res.json({
					data: resp,
					school: checkToken(token),
				});
			}
		} catch (error) {
			console.error('PRESET ERROR:', error);
			return res.status(500).send();
		}
	}
});

app.get('/api/fetch', async (req, res) => {
	const token = req.headers['authorization'];
	const dbid = req.headers['dbid'];
	const day = req.headers['day'];
	const school = req.headers['school'];
	if (!token || !checkToken(token)) {
		return res.status(400).send();
	} else {
		try {
			const dbMain = new sqlite3.Database(
				path.join(__dirname, 'data', `${school}`, `central_data`, `${dbid}.db`)
			);

			let available = false;
			if (findClient(school)) {
				available = true;
			}

			const closeAsyncMain = promisify(dbMain.close.bind(dbMain));
			const resp = await new Promise((resolve, reject) => {
				dbMain.all(`SELECT * FROM ${day}`, (err, rows) => {
					if (err) {
						reject(err); // Reject the Promise if there's an error
						return;
					}
					resolve(rows); // Resolve the Promise with the fetched data
				});
			});

			await closeAsyncMain();

			if (resp) {
				res.json({ data: resp, STATUS: available });
			}
			// console.log(`SUCCESFULLY FETCHED ${day} TO WEB: ${school}`);
		} catch (error) {
			console.error('FETCH ERROR:', error);
			return res.status(500).send();
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
			const dbMain = new sqlite3.Database(
				path.join(
					__dirname,
					'data',
					`${school}`,
					`central_data`,
					`${req.body.dbid}.db`
				)
			);

			// Promisify the run and close methods
			const runAsync = promisify(dbMain.run.bind(dbMain));
			const closeAsync = promisify(dbMain.close.bind(dbMain));

			// Wrap the delete operation in a promise
			await runAsync(`DELETE FROM ${req.body.day}`);

			for (let i = 0; i < req.body.tableData.length; i++) {
				const [Id, Nimi, Aeg, Kirjeldus, Helifail] = req.body.tableData[i];
				await runAsync(`INSERT INTO ${req.body.day} VALUES (?, ?, ?, ?, ?)`, [
					Id,
					Nimi,
					Aeg,
					Kirjeldus,
					Helifail,
				]);
			}

			await closeAsync();

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
					const msg = JSON.parse(data);
					if (msg.type === 'refresh_ok') {
						console.log(
							`SUCCESFULLY UPDATED ${req.body.dbid}.db BY WEB CLIENT FROM ${school}`
						);
						resolve({ STATUS: 'ONLINE' });
					} else {
						reject(new Error('UNEXPECTED MESSAGE TYPE'));
					}
				});
			});

			if (responseFromWebSocket) {
				res.json(responseFromWebSocket);
			}
		} catch (error) {
			if (error.type === 'NOCLIENT') {
				res.json({ STATUS: 'OFFLINE' });
				console.log(
					`SUCCESFULLY UPDATED ${req.body.dbid}.db BY WEB CLIENT FROM ${school}`
				);
			} else {
				console.error('UPDATE ERROR:', error);
				return res.status(500).send();
			}
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

			await sendMessage(JSON.stringify({ type: 'alarm_req' }), school);

			const responseFromWebSocket = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('WebSocket message timeout'));
				}, 5000);
				selClient.once('message', (data) => {
					clearTimeout(timeoutId);
					const msg = JSON.parse(data);
					if (msg.type === 'alarm_started') {
						console.log(`ALARM STARTED IN ${school}`);
						resolve({ STATUS: 'ONLINE', alarm: msg.type });
					} else if (msg.type === 'alarm_stopped') {
						console.log(`ALARM STOPPED IN ${school}`);
						resolve({ STATUS: 'ONLINE', alarm: msg.type });
					} else {
						reject(new Error('UNEXPECTED MESSAGE TYPE'));
					}
				});
			});

			if (responseFromWebSocket) {
				res.json(responseFromWebSocket);
			}
		} catch (error) {
			console.error('ALARM ERROR:', error.message);
			return res.status(500).send();
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
		const msg = JSON.parse(message);
		switch (msg.type) {
			case 'refresh_ok':
				console.log(
					'Succesfully refreshed School PC\n-------------------------------'
				);
				break;

			case 'db_data':
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

					// if (path.basename(filePath) === 'system.db') {
					// 	await sendMessage(JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
					// }
				} catch (error) {
					console.error('db_data error:', error);
				}
				break;

			default:
				break;
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
