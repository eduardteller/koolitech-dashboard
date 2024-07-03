function getBread() {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log('Getting the bread');
			resolve();
		}, 2000); // Simulates a delay
	});
}

async function makeSandwich() {
	getBread(); // Wait for the bread to be ready
	console.log('Spreading the butter');
	console.log('Adding the filling');
	console.log('Cutting the sandwich');
	console.log('Serving the sandwich');
}

makeSandwich();
