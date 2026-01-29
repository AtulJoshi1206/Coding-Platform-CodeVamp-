# 🚀 Deployment Guide for CodeVamp

Your application is a sophisticated Full-Stack Monorepo consisting of:
1.  **Frontend**: React (Vite)
2.  **Backend**: NestJS API
3.  **Worker**: Node.js + Docker (Code Execution Engine)
4.  **Database**: MongoDB
5.  **Queue**: Redis

Because of the **Worker's requirement to run Docker containers**, you cannot deploy the entire stack to a simple static host like Netlify.

Here is the recommended Production Architecture:

## 1. Frontend (Deploy to Netlify)
**Status:** ✅ Ready
**Config:** `apps/web/netlify.toml` is already created.

**Steps:**
1.  Push your code to GitHub.
2.  Log in to [Netlify](https://www.netlify.com/).
3.  "Import from Git" -> Choose your repository.
4.  **Build Settings:**
    *   **Base directory:** `apps/web`
    *   **Build command:** `npm run build`
    *   **Publish directory:** `dist`
5.  **Environment Variables (in Netlify UI):**
    *   `VITE_API_URL`: `https://your-backend-url.com` (You will get this after deploying the backend).

## 2. Backend API (Deploy to Render/Railway)
**Status:** ✅ Ready (Dockerfile included)
**Config:** `apps/api/Dockerfile` is created.

**Recommended Host:** [Railway](https://railway.app/) or [Render](https://render.com/).

**Steps (Railway Example):**
1.  Log in to Railway.
2.  "New Project" -> "Deploy from GitHub repo".
3.  Select your repo.
4.  **Settings:**
    *   **Root Directory:** `apps/api`
5.  **Variables:**
    *   `MONGODB_URI`: (Your MongoDB Atlas connection string)
    *   `REDIS_HOST`: (Your Redis Cloud/Upstash host)
    *   `REDIS_PORT`: (Your Redis port)
    *   `JWT_SECRET`: (A strong secret key)

## 3. Worker Service (The Tricky Part) ⚠️
The worker service executes user code using Docker. Most PaaS (Heroku/Vercel/Netlify) **DO NOT** allow running Docker-in-Docker.

**Options:**
1.  **Use a VPS (DigitalOcean/AWS EC2):**
    *   Rent a server ($5/mo).
    *   Install Docker & Node.js.
    *   Clone repo and run `npm run start:worker`.
2.  **Railway (Experimental):**
    *   Railway *does* allow Docker deployment, but running *nested* docker containers requires privileged access which might be complex to configure.

## 4. Database & Queue (Cloud)
*   **MongoDB:** Use [MongoDB Atlas](https://www.mongodb.com/atlas) (Free tier available).
*   **Redis:** Use [Upstash](https://upstash.com/) or [Redis Cloud](https://redis.com/try-free/) (Free tiers available).

---

## 🏁 Summary Checklist
- [x] Frontend Configured for Netlify (`netlify.toml`)
- [x] Backend Dockerized (`Dockerfile`)
- [x] Hardcoded `localhost` URLs removed from Frontend
- [ ] MongoDB Atlas Database Created
- [ ] Redis Cloud Instance Created
