AOS.init();

const button = document.getElementById('header-btn');

button.onclick = function () {
	document.location.href = '/login';
};
const logo = document.getElementById('header-lbl');

logo.onclick = function () {
	document.location.href = '/';
};

const about = document.getElementById('btn-about');

about.onclick = function () {
	document.location.href = '/about';
};

const contact = document.getElementById('btn-contact');
const contact2 = document.getElementById('btn-contact-2');

contact.onclick = function () {
	document.location.href = '/contact';
};
contact2.onclick = function () {
	document.location.href = '/contact';
};

const cookies = document.getElementById('cookies-btn');

cookies.onclick = function () {
	document.location.href = '/cookies';
};

const btnBuy1 = document.getElementById('btn-buy-1');
const btnBuy2 = document.getElementById('btn-buy-2');
const btnBuy3 = document.getElementById('btn-buy-3');

btnBuy1.onclick = function () {
	document.location.href = '/contact';
};
btnBuy2.onclick = function () {
	document.location.href = '/contact';
};
btnBuy3.onclick = function () {
	document.location.href = '/contact';
};

window.addEventListener('scroll', function () {
	const header = document.getElementById('header');
	const headerBTN = document.getElementById('header-btn');
	const headerLabel = document.getElementById('header-lbl');
	const headerContact = document.getElementById('btn-contact');
	// const headerLogo = document.getElementById('header-logo');
	const headerAbout = document.getElementById('btn-about');
	const scrollPosition = window.scrollY;

	if (scrollPosition > 0) {
		headerLabel.classList.remove('text-white');
		headerLabel.classList.add('text-gray-900');

		headerBTN.classList.remove('bg-white', 'text-purple-500');
		headerBTN.classList.add('bg-newblue', 'text-white');

		header.classList.remove(
			'bg-gradient-to-r',
			'from-blue-500',
			'via-indigo-500',
			'to-purple-500'
		); // Change to your desired color class
		header.classList.add('bg-white', 'border-b'); // Change to your desired color class

		headerContact.classList.remove('text-white');
		headerContact.classList.add('text-gray-800');

		headerAbout.classList.remove('text-white');
		headerAbout.classList.add('text-gray-800');
		// headerLogo.src = 'src/img/K(1).png';
	} else {
		// headerLogo.src = 'src/img/K.png';
		headerLabel.classList.add('text-white');
		headerLabel.classList.remove('text-gray-900');

		headerBTN.classList.add('bg-white', 'text-purple-500');
		headerBTN.classList.remove('bg-newblue', 'text-white');

		header.classList.add(
			'bg-gradient-to-r',
			'from-blue-500',
			'via-indigo-500',
			'to-purple-500'
		); // Change to your desired color class
		header.classList.remove('bg-white', 'border-b'); // Change to your desired color class

		headerContact.classList.add('text-white');
		headerContact.classList.remove('text-gray-800');

		headerAbout.classList.add('text-white');
		headerAbout.classList.remove('text-gray-800');
	}
});

document.getElementById('scroll-btn').addEventListener('click', function () {
	const nick = document.getElementById('hui');
	nick.scrollIntoView(true, { behavior: 'smooth' });
});
