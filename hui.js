fetch('https://icanhazip.com')
	.then((response) => response.text())
	.then((ip) => {
		p_ip = ip;
	});
