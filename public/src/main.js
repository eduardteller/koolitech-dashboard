document.addEventListener('DOMContentLoaded', () => {
	const enableBtn = document.getElementById('enable-plan');
	const newPlanBtn = document.getElementById('saveButton');
	const delPlanBtn = document.getElementById('del-plan');

	const updateBtn = document.getElementById('update-btn');
	const addRowBtn = document.getElementById('row-btn');
	const delRowBtn = document.getElementById('delete-btn');
	const logOutBtn = document.getElementById('log-out');

	const alarmBtnMain = document.getElementById('alarmBtn');

	const presetListPlan = document.getElementById('preset-list-plan');
	let presetItemsPlan = document.querySelectorAll('.preset-item-plan');

	const H1Text = document.getElementById('heada');

	const overlay = document.getElementById('overlay');
	const saveButton = document.getElementById('saveButton');
	const cancelButton = document.getElementById('cancelButton');
	const elementNameInput = document.getElementById('elementName');
	const statusHead = document.getElementById('status-head');

	let selectedPresetPlan = null;
	let activePresetPlan = null;
	let userDatabaseIndexes = [];
	let userDatabaseNames = [];
	let selDBIndex = 0;
	let schName = '';

	let selectedDay = 'Esmaspäev';

	async function Connect(token) {
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
			console.error('connect');
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
					const newItemA = document.createElement('a');
					if (key === 'Name') {
						newItemA.textContent = value;
						newItem.appendChild(newItemA);
						presetListPlan.appendChild(newItem);
						userDatabaseNames.push(value);
					} else if (key === 'DbId') {
						userDatabaseIndexes.push(value);
					}
					if (key === 'Current' && value === 1) {
						const lastItem = presetListPlan.lastElementChild;
						if (lastItem) {
							activePresetPlan = lastItem.textContent.trim();
						}
					}
				});
			});
			const presetList = document.getElementById('preset-list-plan');
			presetItemsPlan = presetList.querySelectorAll('li');
			setPlans();
			triggerPlanClick();
			if (presetItemsPlan.length >= 10) {
				newPlanBtn.disabled = true;
				document.getElementById('new-plan').disabled = true;
			} else {
				newPlanBtn.disabled = false;
				document.getElementById('new-plan').disabled = false;
			}

			if (presetItemsPlan.length <= 0) {
				delPlanBtn.disabled = true;
				enableBtn.disabled = true;
			} else {
				delPlanBtn.disabled = false;
				enableBtn.disabled = false;
			}
			document.getElementById('my_modal_1').open = false;
			resolve();
		});
	}

	function tableDataProcess(data) {
		return new Promise((resolve, reject) => {
			const tables = [
				'Mondays',
				'Tuesdays',
				'Wednesdays',
				'Thursdays',
				'Fridays',
				'Saturdays',
				'Sundays',
			];

			removeTableData();
			const pageTables = document.querySelectorAll('[name="data-table"]');
			let tableId = 0;

			tables.forEach((day) => {
				data[day].forEach((rowData) => {
					const newRow = pageTables[tableId]
						.querySelector('tbody')
						.insertRow(-1);
					if (rowData) {
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
					}
				});
				tableId++;
			});
			resolve();
		});
	}

	updateBtn.addEventListener('click', function () {
		setLoader(true);
		let sendingAccept = true;
		const tableData = {};
		let allTables = {
			Esmaspäev: [],
			Teisipäev: [],
			Kolmapäev: [],
			Neljapäev: [],
			Reede: [],
			Laupäev: [],
			Pühapäev: [],
		};

		const pageTables = document.querySelectorAll('[name="data-table"]');

		pageTables.forEach((table) => {
			for (let i = 1; i < table.rows.length; i++) {
				const dataCells = table.rows[i].cells;
				for (let j = 0; j < dataCells.length; j++) {
					dataCells[j].classList.remove('bg-error', 'text-error-content');
				}
			}
			let tableArray = [];

			for (let i = 1; i < table.rows.length; i++) {
				let dataRow = {
					Id: 0,
					Nimi: '',
					Aeg: '',
					Kirjeldus: '',
					Helifail: '',
				};
				const dataCells = table.rows[i].cells;
				for (let j = 0; j < dataCells.length + 1; j++) {
					if (j === 0) {
						dataRow.Id = i;
					} else if (j === 2) {
						const tempString = formatTime(dataCells[j - 1].textContent.trim());
						if (tempString !== 'Invalid') {
							dataRow.Aeg = tempString;
						} else {
							sendingAccept = false;
							H1Text.textContent = 'Vale aja formaat 🕓⬇️';
							dataCells[j - 1].classList.add('bg-error', 'text-error-content');
						}
					} else if (j === 1 || j === 3) {
						if (dataCells[j - 1].textContent.trim().length < 15) {
							if (j === 1) {
								dataRow.Nimi = dataCells[j - 1].textContent.trim();
							} else {
								dataRow.Kirjeldus = dataCells[j - 1].textContent.trim();
							}
						} else {
							sendingAccept = false;
							H1Text.textContent = 'Liiga pikk tekst 📏⬇️';
							dataCells[j - 1].classList.add('bg-error', 'text-error-content');
						}
					} else {
						dataRow.Helifail = dataCells[j - 1].textContent.trim();
					}
				}
				tableArray.push(dataRow);
			}
			allTables[table.ariaLabel.trim()] = tableArray;
		});
		// console.log(allTables);
		if (sendingAccept) {
			updateMessage(allTables);
		}
	});

	addRowBtn.addEventListener('click', function () {
		const tables = document.querySelectorAll('[name="data-table"]');
		tables.forEach((table) => {
			if (table.ariaLabel.trim() === selectedDay) {
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
				delRowBtn.disabled = false;
			}
		});
	});

	delRowBtn.addEventListener('click', function () {
		const tables = document.querySelectorAll('[name="data-table"]');
		tables.forEach((table) => {
			if (table.ariaLabel.trim() === selectedDay) {
				const tableBody = table.querySelector('tbody');
				if (tableBody.rows.length > 0) {
					tableBody.deleteRow(tableBody.rows.length - 1);
					tableBody.rows.length
						? (delRowBtn.disabled = false)
						: (delRowBtn.disabled = true);
				}
			}
		});
	});

	alarmBtnMain.addEventListener('click', async function () {
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
					alarmBtnMain.textContent = 'Käivita kooli häire 🚨';
					alarmBtnMain.classList.remove('animate-pulse');
				} else if (processed.alarm === 'alarm_started') {
					alarmBtnMain.textContent = 'Peata kooli häire... 🚨';
					alarmBtnMain.classList.add('animate-pulse');
				}
				statusSet(true);
			}
		} else {
			statusSet(false);
		}
	});

	enableBtn.addEventListener('click', async function () {
		if (selectedPresetPlan != null) {
			setLoader(true);
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
				}
			} else {
				statusSet(false);
			}
			setLoader(false);
		}
	});

	logOutBtn.onclick = function () {
		if (localStorage.getItem('token')) {
			localStorage.removeItem('token');
			// console.log('Token deleted successfully');
			document.location.href = '/login';
		} else {
			// console.log('No token found in local storage');
			document.location.href = '/login';
		}
	};

	newPlanBtn.addEventListener('click', async function () {
		if (presetListPlan.children.length < 10) {
			const newName = document.getElementById('input-new-plan').value.trim();
			if (newName) {
				const response = await fetch('/api/new_plan', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `${token}`,
						School: schName,
					},
					body: JSON.stringify({ name: newName }),
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
				}
				document.getElementById('input-new-plan').value = '';
			}
		}
	});

	delPlanBtn.addEventListener('click', async function () {
		if (selectedPresetPlan !== null) {
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
		} else {
			statusSet(false);
		}
		setLoader(false);
	}

	function statusSet(bool) {
		if (bool) {
			statusHead.textContent = 'Ühendus kooli arvutiga: Online 🟢';
			statusHead.classList.add('bg-success');
			statusHead.classList.remove('bg-error');

			const nblab = document.getElementById('nb-label');
			nblab.classList.add('hidden');
		} else {
			statusHead.textContent = 'Ühendus kooli arvutiga: Offline 🔴';
			statusHead.classList.remove('bg-success');
			statusHead.classList.add('bg-error');

			const nblab = document.getElementById('nb-label');
			nblab.classList.remove('hidden');
		}
	}

	function removeTableData() {
		const tables = document.querySelectorAll('[name="data-table"]');
		tables.forEach((table) => {
			while (table.rows.length > 1) {
				table.deleteRow(1);
			}
		});
	}

	function setDayButtons() {
		const radioButtons = document.querySelectorAll(
			'input[type="radio"][name="my_tabs_2"]'
		);
		radioButtons.forEach((item) => {
			item.addEventListener('click', function () {
				//diable/enable del btn when switching tabs
				const tables = document.querySelectorAll('[name="data-table"]');
				tables.forEach((table) => {
					if (table.ariaLabel.trim() === item.ariaLabel.trim()) {
						const newTable = table.querySelector('tbody');
						if (newTable.rows.length <= 0) {
							delRowBtn.disabled = true;
						} else {
							delRowBtn.disabled = false;
						}
					}
				});
				//diable/enable del btn when switching tabs

				//set selected tab/day to memory
				selectedDay = item.ariaLabel.trim();
				//set selected tab/day to memory
			});
		});
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
			if (presetItemsPlan[0]) {
				presetItemsPlan[0].dispatchEvent(new Event('click'));
			}
		}
	}

	function setPlans() {
		const presetList = document.getElementById('preset-list-plan');
		presetItemsPlan = presetList.querySelectorAll('li');
		presetItemsPlan.forEach((item) => {
			item.addEventListener('click', function () {
				presetItemsPlan.forEach((i) => {
					// i.classList.remove('active');
					i.querySelector('a').classList.remove('active', 'bg-blue-300');
				});

				item.querySelector('a').classList.add('active');

				selectedPresetPlan = item.querySelector('a').textContent.trim();

				if (selectedPresetPlan === activePresetPlan) {
					enableBtn.disabled = true;
					item.querySelector('a').classList.add('bg-blue-300');
				} else {
					enableBtn.disabled = false;
				}

				if (selectedPresetPlan) {
					let i = 0;
					let j = 0;
					for (i = 0; i < userDatabaseNames.length; i++) {
						if (selectedPresetPlan === userDatabaseNames[i]) {
							j = i;
						}
					}
					selDBIndex = userDatabaseIndexes[j];
				}

				setLoader(true);
				fetch('api/fetch', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
						authorization: token,
						school: schName,
						dbid: selDBIndex,
					},
				})
					.then((response) => {
						if (!response.ok) {
							console.error('Network response was not ok');
						} else {
							response.json().then((data) => {
								data.STATUS ? statusSet(true) : statusSet(false);
								tableDataProcess(data.data);
							});
						}
					})
					.catch((error) => {
						console.error('Fetch', error);
					})
					.finally(() => {
						setLoader(false);
					});
			});
		});
	}

	function setLoader(bool) {
		const load = document.getElementById('loader');
		bool ? load.classList.remove('hidden') : load.classList.add('hidden');
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
			const bodymain = document.getElementById('bbody');
			bodymain.classList.add('overflow-hidden');
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

	// const token = localStorage.getItem('token');
	// if (token) {
	// 	Connect(token);
	// } else {
	// 	document.location.href = '/login';
	// }

	const logo = document.getElementById('logo-btn');
	logo.onclick = function () {
		document.location.href = '/';
	};
});
