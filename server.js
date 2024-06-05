const webSocket = require('ws');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const express = require('express');
const https = require('https');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const privateKey = fs.readFileSync('./private/key.pem', 'utf8');
const certificate = fs.readFileSync('./private/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const server = https.createServer(credentials, app);
const main = new sqlite3.Database(path.join(__dirname, 'data', 'data.db'));

let dbIndex = 1;

const wss = new webSocket.Server({ server });
const clients = new Map();
let day;

module.exports = main;
const { JWT_SECRET } = require('./config');

app.use(express.json());

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

// Register route
app.post('/api/register', async (req, res) => {
	const { username, password } = req.body;
	const hashedPassword = await bcrypt.hash(password, 10);

	const stmt = main.prepare(
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

	main.get(
		'SELECT * FROM User WHERE username = ?',
		[username],
		async (err, user) => {
			if (err || !user || !(await bcrypt.compare(password, user.password))) {
				return res.status(401).send('Invalid credentials');
			}
			const token = jwt.sign({ userName: user.username }, JWT_SECRET);
			res.json({ token });
		}
	);
});

wss.on('connection', function connection(ws, req) {
	const clientType = ws.protocol;
	let clientName = '';

	// if (clientType !== 'webpage' && clientType !== 'desktopapp') {
	// 	ws.close(1008, 'Suspicious connection');
	// } else

	if (clientType === 'web') {
		const token = req.url.split('=')[1];
		if (!token) {
			ws.close(1008, 'Authentication error');
			return;
		}

		try {
			const decoded = jwt.verify(token, JWT_SECRET);
			ws.schoolName = decoded.userName;
			ws.clientType = ws.protocol;
			clientName = ws.schoolName + '|' + ws.clientType;
		} catch (err) {
			ws.close(1008, 'Authentication error');
			return;
		}
	} else if (clientType.split('_')[0] === 'desktop') {
		const cl = clientType.split('_')[0];
		const sch = clientType.split('_')[1];
		ws.clientType = cl;
		ws.schoolName = sch;
		clientName = ws.schoolName + '|' + ws.clientType;
	} else {
		ws.close(1008, 'Authentication error');
		return;
	}
	clients.set(ws, ws.schoolName);
	console.log(`Client connected: ${clientName}`);

	ws.on('message', async function incoming(message) {
		const msg = JSON.parse(message);

		let dbSystem;
		let dbMain;

		switch (msg.type) {
			case 'fetch':
				try {
					dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
					day = msg.day;
					dbMain.all(`SELECT * FROM ${day}`, [], (err, rows) => {
						if (err) {
							throw new Error(err.message);
						}
						// ws.send(JSON.stringify({ type: 'data', data: rows }));
						sendToClientType(
							'web',
							JSON.stringify({ type: 'data', data: rows }),
							ws.schoolName
						);
					});
					dbMain.close();
				} catch (error) {
					console.error('fetch error:', error.message);
				}
				break;
			case 'update':
				try {
					dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
					day = msg.day;
					dbMain.run(`DELETE FROM ${day}`, [], (err) => {
						if (err) {
							throw new Error(err.message);
						}
					});
					let i = 0;
					for (i = 0; i < msg.tableData.length; i++) {
						const Id = msg.tableData[i][0];
						const Nimi = msg.tableData[i][1];
						const Aeg = msg.tableData[i][2];
						const Kirjeldus = msg.tableData[i][3];
						const Helifail = msg.tableData[i][4];
						dbMain.run(
							`INSERT INTO ${day} VALUES (?, ?, ?, ?, ?)`,
							[Id, Nimi, Aeg, Kirjeldus, Helifail],
							(err) => {
								if (err) {
									throw new Error(err.message);
								}
							}
						);
					}
					sendFileThroughWebSocket(`./data/${dbIndex}.db`, ws.schoolName);
					sendToClientType(
						'desktop',
						JSON.stringify({ type: 'refresh_req' }),
						ws.schoolName
					);
					console.log(`Succesfully updated ${dbIndex}.db by Web Client`);
					dbMain.close((err) => {
						if (err) {
							throw new Error(err.message);
						}
					});
				} catch (error) {
					console.error('update error:', error.message);
				}
				break;
			case 'preset':
				try {
					dbSystem = new sqlite3.Database('./data/system.db');
					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						if (err) {
							console.error(err);
						}
						// ws.send(JSON.stringify({ type: 'preset_data', data: rows }));
						sendToClientType(
							'web',
							JSON.stringify({
								type: 'preset_data',
								data: rows,
								name: ws.schoolName,
							}),
							ws.schoolName
						);
					});
				} catch (error) {
					console.error('preset error:', error.message);
				}
				break;
			case 'req_new_plan':
				try {
					dbSystem = new sqlite3.Database('./data/system.db');
					dbSystem.all(
						'SELECT * FROM PlanNames ORDER BY DbId',
						[],
						(err, rows) => {
							if (err) {
								throw new Error(err.message);
							}
							let previousDbId = 0; // Assuming the first DbId can be 0 or 1
							let newDbId = 0;
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
							let newName = '';
							if (msg.name) {
								newName = msg.name;
							} else {
								newName = 'UUS' + newDbId.toString();
							}
							let newID = 0;
							if (rows) {
								// newID = parseInt(rows[rows.length - 1].Id) + 1;
								rows.forEach((plan) => {
									if (plan.Id > newID) {
										newID = plan.Id;
									}
								});
							}
							newID++;
							dbSystem.run(
								`INSERT INTO PlanNames VALUES (?, ?, ?, ?)`,
								[newID, newName, newDbId, 0],
								(err) => {
									if (err) {
										throw new Error(err.message);
									}
									console.log(`New Plan with ID: ${newID}`);
									dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
										if (err) {
											throw new Error(err.message);
										}
										sendToClientType(
											'web',
											JSON.stringify({ type: 'preset_data', data: rows }),
											ws.schoolName
										);
										sendFileThroughWebSocket(`./data/system.db`, ws.schoolName);
										sendToClientType(
											'desktop',
											JSON.stringify({ type: 'refresh_req' }),
											ws.schoolName
										);
									});
								}
							);
						}
					);
					dbSystem.close();
				} catch (error) {
					console.error('req_new_plan error:', error.message);
				}
				break;
			case 'req_del_plan':
				try {
					dbSystem = new sqlite3.Database('./data/system.db');
					dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
					dbMain.run(`DELETE FROM Mondays`);
					dbMain.run(`DELETE FROM Tuesdays`);
					dbMain.run(`DELETE FROM Wednesdays`);
					dbMain.run(`DELETE FROM Thursdays`);
					dbMain.run(`DELETE FROM Fridays`);
					dbMain.run(`DELETE FROM Saturdays`);
					dbMain.run(`DELETE FROM Sundays`);

					dbSystem.run(
						`DELETE FROM PlanNames WHERE Name = ?`,
						[msg.name],
						(err) => {
							if (err) {
								throw new Error(err.message);
							}
						}
					);

					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						if (err) {
							throw new Error(err.message);
						}
						sendToClientType(
							'web',
							JSON.stringify({ type: 'preset_data', data: rows }),
							ws.schoolName
						);
						sendFileThroughWebSocket(`./data/system.db`, ws.schoolName);
						sendFileThroughWebSocket(`./data/${dbIndex}.db`, ws.schoolName);
						sendToClientType(
							'desktop',
							JSON.stringify({ type: 'refresh_req' }),
							ws.schoolName
						);
					});

					console.log('Deleted ' + msg.name);
					dbMain.close();
					dbSystem.close();
				} catch (error) {
					console.error('req_del_plan error:', error.message);
				}
				break;
			case 'sel_db':
				dbIndex = msg.data;
				break;
			case 'enable_req':
				try {
					sendToClientType(
						'desktop',
						JSON.stringify({ type: msg.type, name: msg.name }),
						ws.schoolName
					);
					console.log(`Use: ${msg.name} sent to desktop`);
				} catch (error) {
					console.error('enable_req error:', error.message);
				}
				break;
			case 'plan_change_ok':
				try {
					dbSystem = new sqlite3.Database('./data/system.db');

					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						if (err) {
							throw new Error(err.message);
						}
						sendToClientType(
							'web',
							JSON.stringify({ type: 'preset_data', data: rows }),
							ws.schoolName
						);
					});
					dbSystem.close();
				} catch (error) {
					console.error('plan_change_ok error:', error.message);
				}

				break;
			case 'refresh_ok':
				console.log('Succesfully refreshed School PC');
				sendToClientType(
					'web',
					JSON.stringify({ type: 'refresh_ok' }),
					ws.schoolName
				);
				break;
			case 'alarm_req':
				sendToClientType(
					'desktop',
					JSON.stringify({ type: 'alarm_req' }),
					ws.schoolName
				);
				break;
			case 'alarm_started':
				sendToClientType(
					'web',
					JSON.stringify({ type: 'alarm_started' }),
					ws.schoolName
				);
				break;
			case 'alarm_stopped':
				sendToClientType(
					'web',
					JSON.stringify({ type: 'alarm_stopped' }),
					ws.schoolName
				);
				break;
			case 'db_data':
				try {
					const fileData = Buffer.from(msg.data, 'base64');
					const fileMain = `./data/${msg.db_index}.db`;
					const filePath = path.join(
						__dirname,
						'temp_data',
						`${msg.db_index}.db`
					);

					fs.writeFile(filePath, fileData, (err) => {
						if (err) {
							throw new Error(`Error writing file: ${err.message}`);
						}

						console.log(
							`Received ${fileData.length} bytes and saved to ${filePath}`
						);
						const oldDateInMilliseconds = msg.time_data;
						const oldDate = new Date(oldDateInMilliseconds);

						fs.utimes(filePath, oldDate, oldDate, (err) => {
							if (err) {
								throw new Error(`Error setting file times: ${err.message}`);
							}
							compareModifiedDates(fileMain, filePath, ws.schoolName);
							if (path.basename(filePath) === 'system.db') {
								sendToClientType(
									'desktop',
									JSON.stringify({ type: 'refresh_req' }),
									ws.schoolName
								);
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
			sendToClientType(
				'web',
				JSON.stringify({ type: 'School PC OFFLINE' }),
				ws.schoolName
			);
		}
		clients.delete(ws);
	});
});

async function sendToClientType(type, message, school) {
	let sent = false;
	for (const [client, schoolName] of clients.entries()) {
		if (client.clientType === type && schoolName === school) {
			sent = true;
			await client.send(message);
		}
	}
	if (!sent) {
		console.error(`Cant send shit, NOT connected to ${school + '|' + type}!`);
	}
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function compareModifiedDates(file1Path, file2Path, school) {
	fs.access(file1Path, fs.constants.F_OK, (err) => {
		if (err) {
			console.log(
				`Received ${path.basename(
					file1Path
				)} from school pc dont exist on server, copying...`
			);
			fs.rename(file2Path, file1Path, (err) => {
				if (err) {
					throw new Error(err.message);
				}
			});
		} else {
			fs.stat(file1Path, (err1, stats1) => {
				if (err1) {
					throw new Error(err1.message);
				}

				fs.stat(file2Path, (err2, stats2) => {
					if (err2) {
						throw new Error(err2.message);
					}

					const file1ModifiedDate = stats1.mtime;
					const file2ModifiedDate = stats2.mtime;

					// console.log(file1ModifiedDate + ' | ' + file2ModifiedDate);

					if (file2ModifiedDate > file1ModifiedDate) {
						console.log(
							`Recieved ${path.basename(
								file1Path
							)} from School PC is newer, replacing...`
						);
						fs.unlink(file1Path, (err) => {
							if (err) {
								throw new Error(err.message);
							}
							fs.rename(file2Path, file1Path, (err) => {
								if (err) {
									throw new Error(err.message);
								}
							});
						});
					} else if (file2ModifiedDate < file1ModifiedDate) {
						console.log(
							`Sending updated ${path.basename(file1Path)} to To School PC`
						);
						delay(100);
						sendFileThroughWebSocket(file1Path, school);
					}
				});
			});
		}
	});
}

async function sendFileThroughWebSocket(filePath, school) {
	const stats = fs.statSync(filePath);
	const lastModified = stats.mtime;
	const unixTimestampMilliseconds = lastModified.getTime();

	const fileData = fs.readFileSync(filePath);
	const base64Data = fileData.toString('base64');

	const messageDB = {
		type: 'new_data',
		data: base64Data,
		name: path.basename(filePath),
		time_data: unixTimestampMilliseconds,
	};

	const jsonMessage = JSON.stringify(messageDB);

	await sendToClientType('desktop', jsonMessage, school);
	console.log(`Sending ${path.basename(filePath)} to To School PC`);
}

server.listen(8081, () => {
	console.log('WebSocket server is running on https://localhost:8081');
});
