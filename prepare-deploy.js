// FormBridge AI - Prepare deployment files for Hostinger
// Run: node prepare-deploy.js

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const DEPLOY = path.join(SRC, 'deploy');
const STANDALONE = path.join(SRC, '.next', 'standalone');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) {
        console.log(`  ⚠ Skipping (not found): ${src}`);
        return;
    }
    fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('🚀 Preparing FormBridge AI for Hostinger deployment...\n');

// Check if build exists
if (!fs.existsSync(STANDALONE)) {
    console.error('❌ Standalone build not found! Run "npm run build" first.');
    process.exit(1);
}

// Clean previous deploy
if (fs.existsSync(DEPLOY)) {
    console.log('🧹 Cleaning previous deploy folder...');
    fs.rmSync(DEPLOY, { recursive: true, force: true });
}

// 1. Copy standalone output
console.log('📦 Copying standalone server...');
copyDir(STANDALONE, DEPLOY);

// 2. Copy static files
console.log('📁 Copying static files (.next/static)...');
copyDir(
    path.join(SRC, '.next', 'static'),
    path.join(DEPLOY, '.next', 'static')
);

// 3. Copy public folder
console.log('🖼️  Copying public assets...');
copyDir(
    path.join(SRC, 'public'),
    path.join(DEPLOY, 'public')
);

// 4. Ensure .data directory exists
console.log('💾 Ensuring .data directory...');
const dataDir = path.join(DEPLOY, '.data');
fs.mkdirSync(dataDir, { recursive: true });
const usersFile = path.join(SRC, '.data', 'users.json');
if (fs.existsSync(usersFile)) {
    fs.copyFileSync(usersFile, path.join(dataDir, 'users.json'));
    console.log('  ✓ Copied users.json');
} else {
    fs.writeFileSync(path.join(dataDir, 'users.json'), '[]');
    console.log('  ✓ Created empty users.json');
}

// 5. Copy the custom server.js entry
console.log('⚙️  Verifying server.js...');
const serverFile = path.join(DEPLOY, 'server.js');
if (fs.existsSync(serverFile)) {
    console.log('  ✓ server.js exists in standalone');
} else {
    // Copy our custom server.js
    fs.copyFileSync(path.join(SRC, 'server.js'), serverFile);
    console.log('  ✓ Copied custom server.js');
}

// Summary
const countFiles = (dir) => {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.isDirectory()) {
            count += countFiles(path.join(dir, entry.name));
        } else {
            count++;
        }
    }
    return count;
};

console.log('\n✅ Deployment package ready!');
console.log(`📁 Location: ${DEPLOY}`);
console.log(`📄 Total files: ${countFiles(DEPLOY)}`);
console.log('\n📋 Next steps:');
console.log('   1. Upload the "deploy/" folder contents to Hostinger public_html/');
console.log('   2. Set up Node.js app in hPanel (startup file: server.js)');
console.log('   3. Add environment variables in hPanel');
console.log('   4. Restart the Node.js app');
console.log('\n   See HOSTINGER_DEPLOY.md for detailed instructions.');
