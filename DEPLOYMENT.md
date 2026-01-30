# 🚀 Deployment Guide for CodeVamp (Netlify Optimized)

We have re-engineered the platform to support **direct deployment to Netlify** for both Frontend and Backend, eliminating the need for Render or Railway.

## 1. Prerequisites (MongoDB Atlas Setup)
**This is likely causing your current issues:**
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Go to **Network Access** (in the sidebar).
3.  Click **Add IP Address**.
4.  Select **Allow Access from Anywhere** (adds `0.0.0.0/0`).
    *   *Why?* Netlify uses dynamic IPs, so Atlas will block connections unless you whitelist everything or use a specific Atlas/Netlify integration.

## 2. Deploy to Netlify
**Steps:**
1.  Push your code to GitHub.
2.  Connect your repo to [Netlify](https://www.netlify.com/).
3.  **Netlify will automatically detect the settings from `netlify.toml` in the root:**
    *   **Build command:** `npm run build:api && npm run build:web`
    *   **Publish directory:** `apps/web/dist`
    *   **Functions directory:** `apps/api/dist`

4.  **Crucial: Set Environment Variables in Netlify UI:**
    *   `MONGODB_URI`: (Your Atlas connection string)
    *   `JWT_SECRET`: (A strong secret key)
    *   `NODE_ENV`: `production`

## 3. How it Works (Under the hood)
- **Backend**: Now runs as a Netlify Function. We've added a `lambda.ts` wrapper for NestJS.
- **Worker**: The Docker-based worker has been replaced with a **Serverless-friendly Execution Service** using the Piston API. You no longer need a separate server to run code!
- **Single Command**: Netlify handles the entire build process (Frontend + Backend) in one go.

## 🏁 Summary of Changes
- [x] Converted API to be Netlify-Function compatible.
- [x] Moved `netlify.toml` to root and configured it for the monorepo.
- [x] Replaced Docker Worker with Piston API (Serverless compatible).
- [x] Persistent submissions are now stored in MongoDB (previously volatile in Redis).


---

## 🏁 Summary of Changes for Netlify Compatibility
- [x] Moved `netlify.toml` to the root for automatic detection.
- [x] Added `/api/*` proxying in `netlify.toml` to avoid CORS issues.
- [x] Updated `apps/web/src/config.ts` to support relative API paths in production.
- [x] Configured SPA redirects to prevent 404 errors on page refresh.

> **Note:** The "issue" with Netlify often stems from it not knowing how to handle monorepos. These changes make it "Plug-and-Play".
