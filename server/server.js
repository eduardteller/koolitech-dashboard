import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

import express from 'express';
import https from 'https';

import config from '../private/config.js';

import cors from 'cors';

import { sendToClientType, compareModifiedDates, sendFileThroughWebSocket } from './func.js';
import { registerUserHandler, loginUserHandler, getIndexHtml, __dirname } from './root-handler-func.js';

const privateKey = fs.readFileSync('./private/key.pem', 'utf8');
const certificate = fs.readFileSync('./private/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const app = express();
const server = https.createServer(credentials, app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(cors());

let dbIndex = 1;
export const clients = new Map();
let day;

app.get('/', getIndexHtml);

app.use(express.static(path.join(__dirname, 'public')));

// Register route
app.post('/api/register', registerUserHandler);

// Login route
app.post('/api/login', loginUserHandler);

wss.on('connection', function connection(ws, req) {
	const clientType = ws.protocol;
	let clientName = '';

	if (clientType === 'web') {
		const token = req.url.split('=')[1];
		if (!token) {
			console.log('1');

			ws.close(1008, 'Authentication error');
			return;
		}

		try {
			const decoded = jwt.verify(token, config.JWT_SECRET);
			ws.schoolName = decoded.userName;
			ws.clientType = ws.protocol;
			clientName = ws.schoolName + '|' + ws.clientType;
			clients.set(ws, ws.schoolName);
			console.log(`Client connected: ${clientName}`);
		} catch (err) {
			ws.close(1008, 'Authentication error');
			console.log('2');
			return;
		}
	} else if (clientType.split('_')[0] === 'desktop') {
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
			case 'fetch':
				try {
					const dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
					day = msg.day;
					dbMain.all(`SELECT * FROM ${day}`, [], (err, rows) => {
						if (err) {
							throw new Error(err.message);
						}
						dbMain.close(() => {
							sendToClientType('web', JSON.stringify({ type: 'data', data: rows }), ws.schoolName);
						});
					});
				} catch (error) {
					console.error('fetch error:', error.message);
				}
				break;

			case 'update':
				try {
					const dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
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
						dbMain.run(`INSERT INTO ${day} VALUES (?, ?, ?, ?, ?)`, [Id, Nimi, Aeg, Kirjeldus, Helifail], (err) => {
							if (err) {
								throw new Error(err.message);
							}
						});
					}
					dbMain.close(() => {
						sendFileThroughWebSocket(`./data/${dbIndex}.db`, ws.schoolName);
						sendToClientType('desktop', JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
						console.log(`Succesfully updated ${dbIndex}.db by Web Client`);
					});
				} catch (error) {
					console.error('update error:', error.message);
				}
				break;

			case 'preset':
				try {
					const dbSystem = new sqlite3.Database('./data/system.db');
					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						if (err) {
							console.error(err);
						}
						sendToClientType(
							'web',
							JSON.stringify({
								type: 'preset_data',
								data: rows,
								name: ws.schoolName,
							}),
							ws.schoolName
						);
						dbSystem.close();
					});
				} catch (error) {
					console.error('preset error:', error.message);
				}
				break;

			case 'req_new_plan':
				try {
					const dbSystem = new sqlite3.Database('./data/system.db');
					dbSystem.all('SELECT * FROM PlanNames ORDER BY DbId', [], (err, rows) => {
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
						dbSystem.run(`INSERT INTO PlanNames VALUES (?, ?, ?, ?)`, [newID, newName, newDbId, 0], (err) => {
							console.log(`New Plan with ID: ${newID}`);
							dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
								dbSystem.close(() => {
									sendToClientType('web', JSON.stringify({ type: 'preset_data', data: rows }), ws.schoolName);
									sendFileThroughWebSocket(`./data/system.db`, ws.schoolName);
									sendToClientType('desktop', JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
								});
							});
						});
					});
				} catch (error) {
					console.error('req_new_plan error:', error.message);
				}
				break;

			case 'req_del_plan':
				try {
					const dbSystem = new sqlite3.Database('./data/system.db');
					const dbMain = new sqlite3.Database(`./data/${dbIndex}.db`);
					dbMain.run(`DELETE FROM Mondays`);
					dbMain.run(`DELETE FROM Tuesdays`);
					dbMain.run(`DELETE FROM Wednesdays`);
					dbMain.run(`DELETE FROM Thursdays`);
					dbMain.run(`DELETE FROM Fridays`);
					dbMain.run(`DELETE FROM Saturdays`);
					dbMain.run(`DELETE FROM Sundays`);

					dbSystem.run(`DELETE FROM PlanNames WHERE Name = ?`, [msg.name], (err) => {
						if (err) {
							throw new Error(err.message);
						}
					});

					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						console.log('Deleted ' + msg.name);
						dbMain.close(() => {
							dbSystem.close(() => {
								sendFileThroughWebSocket(`./data/system.db`, ws.schoolName);
								sendFileThroughWebSocket(`./data/${dbIndex}.db`, ws.schoolName);
								sendToClientType('desktop', JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
								sendToClientType('web', JSON.stringify({ type: 'preset_data', data: rows }), ws.schoolName);
							});
						});
					});
				} catch (error) {
					console.error('req_del_plan error:', error.message);
				}
				break;

			case 'sel_db':
				dbIndex = msg.data;
				break;

			case 'enable_req':
				try {
					sendToClientType('desktop', JSON.stringify({ type: msg.type, name: msg.name }), ws.schoolName);
					console.log(`Use: ${msg.name} sent to desktop`);
				} catch (error) {
					console.error('enable_req error:', error.message);
				}
				break;

			case 'plan_change_ok':
				try {
					const dbSystem = new sqlite3.Database('./data/system.db');

					dbSystem.all(`SELECT * FROM PlanNames`, [], (err, rows) => {
						dbSystem.close(() => {
							sendToClientType('web', JSON.stringify({ type: 'preset_data', data: rows }), ws.schoolName);
						});
					});
				} catch (error) {
					console.error('plan_change_ok error:', error.message);
				}

				break;

			case 'refresh_ok':
				console.log('Succesfully refreshed School PC');
				sendToClientType('web', JSON.stringify({ type: 'refresh_ok' }), ws.schoolName);
				break;

			case 'alarm_req':
				sendToClientType('desktop', JSON.stringify({ type: 'alarm_req' }), ws.schoolName);
				break;

			case 'alarm_started':
				sendToClientType('web', JSON.stringify({ type: 'alarm_started' }), ws.schoolName);
				break;

			case 'alarm_stopped':
				sendToClientType('web', JSON.stringify({ type: 'alarm_stopped' }), ws.schoolName);
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
							compareModifiedDates(fileMain, filePath, ws.schoolName);
							if (path.basename(filePath) === 'system.db') {
								sendToClientType('desktop', JSON.stringify({ type: 'refresh_req' }), ws.schoolName);
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
			sendToClientType('web', JSON.stringify({ type: 'School PC OFFLINE' }), ws.schoolName);
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
