// /mnt/data/manageSQLiteDatabase.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Define the path to the SQLite database file
const dbFilePath = path.join(__dirname, 'temp_data', 'system.db');

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
		// After closing the database, delete the file with a delay
		setTimeout(deleteDatabaseFile, 100); // 1000 milliseconds delay
		// deleteDatabaseFile();
	});
}

// Function to delete the SQLite database file
function deleteDatabaseFile() {
	fs.unlink(dbFilePath, (err) => {
		if (err) {
			return console.error('Error deleting database file:', err.message);
		}
		console.log('Deleted the SQLite database file.');
	});
}

// Open the database
const db = openDatabase();

// Perform some operations (optional)
// For example, creating a table, inserting data, etc.
// db.run("CREATE TABLE ...");

// Close the database after operations
closeDatabase(db);
