// /mnt/data/manageSQLiteDatabase.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Define the path to the SQLite database file
const dbFilePath3 = path.join(__dirname, 'temp_data', '8.db');
const dbFilePath2 = path.join(__dirname, 'temp_data', '9.db');
const dbFilePath = path.join(__dirname, 'data', '9.db');

// Function to open the SQLite database
function openDatabase() {
	return new sqlite3.Database(dbFilePath, (err) => {
		if (err) {
			return console.error('Error opening database:', err.message);
		}
		console.log('Connected to the SQLite database.');
	});
}

// Function to close the SQLite database
function closeDatabase(db) {
	db.close((err) => {
		if (err) {
			return console.error('Error closing database:', err.message);
		}
		console.log('Closed the SQLite database.');

		fs.unlink(dbFilePath, (err) => {
			if (err) {
				throw new Error(err.message);
			}
			fs.rename(dbFilePath2, dbFilePath, (err) => {
				if (err) {
					throw new Error(err.message);
				}
				fs.unlink(dbFilePath, (err) => {
					if (err) {
						throw new Error(err.message);
					}
					fs.rename(dbFilePath3, dbFilePath, (err) => {
						if (err) {
							throw new Error(err.message);
						}
					});
				});
			});
		});
	});
}

// Open the database
const db = openDatabase();

closeDatabase(db);

// setTimeout(() => {
// 	const db2 = openDatabase();
// 	closeDatabase(db2);
// }, 1000);
