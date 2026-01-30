// In production, we assume the API is proxied via /api if no VITE_API_URL is provided
export const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? '/api' : 'http://localhost:3000');

