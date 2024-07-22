const weekDaysMap = new Map([
	['Mondays', 'Esmaspäev'],
	['Tuesdays', 'Teisipäev'],
	['Wednesdays', 'Kolmapäev'],
	['Thursdays', 'Neljapäev'],
	['Fridays', 'Reede'],
	['Saturdays', 'Laupäev'],
	['Sundays', 'Pühapäev'],
]);

for (const [key, value] of weekDaysMap) {
	console.log(key, value);
}
