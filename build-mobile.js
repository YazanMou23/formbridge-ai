const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const apiPath = path.join(__dirname, 'src', 'app', 'api');
const tempApiPath = path.join(__dirname, 'src', 'app', '_api');
const nextDir = path.join(__dirname, '.next');

// 1. Remove .next folder to clear cache
if (fs.existsSync(nextDir)) {
    console.log("Clearing Next.js cache...");
    fs.rmSync(nextDir, { recursive: true, force: true });
}

// 2. Hide API folder temporarily so static export succeeds Without API Routes
let apiMoved = false;
if (fs.existsSync(apiPath)) {
    fs.renameSync(apiPath, tempApiPath);
    apiMoved = true;
}

try {
    // 3. Build Next.js as static export
    console.log("Building Next.js for mobile (Static Export)...");
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env, MOBILE_BUILD: 'true' }
    });

    // 4. Sync Catalyst/Capacitor
    console.log("Syncing built files to iOS and Android bundles...");
    execSync('npx cap sync', { stdio: 'inherit' });

    console.log("✅ Mobile build and sync completed successfully!");

} catch (error) {
    console.error("❌ Mobile build failed:", error.message);
} finally {
    // 5. Restore API folder so standard 'npm run dev' still works!
    if (apiMoved && fs.existsSync(tempApiPath)) {
        console.log("Restoring API routes...");
        fs.renameSync(tempApiPath, apiPath);
    }
}
