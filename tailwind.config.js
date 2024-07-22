/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./public/*.{html,js}'],
	safelist: [
		'bg-red-400',
		'bg-green-400',
		'overflow-hidden',
		'block',
		'text-gray-800',
		'bg-error',
		'bg-success',
		'text-error-content',
		'text-success-content',
		'bg-purple-700',
		'animate-pulse',
	],
	theme: {
		extend: {
			fontFamily: {
				libre: ['"Libre Franklin"', 'sans-serif'],
				nunito: ['Nunito', 'sans-serif'],
			},
			colors: {
				newblue: '#0866ff',
				newred: '#ff0000',
				newgreen: '#00ff00',
			},
			screens: {
				xsm: '384px',
			},
		},
	},
	// darkMode: 'selector',
	plugins: [require('daisyui')],
	darkMode: ['class', '[data-theme="dark"]'],
	daisyui: {
		themes: ['emerald', 'dark'],
	},
};
