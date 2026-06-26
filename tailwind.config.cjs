/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#10b981", // emerald-500
					dark: "#059669", // emerald-600
					light: "#6ee7b7", // emerald-300
				},
				surface: {
					DEFAULT: "#f8fafc", // slate-50
					dark: "#e2e8f0", // slate-200
				},
				accent: {
					DEFAULT: "#22d3ee", // cyan-400
				},
			},
			borderRadius: {
				lg: "1rem",
			},
			fontFamily: {
				sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};
