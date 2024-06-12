document.addEventListener('DOMContentLoaded', () => {
	const updateBtn = document.getElementById('update-btn');
	const enableBtn = document.getElementById('enable-plan');
	const newPlanBtn = document.getElementById('new-plan');
	const delPlanBtn = document.getElementById('del-plan');
	const addRowBtn = document.getElementById('row-btn');
	const delRowBtn = document.getElementById('delete-btn');
	const alarmBtn = document.getElementById('haire-btn');
	const connectBtn = document.getElementById('connect-btn');

	let presetItemsPlan = document.querySelectorAll('.preset-item-plan');
	let presetItemsDays = document.querySelectorAll('.preset-item');
	const presetListPlan = document.getElementById('preset-list-plan');
	const table = document.getElementById('data-table');
	const H1Text = document.getElementById('heada');

	const modal = document.getElementById('modal');
	const overlay = document.getElementById('overlay');
	const saveButton = document.getElementById('saveButton');
	const cancelButton = document.getElementById('cancelButton');
	const elementNameInput = document.getElementById('elementName');

	let newPlanName = '';
	let selectedPresetPlan = null;
	let activePresetPlan = null;
	let currentDBIndex = [];
	let currentDBName = [];
	let currentDay;
	let timer;
	let ws;

	function initiateConnect(token) {
		ws = new WebSocket('wss://localhost?token=' + token, 'web');

		ws.onopen = function () {
			connectBtn.style.display = 'none';
			const headingF = document.getElementById('heading-fail');
			headingF.style.display = 'none';

			console.log('Connected to the server');
			ws.send(JSON.stringify({ type: 'preset' }));
			setDayButtons();
			setPlans();
		};

		ws.onmessage = function (event) {
			const msg = JSON.parse(event.data);
			if (msg.type === 'data') {
				removeTableData();

				const initial = table.querySelector('thead').insertRow(-1);
				let i = 0;
				for (i = 0; i < 5; i++) {
					const cell = document.createElement('th');
					if (i === 0) {
						cell.textContent = 'ID';
						cell.contentEditable = false;
					} else if (i === 1) {
						cell.textContent = 'Nimi';
						cell.contentEditable = false;
					} else if (i === 2) {
						cell.textContent = 'Aeg';
						cell.contentEditable = false;
					} else if (i === 3) {
						cell.textContent = 'Kirjeldus';
						cell.contentEditable = false;
					} else if (i === 4) {
						cell.textContent = 'Helifail';
						cell.contentEditable = false;
					}
					initial.appendChild(cell);
				}
				if (msg.data[0] !== undefined && msg.data[0] !== null && msg.data[0] !== '') {
					msg.data.forEach((rowData) => {
						const newRow = table.querySelector('tbody').insertRow(-1);

						Object.entries(rowData).forEach(([key, value]) => {
							const cell = newRow.insertCell(-1);
							if (key === 'Id' || key === 'Helifail') {
								cell.contentEditable = false;
							} else {
								cell.contentEditable = true;
							}
							cell.textContent = value;
						});
					});
				}
			} else if (msg.type === 'refresh_ok') {
				clearTimeout(timer);
				hideSpinner('E-KELL');
				updateBtn.textContent = 'Salvestatud';
				console.log(msg.type + ' by desktop client');
			} else if (msg.type === 'alarm_started') {
				clearTimeout(timer);
				hideSpinner('E-KELL');
				alarmBtn.textContent = 'Haire Stop';
				console.log(msg.type + ' by desktop client');
			} else if (msg.type === 'alarm_stopped') {
				clearTimeout(timer);
				hideSpinner('E-KELL');
				alarmBtn.textContent = 'Haire Start';
				console.log(msg.type + ' by desktop client');
			} else if (msg.type === 'preset_data') {
				clearTimeout(timer);
				hideSpinner(`E-KELL WEB: ${msg.name} kool`);
				removeAllPresets();
				currentDBIndex = [];
				currentDBName = [];
				msg.data.forEach((header) => {
					Object.entries(header).forEach(([key, value]) => {
						const newItem = document.createElement('li');
						if (key === 'Name') {
							newItem.className = 'preset-item-plan';
							newItem.textContent = value;
							presetListPlan.appendChild(newItem);
							currentDBName.push(value);
						} else if (key === 'DbId') {
							currentDBIndex.push(value);
						}
						if (key === 'Current' && value === 1) {
							const lastItem = presetListPlan.lastElementChild;
							if (lastItem) {
								lastItem.classList.add('active');
								activePresetPlan = lastItem.textContent;
							}
						}
					});
				});
				presetItemsPlan = document.querySelectorAll('.preset-item-plan');
				setPlans();
				triggerPlanClick();
			}
		};

		ws.onclose = function () {
			const container1 = document.getElementById('cnt1');
			const container2 = document.getElementById('cnt2');
			const containerM = document.getElementById('cntM');
			const headingF = document.getElementById('heading-fail');
			container1.style.display = 'none';
			container2.style.display = 'none';
			containerM.style.display = 'none';
			connectBtn.style.display = 'block';
			headingF.style.display = 'block';
			headingF.textContent = 'Ühendust pole, proovi recconect';
		};
	}

	addRowBtn.addEventListener('click', function () {
		let empty = false;
		const head = table.querySelector('tbody');
		if (head.children.length === 0) {
			empty = true;
		}
		const newRow = table.querySelector('tbody').insertRow(-1);
		let i = 0;
		for (i = 0; i < 5; i++) {
			const cell = newRow.insertCell(-1);
			if (i === 0) {
				cell.contentEditable = false;
				if (empty === false) {
					const rows = head.getElementsByTagName('tr');
					let firstCell = rows[rows.length - 2].getElementsByTagName('td')[0];
					cell.textContent = parseInt(firstCell.textContent) + 1;
				} else {
					cell.textContent = 1;
				}
			} else if (i === 4) {
				cell.contentEditable = false;
				cell.textContent = 'Vaikimisi';
			} else {
				cell.contentEditable = true;
			}
		}
		updateBtn.textContent = 'Salvesta muudatusi';
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
			for (let j = 0; j < dataCells.length; j++) {
				if (j === 2) {
					const tempString = formatTime(dataCells[j].textContent.trim());
					// console.log(tempString);
					if (tempString !== 'Invalid') {
						dataRow.push(tempString);
					} else {
						sendingAccept = false;
						H1Text.textContent = 'Vale aja formaat';
						dataCells[j].classList.add('errorClass');
					}
				} else if (j === 1 || j === 3) {
					if (dataCells[j].textContent.trim().length < 15) {
						dataRow.push(dataCells[j].textContent.trim());
					} else {
						sendingAccept = false;

						H1Text.textContent = 'Liiga pikk tekst';
						dataCells[j].classList.add('errorClass');
					}
				} else {
					dataRow.push(dataCells[j].textContent.trim());
				}
			}
			tableData.push(dataRow);
		}
		if (sendingAccept) {
			updateMessage(tableData);
			timer = setTimeout(onTimeout, 5000);
		}
	});

	delRowBtn.addEventListener('click', function () {
		const table = document.getElementById('data-table');
		const tableBody = table.querySelector('tbody');
		if (tableBody.rows.length > 0) {
			tableBody.deleteRow(tableBody.rows.length - 1);
			updateBtn.textContent = 'Salvesta muudatusi';
		}
	});

	alarmBtn.addEventListener('click', function () {
		showSpinner('Ühendamine...');
		timer = setTimeout(onTimeout, 5000);
		ws.send(JSON.stringify({ type: 'alarm_req' }));
	});
	enableBtn.addEventListener('click', function () {
		if (selectedPresetPlan != null) {
			showSpinner('Ühendamine...');
			timer = setTimeout(onTimeout, 5000);
			ws.send(JSON.stringify({ type: 'enable_req', name: selectedPresetPlan }));
		}
	});

	newPlanBtn.addEventListener('click', async function () {
		if (presetListPlan.children.length < 10) {
			await pullupModal();
			if (newPlanName) {
				ws.send(JSON.stringify({ type: 'req_new_plan', name: newPlanName }));
				newPlanName = '';
			}
		} else {
			console.log('Liiga palju plaane, palun kustutage mõned ära!');
		}
	});

	delPlanBtn.addEventListener('click', function () {
		if (selectedPresetPlan != null) {
			ws.send(JSON.stringify({ type: 'req_del_plan', name: selectedPresetPlan }));
		}
	});

	connectBtn.addEventListener('click', function () {
		const headingF = document.getElementById('heading-fail');
		connectBtn.style.display = 'none';
		headingF.textContent = 'Connecting... 🔄';
		initiateConnect(token);
	});

	overlay.addEventListener('click', closeModal);

	function updateMessage(tableD) {
		ws.send(
			JSON.stringify({
				type: 'update',
				day: currentDay,
				tableData: tableD,
			})
		);
		updateBtn.textContent = 'Salvestatud';
	}

	function removeTableData() {
		const table = document.getElementById('data-table');

		while (table.rows.length > 0) {
			table.deleteRow(0);
		}
	}

	function setDayButtons() {
		presetItemsDays.forEach((item) => {
			item.addEventListener('click', function () {
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
				ws.send(JSON.stringify({ type: 'fetch', day: currentDay }));
				// socket.emit('fetch', JSON.stringify({ day: currentDay }));
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
		for (let i = 0; i < presetItemsPlan.length; i++) {
			const item = presetItemsPlan[i];
			if (item.textContent === activePresetPlan) {
				item.dispatchEvent(new Event('click'));
				return;
			}
		}
	}

	function showSpinner(text) {
		// updateBtn.disabled = true;
		H1Text.innerHTML = `${text} <span class="spinner">🔄</span>`;
	}

	function hideSpinner(text) {
		// updateBtn.disabled = false;
		H1Text.innerHTML = `${text}`;
	}

	function onTimeout() {
		console.log('Cant reach the Desktop App');
		hideSpinner('Viga!');
	}

	function setPlans() {
		presetItemsPlan.forEach((item) => {
			item.addEventListener('click', async function () {
				presetItemsPlan.forEach((i) => i.classList.remove('selected'));
				item.classList.add('selected');
				selectedPresetPlan = item.textContent;

				if (selectedPresetPlan) {
					let i = 0;
					let j = 0;
					for (i = 0; i < currentDBName.length; i++) {
						if (selectedPresetPlan === currentDBName[i]) {
							j = i;
						}
					}
					const send_index = currentDBIndex[j];
					ws.send(JSON.stringify({ type: 'sel_db', data: send_index }));
					// socket.emit('sel_db', JSON.stringify({ data: send_index }));
					triggerDayClick('Esmaspäev');

					const container1 = document.getElementById('cnt1');
					const container2 = document.getElementById('cnt2');
					const container3 = document.getElementById('cntM');
					container1.style.display = 'block';
					container2.style.display = 'block';
					container3.style.display = 'block';
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
		// Regular expression to match valid time formats
		const timeRegex = /^(\d{1,2}):?(\d{2}):?(\d{2})?$|^(\d{1,2})\.(\d{2})$/;

		// Match the input string with the regex
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
			modal.style.display = 'block';
			overlay.style.display = 'block';
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
		modal.style.display = 'none';
		overlay.style.display = 'none';
	}

	const token = localStorage.getItem('token');
	if (token) {
		// connectSocket(token);
		initiateConnect(token);
	} else {
		console.log('No existing token');
	}
});
