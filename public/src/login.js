document.addEventListener('DOMContentLoaded', () => {
	const login = document.getElementById('login-btn');
	// const singup = document.getElementById('signup-btn');
	const user = document.getElementById('username');
	const pass = document.getElementById('password');

	// singup.addEventListener('click', async (e) => {
	// 	e.preventDefault();
	// 	const username = user.value;
	// 	const password = pass.value;

	// 	const response = await fetch('/api/register', {
	// 		method: 'POST',
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 		body: JSON.stringify({ username, password }),
	// 	});

	// 	if (response.ok) {
	// 		alert('Kasutaja loodud, palun logi sisse!');
	// 	} else {
	// 		alert('Registreerimine ebaõnnestus');
	// 	}
	// });

	login.addEventListener('click', async (e) => {
		e.preventDefault();
		const username = user.value;
		const password = pass.value;

		const response = await fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		if (response.ok) {
			const data = await response.json();
			localStorage.setItem('token', data.token);
			document.location.href = '/client';
		} else {
			alert('Invalid credentials');
		}
	});

	async function Auth() {
		const token = await localStorage.getItem('token');
		if (token) {
			const response = await fetch('/api/auth', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
			});

			if (response.ok) {
				document.location.href = '/client';
			} else {
				localStorage.removeItem('token');
				document.location.href = '/login';
			}
		}
	}

	const storedTheme = localStorage.getItem('theme');
	if (storedTheme) {
		if (storedTheme === 'dark') {
			const themeC = document.getElementById('theme-c');
			themeC.checked = true;
		}
	}

	const logo = document.getElementById('logo-btn');
	logo.onclick = function () {
		document.location.href = '/';
	};

	Auth();
});
