import { clients } from './server.js';
import fs from 'fs/promises';
import path from 'path';

export async function sendMessage(message, school) {
	let sent = false;
	for (const [client, schoolName] of clients.entries()) {
		if (schoolName === school) {
			sent = true;
			await client.send(message);
		}
	}
	if (!sent) {
		console.error(`Cant send to ${school} Desktop App!`);
	}
}

export async function cmpDBModDate(file1Path, file2Path, school) {
	try {
		await fs.access(file1Path, fs.constants.F_OK);

		const stats1 = await fs.stat(file1Path);
		const stats2 = await fs.stat(file2Path);

		const file1ModifiedDate = stats1.mtime;
		const file2ModifiedDate = stats2.mtime;

		if (file2ModifiedDate > file1ModifiedDate) {
			await fs.unlink(file1Path);
			await fs.rename(file2Path, file1Path);
			console.log(
				`Received ${path.basename(
					file2Path
				)} from School PC is newer, replacing...`
			);
		} else if (file2ModifiedDate < file1ModifiedDate) {
			await sendDBFile(file1Path, school); // Send the existing file (optional)
		} else {
			return;
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			console.log(
				`Received ${path.basename(
					file1Path
				)} from school PC doesn't exist on server, copying...`
			);
			await fs.rename(file2Path, file1Path);
		} else {
			console.error('Compare ', err);
		}
	}
}

export async function sendDBFile(filePath, school) {
	try {
		const stats = await fs.stat(filePath);
		const lastModified = stats.mtime;
		const unixTimestampMilliseconds = lastModified.getTime();

		const fileData = await fs.readFile(filePath);
		const base64Data = fileData.toString('base64');

		const messageDB = {
			type: 'new_data',
			data: base64Data,
			name: path.basename(filePath),
			time_data: unixTimestampMilliseconds,
		};

		const jsonMessage = JSON.stringify(messageDB);

		await sendMessage(jsonMessage, school);
		console.log(`Sending ${filePath} to To ${school} PC`);
	} catch (err) {
		console.error(err);
	}
}
