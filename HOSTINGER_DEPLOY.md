# FormBridge AI - Hostinger Deployment Guide
# ============================================

## Prerequisites
- Hostinger Business Hosting with Node.js support
- FTP client (FileZilla recommended) or Hostinger's File Manager
- Your domain set up on Hostinger

## Step 1: Build the Project (Already Done)
Run this command locally:
```
npm run build
```

## Step 2: Prepare Deployment Files
After building, copy these to a folder called `deploy/`:

1. **`.next/standalone/formbridge-ai/`** → This is the main server
2. **`.next/static/`** → Copy to `deploy/.next/static/`  
3. **`public/`** → Copy to `deploy/public/`
4. **`.data/`** → Copy to `deploy/.data/`

The final structure should look like:
```
deploy/
├── .next/          (from standalone + static)
├── .data/          (user database)
├── node_modules/   (from standalone)
├── public/         (static assets)
├── server.js       (standalone server)
└── package.json
```

## Step 3: Set Up Node.js on Hostinger hPanel

1. Log in to your **Hostinger hPanel**
2. Go to **Advanced** → **Node.js**  (or search for "Node.js")
3. Click **Create Application**
4. Fill in:
   - **Node.js Version**: 20.x (or latest LTS)
   - **Application Root**: `/public_html` (or your domain's root folder)
   - **Application URL**: Your domain
   - **Startup File**: `server.js`

5. Click **Create**

## Step 4: Upload Files to Hostinger

### Option A: Using Hostinger File Manager
1. Go to **hPanel** → **Files** → **File Manager**
2. Navigate to `public_html/`
3. Upload all files from the `deploy/` folder

### Option B: Using FTP (FileZilla)
1. Go to **hPanel** → **Files** → **FTP Accounts**
2. Get your FTP credentials
3. Connect via FileZilla and upload to `public_html/`

## Step 5: Set Environment Variables

In hPanel → **Node.js** section, add environment variables:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `OPENAI_API_KEY` | `sk-proj-...your key...` |
| `JWT_SECRET` | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` |
| `STRIPE_SECRET_KEY` | `sk_live_...your key...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...your key...` |
| `SMTP_HOST` | `smtp.hostinger.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | `info@yourdomain.com` |
| `SMTP_PASS` | `your-email-password` |
| `SMTP_FROM` | `FormBridge AI <info@yourdomain.com>` |
| `PORT` | `3000` |

## Step 6: Start the Application

1. In hPanel Node.js section, click **Restart** on your app
2. Your app should now be live at your domain!

## Troubleshooting

### App not starting?
- Check the Node.js logs in hPanel
- Ensure `server.js` is in the root of `public_html/`
- Verify environment variables are set

### Static files not loading?
- Make sure `.next/static/` and `public/` folders are uploaded correctly
- Check that the paths match the standalone build structure

### API routes returning 500?
- Check environment variables (especially OPENAI_API_KEY, JWT_SECRET)
- Ensure `.data/` directory exists and is writable
