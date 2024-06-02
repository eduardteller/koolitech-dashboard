document.addEventListener('DOMContentLoaded', () => {
	const registerForm = document.getElementById('register-form');
	const loginForm = document.getElementById('login-form');
	const messageArea = document.getElementById('message-area');
	const messageInput = document.getElementById('message-input');
	const messages = document.getElementById('messages');
	const sendMessageButton = document.getElementById('send-message');
	let socket;

	registerForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const username = document.getElementById('register-username').value;
		const password = document.getElementById('register-password').value;

		const response = await fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		});

		if (response.ok) {
			alert('User registered successfully');
		} else {
			alert('User registration failed');
		}
	});

	loginForm.addEventListener('submit', async (e) => {
		e.preventDefault();
		const username = document.getElementById('login-username').value;
		const password = document.getElementById('login-password').value;

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
			connectSocket(data.token);
			messageArea.style.display = 'block';
		} else {
			alert('Invalid credentials');
		}
	});

	const connectSocket = (token) => {
		socket = io.connect('http://localhost:3000', {
			query: { token },
		});

		socket.on('connect', () => {
			console.log('Connected to WebSocket server');
		});

		socket.on('message', (message) => {
			const li = document.createElement('li');
			li.textContent = message;
			messages.appendChild(li);
		});

		sendMessageButton.addEventListener('click', () => {
			const message = messageInput.value;
			socket.emit('message', message);
			messageInput.value = '';
		});

		socket.on('disconnect', () => {
			console.log('Disconnected from WebSocket server');
		});
	};

	const token = localStorage.getItem('token');
	if (token) {
		connectSocket(token);
		messageArea.style.display = 'block';
	}
});
