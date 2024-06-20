/** @type {import('tailwindcss').Config} */
module.exports = {
	theme: {
		extend: {
			fontFamily: {
				libre: ['"Libre Franklin"', 'sans-serif'],
			},
		},
	},
	content: ['./public/*.{html,js}'],
	safelist: ['bg-red-400', 'bg-green-400'],
	theme: {
		extend: {},
	},
	plugins: [],
};
