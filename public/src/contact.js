document
	.getElementById('email-btn')
	.addEventListener('click', function (event) {
		event.preventDefault();

		const name = document.getElementById('input-name').value.trim();
		const school = document.getElementById('input-school').value.trim();
		const email = document.getElementById('input-email').value.trim();
		const phone = document.getElementById('person-phone').value.trim();
		const text = document.getElementById('input-text').value.trim();

		const nameI = document.getElementById('input-name');
		const schoolI = document.getElementById('input-school');
		const emailI = document.getElementById('input-email');
		const phoneI = document.getElementById('person-phone');
		const textI = document.getElementById('input-text');

		const errorName = document.getElementById('error-name');
		const errorSchool = document.getElementById('error-school');
		const errorEmail = document.getElementById('error-email');
		const errorPhone = document.getElementById('error-number');
		const errorText = document.getElementById('error-text');

		const success = document.getElementById('success-email');

		const loader = document.getElementById('loader');

		let errors = 0;

		if (!name || name.length > 25) {
			errorName.classList.remove('hidden');
			errors++;
		}

		if (!school || school.length > 25) {
			errorSchool.classList.remove('hidden');

			errors++;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!email || !emailPattern.test(email)) {
			errorEmail.classList.remove('hidden');

			errors++;
		}

		if (phone) {
			const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
			if (!phonePattern.test(phone)) {
				errorPhone.classList.remove('hidden');

				errors++;
			}
		}

		if (!text || text.length > 500) {
			errorText.classList.remove('hidden');

			errors++;
		}

		if (errors > 0) {
		} else {
			errorName.classList.add('hidden');
			errorSchool.classList.add('hidden');
			errorEmail.classList.add('hidden');
			errorPhone.classList.add('hidden');
			errorText.classList.add('hidden');

			const formData = {
				name,
				school,
				email,
				phone,
				text,
			};

			loader.classList.remove('hidden');

			console.log(text);

			fetch('https://koolitech.ee/api/email-form', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			})
				.then((response) => {
					if (!response.ok) {
						console.error('Network response was not ok');
					}
					nameI.value = '';
					schoolI.value = '';
					emailI.value = '';
					phoneI.value = '';
					textI.value = '';
					success.classList.remove('hidden');
				})
				.catch((error) => {
					console.error('There was an error submitting the form!', error);
				})
				.finally(() => {
					loader.classList.add('hidden');
				});
		}
	});
