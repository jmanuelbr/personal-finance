/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'accent-primary': '#38bdf8',
                'accent-success': '#34d399',
                'accent-danger': '#f87171',
                'accent-purple': '#a78bfa',
                'accent-pink': '#f472b6',
                'secondary': '#94a3b8',
            },
        },
    },
    plugins: [],
}
