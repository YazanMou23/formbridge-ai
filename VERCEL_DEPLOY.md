# FormBridge AI - Vercel Deployment Guide
# ============================================

GREAT NEWS! I have updated your project to support **Vercel KV**, so you can deploy to Vercel without data loss.

## Step 1: Push to GitHub (If you haven't already)
Use the `push_to_github.bat` script I created, or run:
```bash
git push origin main
```

## Step 2: Deploy to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  **Import** your `formbridge-ai` project.
3.  **Environment Variables:** Add these during import (or in Settings later):
    - `OPENAI_API_KEY`
    - `JWT_SECRET`
    - `NEXT_PUBLIC_APP_URL`
    - `SMTP_HOST`, `SMTP_PAS`, etc. (if you want emails)

## Step 3: Create Database (Vercel KV)
This is the **most important part** for saving users!

1.  In your Vercel Project Dashboard, click **Storage** tab.
2.  Click **Create Database** -> Select **KV** (Redis).
3.  Choose a region (e.g., Frankfurt/Germany).
4.  Click **Create**.
5.  **Connect:** Once created, click **"Connect Project"** and select your `formbridge-ai` project.
    - This automatically adds the required environment variables (`KV_REST_API_URL`, etc.) to your deployment.

## Step 4: Redeploy
If you connected the database *after* the first deployment, you must **Redeploy**:
1.  Go to **Deployments** tab.
2.  Click the three dots (`...`) on the latest deployment -> **Redeploy**.

---

## Local Development vs. Production
- **On Vercel:** The app automatically detects the KV database and uses it.
- **On Localhost:** The app falls back to using the `.data/users.json` file. 
  - You can keep developing locally without needing internet/cloud connection!
