const button = document.getElementById('client-btn');
const logo = document.getElementById('logo-btn');

button.onclick = function () {
	document.location.href = '/login';
};
logo.onclick = function () {
	document.location.href = '/';
};
