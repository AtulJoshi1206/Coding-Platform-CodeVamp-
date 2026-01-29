/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0D1117",
                surface: "#161B22",
                primary: "#58A6FF",
                accent: "#7EE787",
                border: "#30363D",
            },
        },
    },
    plugins: [],
}
