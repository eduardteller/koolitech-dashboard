/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./public/*.{html,js}'],
	safelist: ['bg-red-400', 'bg-green-400', 'overflow-hidden', 'block'],
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
		themes: ['light', 'dark'],
	},
};
