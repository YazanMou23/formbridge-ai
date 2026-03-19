# FormBridge AI - Technical Documentation

FormBridge AI is a powerful, AI-driven platform designed to simplify document processing, form-filling, CV building, and document explanation. Built with **Next.js 16**, **React 19**, and **Capacitor**, it provides a seamless experience across web and mobile platforms.

---

## 🚀 Key Features

- **AI-Powered Form Filling**: Upload images or PDFs of forms, and FormBridge AI will intelligently analyze, extract fields, and help you fill them with AI assistance.
- **AI CV Builder**: Create professional resumes with AI-generated content tailored to your experience.
- **Document Explainer**: Upload complex documents (contracts, terms, etc.) and get clear, AI-driven explanations and summaries.
- **Image-to-PDF Conversion**: Effortlessly convert images into high-quality PDF documents.
- **Multilingual Support**: Fully localized in German, Arabic, and English using `next-intl`.
- **Mobile Integration**: Native-like experience on Android and iOS powered by Capacitor.
- **Secure Authentication**: Supports both Email/Password (JWT-based) and Google Sign-In.
- **Credit System**: A Stripe-integrated credit system to manage AI-powered features.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| **Backend** | Next.js API Routes, Vercel KV (Redis), OpenAI (GPT-4) |
| **Mobile** | Capacitor 8 (Cross-platform wrapper for Android & iOS) |
| **Authentication** | Google OAuth, JWT, BcryptJS |
| **Payments** | Stripe (API & Webhooks) |
| **PDF Processing** | `@react-pdf/renderer`, `jspdf`, `pdfjs-dist` |
| **Development** | ESLint, PostCSS |

---

## 📂 Project Structure

```bash
formbridge-ai/
├── android/            # Capacitor Android project files
├── ios/                # Capacitor iOS project files
├── public/             # Static assets (images, icons)
├── src/
│   ├── app/            # Next.js App Router (Pages & API routes)
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers (Auth, Theme, etc.)
│   ├── i18n/           # Internationalization configurations
│   ├── lib/            # Utility functions & shared libraries
│   ├── types/          # TypeScript type definitions
│   └── middleware.ts   # Next.js Middleware for Auth/Localization
├── capacitor.config.ts # Capacitor configuration
├── next.config.ts      # Next.js configuration
├── package.json        # Dependencies & scripts
└── tsconfig.json       # TypeScript configuration
```

---

## ⚙️ Core Components

1.  **DirectFormEditor**: The main interface for AI-assisted form editing.
2.  **CVBuilder**: A specialized wizard for building professional resumes.
3.  **DocumentExplainer**: Provides AI-driven insights and explanations for uploaded files.
4.  **AuthModal**: Handles multi-method authentication (Email/Google).
5.  **CreditsModal**: Manages the user's credit balance and top-up options via Stripe.
6.  **PdfEditor / PositionAdjuster**: Advanced PDF and image positioning tools for precise form placement.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YazanMou23/formbridge-ai.git
    cd formbridge-ai
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    - Create a `.env.local` file from the `.env.example`.
    - Fill in your `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, and `JWT_SECRET`.

4.  Run the development server:
    ```bash
    npm run dev
    ```

---

## 📱 Mobile Development (Capacitor)

FormBridge AI uses Capacitor to provide native mobile apps.

1.  Add desired platforms:
    ```bash
    npx cap add android
    npx cap add ios
    ```

2.  Build the project and sync to mobile:
    ```bash
    npm run build
    npx cap sync
    ```

3.  Open the project in Android Studio or Xcode:
    ```bash
    npx cap open android
    npx cap open ios
    ```

---

## 🚀 Deployment

The project is configured for easy deployment on several platforms:

- **Vercel**: Optimized for Next.js, use `VERCEL_DEPLOY.md` for details.
- **Netlify**: Configured via `netlify.toml`.
- **Hostinger**: See `HOSTINGER_DEPLOY.md` for specific shared-hosting instructions.

---

## 📜 Specialized Scripts

The project includes custom scripts to handle complex build and deployment scenarios:

### 1. `build-mobile.js`
Used for creating mobile-ready static exports:
- **Clears Cache**: Removes the `.next` folder.
- **API Hiding**: Temporarily renames `src/app/api` to `src/app/_api` to allow Next.js to perform a static artifact export (which fails if API routes are present).
- **Static Export**: Runs `next build` with `MOBILE_BUILD=true`.
- **Capacitor Sync**: Syncs the build to Android/iOS platforms.
- **Restoration**: Automatically restores the API folder after completion.

### 2. `prepare-deploy.js`
Optimizes the build for Hostinger or other custom Node.js environments:
- **Standalone Build**: Uses the Next.js standalone output.
- **Asset Migration**: Copies static files and public assets into a dedicated `deploy/` folder.
- **Environment Prep**: Ensures the `.data` directory exists for local JSON storage (if used).
- **Server Entry**: Configures the `server.js` entry point for the Node.js runtime.

---

## 🛡️ Security & Performance

- **JWT Authentication**: Secure, stateless user sessions.
- **Fingerprinting**: Prevents unauthorized access or spam using `@fingerprintjs/fingerprintjs`.
- **Image Optimization**: Powered by `sharp` for efficient asset delivery.
- **Edge Functions**: Leveraging Vercel's edge network for fast global performance.

---

© 2026 FormBridge AI. All rights reserved.
