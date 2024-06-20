document.addEventListener('DOMContentLoaded', () => {
	const enableBtn = document.getElementById('enable-plan');
	const newPlanBtn = document.getElementById('new-plan');
	const delPlanBtn = document.getElementById('del-plan');

	const updateBtn = document.getElementById('update-btn');
	const addRowBtn = document.getElementById('row-btn');
	const delRowBtn = document.getElementById('delete-btn');
	const logOutBtn = document.getElementById('log-out');

	const alarmBtn = document.getElementById('haire-btn');

	const presetListPlan = document.getElementById('preset-list-plan');
	let presetItemsPlan = document.querySelectorAll('.preset-item-plan');

	let presetItemsDays = document.querySelectorAll('.preset-item');

	const table = document.getElementById('data-table');
	const H1Text = document.getElementById('heada');

	const overlay = document.getElementById('overlay');
	const saveButton = document.getElementById('saveButton');
	const cancelButton = document.getElementById('cancelButton');
	const elementNameInput = document.getElementById('elementName');
	const statusHead = document.getElementById('status-head');

	let newPlanName = '';
	let selectedPresetPlan = null;
	let activePresetPlan = null;
	let userDatabaseIndexes = [];
	let userDatabaseNames = [];
	let currentDay;
	let selDBIndex = 0;
	let schName = '';

	async function Connect(token) {
		showSpinner('Ühendan...');
		const response = await fetch('/api/preset', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `${token}`,
			},
		});
		if (response.ok) {
			const processed = await response.json();
			schName = processed.school;
			setDayButtons();
			await presetDataProcess(processed.data);
		} else {
			hideSpinner('VIGA');
			setMainLabelTimer();
		}
	}

	function presetDataProcess(data) {
		return new Promise((resolve, reject) => {
			removeAllPresets();
			userDatabaseIndexes = [];
			userDatabaseNames = [];
			data.forEach((header) => {
				Object.entries(header).forEach(([key, value]) => {
					const newItem = document.createElement('li');
					if (key === 'Name') {
						newItem.classList.add('preset-item-plan', 'list-plan-tail', 'regular');
						newItem.textContent = value;
						presetListPlan.appendChild(newItem);
						userDatabaseNames.push(value);
					} else if (key === 'DbId') {
						userDatabaseIndexes.push(value);
					}
					if (key === 'Current' && value === 1) {
						const lastItem = presetListPlan.lastElementChild;
						if (lastItem) {
							lastItem.classList.remove('regular');
							lastItem.classList.add('active');
							activePresetPlan = lastItem.textContent;
						}
					}
				});
			});
			presetItemsPlan = document.querySelectorAll('.preset-item-plan');
			setPlans();
			triggerPlanClick();
			// setMainLabel();
			resolve();
		});
	}

	function tableDataProcess(data) {
		return new Promise((resolve, reject) => {
			removeTableData();
			const initial = table.querySelector('thead').insertRow(-1);
			let i = 0;
			for (i = 0; i < 4; i++) {
				const cell = document.createElement('th');
				if (i === 0) {
					cell.classList.add('list-table-h-tail');
					cell.textContent = 'Nimi';
					cell.contentEditable = false;
				} else if (i === 1) {
					cell.classList.add('list-table-h-tail');
					cell.textContent = 'Aeg';
					cell.contentEditable = false;
				} else if (i === 2) {
					cell.classList.add('list-table-h-tail');
					cell.textContent = 'Kirjeldus';
					cell.contentEditable = false;
				} else if (i === 3) {
					cell.classList.add('list-table-h-tail');
					cell.textContent = 'Helifail';
					cell.contentEditable = false;
				}
				initial.appendChild(cell);
			}
			if (data[0] !== undefined && data[0] !== null && data[0] !== '') {
				data.forEach((rowData) => {
					const newRow = table.querySelector('tbody').insertRow(-1);

					Object.entries(rowData).forEach(([key, value]) => {
						if (key === 'Helifail') {
							const cell = newRow.insertCell(-1);
							cell.contentEditable = false;
							cell.textContent = value;
							cell.classList.add('list-table-tail');
						} else if (key !== 'Id') {
							const cell = newRow.insertCell(-1);
							cell.contentEditable = true;
							cell.textContent = value;
							cell.classList.add('list-table-tail');
						}
					});
				});
			}
			resolve();
		});
	}

	addRowBtn.addEventListener('click', function () {
		let empty = false;
		const head = table.querySelector('tbody');
		if (head.children.length === 0) {
			empty = true;
		}
		const newRow = table.querySelector('tbody').insertRow(-1);
		let i = 0;
		for (i = 0; i < 4; i++) {
			const cell = newRow.insertCell(-1);
			if (i === 3) {
				cell.contentEditable = false;
				cell.textContent = 'Vaikimisi';
			} else {
				cell.contentEditable = true;
			}
			cell.classList.add('list-table-tail');
		}
		updateBtn.textContent = 'Salvesta 💾';
	});

	updateBtn.addEventListener('click', function () {
		showSpinner('Salvestamine...');
		let sendingAccept = true;
		const tableData = [];

		for (let i = 1; i < table.rows.length; i++) {
			const dataCells = table.rows[i].cells;
			for (let j = 0; j < dataCells.length; j++) {
				dataCells[j].classList.remove('errorClass');
			}
		}

		for (let i = 1; i < table.rows.length; i++) {
			const dataRow = [];
			const dataCells = table.rows[i].cells;
			for (let j = 0; j < dataCells.length + 1; j++) {
				if (j === 0) {
					dataRow.push(`${i}`);
				} else if (j === 2) {
					const tempString = formatTime(dataCells[j - 1].textContent.trim());
					if (tempString !== 'Invalid') {
						dataRow.push(tempString);
					} else {
						sendingAccept = false;
						H1Text.textContent = 'Vale aja formaat 🕓⬇️';
						dataCells[j - 1].classList.add('errorClass');
						setTimeout(() => {
							setMainLabel();
						}, 5000);
					}
				} else if (j === 1 || j === 3) {
					if (dataCells[j - 1].textContent.trim().length < 15) {
						dataRow.push(dataCells[j - 1].textContent.trim());
					} else {
						sendingAccept = false;
						H1Text.textContent = 'Liiga pikk tekst 📏⬇️';
						dataCells[j - 1].classList.add('errorClass');
						setTimeout(() => {
							setMainLabel();
						}, 5000);
					}
				} else {
					dataRow.push(dataCells[j - 1].textContent.trim());
				}
			}
			tableData.push(dataRow);
		}
		if (sendingAccept) {
			updateMessage(tableData);
		}
	});

	delRowBtn.addEventListener('click', function () {
		const table = document.getElementById('data-table');
		const tableBody = table.querySelector('tbody');
		if (tableBody.rows.length > 0) {
			tableBody.deleteRow(tableBody.rows.length - 1);
			updateBtn.textContent = 'Salvesta 💾';
		}
	});

	alarmBtn.addEventListener('click', async function () {
		showSpinner('Saadan Haire Request...');

		const response = await fetch('/api/alarm_req', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
				School: schName,
			},
		});

		if (response.ok) {
			const processed = await response.json();
			if (processed.STATUS === 'ONLINE') {
				if (processed.alarm === 'alarm_stopped') {
					alarmBtn.textContent = 'Haire Start 🚨';
				} else if (processed.alarm === 'alarm_started') {
					alarmBtn.textContent = 'Haire Stop 🚨';
				}
				statusSet(true);
				setMainLabel();
			}
		} else {
			statusSet(false);
			hideSpinner('Ühendus kooli arvutiga puudub!');
			setMainLabelTimer();
		}
	});

	function setMainLabelTimer() {
		setTimeout(() => {
			setMainLabel();
		}, 5000);
	}

	enableBtn.addEventListener('click', async function () {
		if (selectedPresetPlan != null) {
			showSpinner('Aktiveerin...');
			const response = await fetch('/api/enable_plan', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `${token}`,
					School: schName,
				},
				body: JSON.stringify({ school: schName, name: selectedPresetPlan }),
			});

			if (response.ok) {
				const processed = await response.json();
				if (processed.STATUS === 'ONLINE') {
					setTimeout(async () => {
						await Connect(token);
						statusSet(true);
					}, 100);
				} else {
					statusSet(false);
					hideSpinner('Viga!');
					setMainLabelTimer();
				}
			} else {
				statusSet(false);
				hideSpinner('Ühendus kooli arvutiga puudub!');
				setMainLabelTimer();
			}
		}
	});

	logOutBtn.onclick = function () {
		if (localStorage.getItem('token')) {
			localStorage.removeItem('token');
			console.log('Token deleted successfully');
			document.location.href = '/login';
		} else {
			console.log('No token found in local storage');
			document.location.href = '/login';
		}
	};

	newPlanBtn.addEventListener('click', async function () {
		if (presetListPlan.children.length < 10) {
			await pullupModal();
			if (newPlanName) {
				showSpinner('Uuendan...');
				const response = await fetch('/api/new_plan', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `${token}`,
						School: schName,
					},
					body: JSON.stringify({ name: newPlanName }),
				});

				if (response.ok) {
					const processed = await response.json();
					if (processed.STATUS === 'ONLINE') {
						statusSet(true);
					} else {
						statusSet(false);
					}
					await presetDataProcess(processed.data);
				} else {
					statusSet(false);
					hideSpinner('Viga!');
					setMainLabelTimer();
				}
				newPlanName = '';
			}
		} else {
			setMainLabel();
			alert('Liiga palju plaane, palun kustutage mõned ära!');
		}
	});

	delPlanBtn.addEventListener('click', async function () {
		if (selectedPresetPlan !== null) {
			showSpinner('Uuendan...');
			const response = await fetch('/api/del_plan', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					authorization: `${token}`,
					school: schName,
				},
				body: JSON.stringify({
					name: selectedPresetPlan,
					dbid: selDBIndex,
				}),
			});
			if (response.ok) {
				const processed = await response.json();
				if (processed.STATUS === 'ONLINE') {
					statusSet(true);
				} else {
					statusSet(false);
				}
				await presetDataProcess(processed.data);
			} else {
				statusSet(false);
				hideSpinner('Viga!');
				setMainLabelTimer();
			}
		}
	});

	async function updateMessage(tableD) {
		const response = await fetch('/api/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				authorization: `${token}`,
				school: schName,
			},
			body: JSON.stringify({
				day: currentDay,
				tableData: tableD,
				dbid: selDBIndex,
			}),
		});
		if (response.ok) {
			const stat = await response.json();
			if (stat.STATUS === 'ONLINE') {
				statusSet(true);
			} else {
				statusSet(false);
			}
			setMainLabel();
		} else {
			statusSet(false);
			hideSpinner('Viga!');
			setMainLabelTimer();
		}
	}

	function statusSet(bool) {
		if (bool) {
			statusHead.textContent = 'Ühendus kooli arvutiga: Online 🟢';
			statusHead.classList.add('bg-green-400');
			statusHead.classList.remove('bg-red-400');
		} else {
			statusHead.textContent = 'Ühendus kooli arvutiga: Offline 🔴';
			statusHead.classList.remove('bg-green-400');
			statusHead.classList.add('bg-red-400');
		}
	}

	function removeTableData() {
		const table = document.getElementById('data-table');

		while (table.rows.length > 0) {
			table.deleteRow(0);
		}
	}

	function setDayButtons() {
		presetItemsDays.forEach((item) => {
			item.addEventListener('click', async function () {
				// showSpinner('Tootlen...');
				presetItemsDays.forEach((i) => i.classList.remove('selected'));
				item.classList.add('selected');
				const selectedPresetDay = item.textContent;

				switch (selectedPresetDay) {
					case 'Esmaspäev':
						currentDay = 'Mondays';
						break;
					case 'Teisipäev':
						currentDay = 'Tuesdays';
						break;
					case 'Kolmapäev':
						currentDay = 'Wednesdays';
						break;
					case 'Neljapäev':
						currentDay = 'Thursdays';
						break;
					case 'Reede':
						currentDay = 'Fridays';
						break;
					case 'Laupäev':
						currentDay = 'Saturdays';
						break;
					case 'Pühapäev':
						currentDay = 'Sundays';
						break;
					default:
						break;
				}
				const response = await fetch('/api/fetch', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						authorization: token,
						school: schName,
						day: currentDay,
						dbid: selDBIndex,
					},
				});
				if (response.ok) {
					const processed = await response.json();
					if (processed.STATUS) {
						statusSet(true);
					} else {
						statusSet(false);
					}
					await tableDataProcess(processed.data);
					// setMainLabel();
				} else {
					hideSpinner('VIGA');
					setMainLabelTimer();
				}
			});
		});
	}

	function triggerDayClick(presetText) {
		const item = Array.from(presetItemsDays).find((i) => i.textContent === presetText);
		if (item) {
			item.dispatchEvent(new Event('click'));
		} else {
			console.error('Preset item not found:', presetText);
		}
	}

	function triggerPlanClick() {
		let check = false;
		for (let i = 0; i < presetItemsPlan.length; i++) {
			const item = presetItemsPlan[i];
			if (item.textContent === activePresetPlan) {
				item.dispatchEvent(new Event('click'));
				check = true;
				return;
			}
		}
		if (!check && presetItemsPlan) {
			presetItemsPlan[0].dispatchEvent(new Event('click'));
		}
	}

	function showSpinner(text) {
		H1Text.innerHTML = `${text} <span class="spinner">🔄</span>`;
	}

	function hideSpinner(text) {
		H1Text.innerHTML = `${text}`;
	}

	function setMainLabel() {
		if (schName && selectedPresetPlan) {
			hideSpinner(`${schName} Kool: ${selectedPresetPlan}`);
		} else {
			hideSpinner('BLANK');
		}
	}

	function setPlans() {
		presetItemsPlan.forEach((item) => {
			item.addEventListener('click', function () {
				presetItemsPlan.forEach((i) => {
					i.classList.remove('selected');
				});

				item.classList.add('selected');

				selectedPresetPlan = item.textContent;

				if (selectedPresetPlan) {
					let i = 0;
					let j = 0;
					for (i = 0; i < userDatabaseNames.length; i++) {
						if (selectedPresetPlan === userDatabaseNames[i]) {
							j = i;
						}
					}
					selDBIndex = userDatabaseIndexes[j];
					triggerDayClick('Esmaspäev');
					setMainLabel();
				}
			});
		});
	}

	function removeAllPresets() {
		const presetList = document.getElementById('preset-list-plan');
		while (presetList.firstChild) {
			presetList.removeChild(presetList.firstChild);
		}
	}

	const formatTime = (timeString) => {
		const timeRegex = /^(\d{1,2}):?(\d{2}):?(\d{2})?$|^(\d{1,2})\.(\d{2})$/;

		const match = timeString.match(timeRegex);

		if (!match) {
			return 'Invalid';
		}

		let hours, minutes, seconds;

		if (match[1] !== undefined && match[2] !== undefined) {
			// Format is HH:MM or HH:MM:SS
			hours = parseInt(match[1], 10);
			minutes = parseInt(match[2], 10);
			seconds = match[3] !== undefined ? parseInt(match[3], 10) : 0;
		} else if (match[4] !== undefined && match[5] !== undefined) {
			// Format is HH.MM
			hours = parseInt(match[4], 10);
			minutes = parseInt(match[5], 10);
			seconds = 0;
		} else {
			return 'Invalid';
		}

		if (hours > 23 || minutes > 59 || seconds > 59) {
			return 'Invalid';
		}

		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = minutes.toString().padStart(2, '0');
		const formattedSeconds = seconds.toString().padStart(2, '0');

		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	};

	function pullupModal() {
		return new Promise((resolve) => {
			overlay.classList.remove('hidden');
			elementNameInput.value = ''; // Clear the input field
			saveButton.addEventListener('click', function () {
				const elementName = elementNameInput.value.trim().toUpperCase();
				let check = false;
				if (elementName && /^[a-zA-Z0-9 ]+$/.test(elementName)) {
					presetItemsPlan.forEach((plan) => {
						if (plan.textContent === elementName) {
							check = true;
						}
					});
					if (!check) {
						newPlanName = elementName;
						closeModal();
						resolve();
					} else {
						alert('Selline nimi juba olemas');
					}
				} else {
					alert('Palun sistestage ainult nubmrid ja tahed');
				}
			});
			cancelButton.addEventListener('click', function () {
				closeModal();
				resolve();
			});
		});
	}

	function closeModal() {
		overlay.classList.add('hidden');
	}

	const token = localStorage.getItem('token');
	if (token) {
		Connect(token);
	} else {
		document.location.href = '/login';
	}
});
