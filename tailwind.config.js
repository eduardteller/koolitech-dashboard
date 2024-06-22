/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./public/*.{html,js}'],
	safelist: ['bg-red-400', 'bg-green-400'],
	theme: {
		extend: {
			fontFamily: {
				libre: ['"Libre Franklin"', 'sans-serif'],
			},
			colors: {
				newblue: '#0866ff',
				newred: '#ff0000',
			},
		},
	},
	plugins: [],
};
