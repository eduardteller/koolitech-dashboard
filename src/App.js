// File: src/App.js

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const App = () => {
	const [socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);
	const [message, setMessage] = useState('');
	const [token, setToken] = useState('');

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		if (storedToken) {
			setToken(storedToken);
			const newSocket = io('https://localhost:3000', {
				query: { token: storedToken },
			});
			setSocket(newSocket);

			newSocket.on('message', (data) => {
				setMessages((prev) => [...prev, data]);
			});

			return () => newSocket.close();
		}
	}, []);

	const sendMessage = () => {
		if (socket) {
			socket.emit('message', message);
			setMessage('');
		}
	};

	const login = async (username, password) => {
		try {
			const response = await axios.post('https://localhost:3000/api/login', {
				username,
				password,
			});
			const { token } = response.data;
			localStorage.setItem('token', token);
			setToken(token);
			const newSocket = io('https://localhost:3000', {
				query: { token },
			});
			setSocket(newSocket);

			newSocket.on('message', (data) => {
				setMessages((prev) => [...prev, data]);
			});

			return () => newSocket.close();
		} catch (error) {
			console.error('Login failed:', error);
		}
	};

	return (
		<div>
			{!token ? (
				<LoginForm login={login} />
			) : (
				<div>
					<div>
						{messages.map((msg, index) => (
							<div key={index}>{msg}</div>
						))}
					</div>
					<input value={message} onChange={(e) => setMessage(e.target.value)} />
					<button onClick={sendMessage}>Send</button>
				</div>
			)}
		</div>
	);
};

const LoginForm = ({ login }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e) => {
		e.preventDefault();
		login(username, password);
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				type="text"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				placeholder="Username"
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder="Password"
			/>
			<button type="submit">Login</button>
		</form>
	);
};

export default App;
