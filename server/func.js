import { clients } from './server.js';

export function sendToClientType(type, message, school) {
	let sent = false;
	for (const [client, schoolName] of clients.entries()) {
		if (client.clientType === type && schoolName === school) {
			sent = true;
			client.send(message);
		}
	}
	if (!sent) {
		console.error(`Cant send shit, NOT connected to ${school + '|' + type}!`);
	}
}

export function compareModifiedDates(file1Path, file2Path, school) {
	fs.access(file1Path, fs.constants.F_OK, (err) => {
		if (err) {
			console.log(`Received ${path.basename(file1Path)} from school pc dont exist on server, copying...`);
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

				fs.stat(file2Path, async (err2, stats2) => {
					if (err2) {
						throw new Error(err2.message);
					}

					const file1ModifiedDate = stats1.mtime;
					const file2ModifiedDate = stats2.mtime;

					if (file2ModifiedDate > file1ModifiedDate) {
						console.log(`Recieved ${path.basename(file2Path)} from School PC is newer, replacing...`);
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
						sendFileThroughWebSocket(file1Path, school);
					}
				});
			});
		}
	});
}

export function sendFileThroughWebSocket(filePath, school) {
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

	sendToClientType('desktop', jsonMessage, school);
	console.log(`Sending ${filePath} to To ${school} PC`);
}
