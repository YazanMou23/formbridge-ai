// Android WebView Auth Test Script v2
const WebSocket = require('ws');
const fs = require('fs');

const WS_URL = 'ws://localhost:9333/devtools/page/456CB7875B26483EEF24A7E590C887BF';
let id = 1;
const log = [];

function logMsg(label, data) {
    const msg = `[${label}] ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    console.log(msg);
    log.push(msg);
}

function sendCommand(ws, method, params = {}) {
    return new Promise((resolve, reject) => {
        const cmdId = id++;
        const timeout = setTimeout(() => reject(new Error(`Timeout for ${method}`)), 10000);
        const handler = (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.id === cmdId) {
                clearTimeout(timeout);
                ws.removeListener('message', handler);
                if (msg.error) reject(new Error(JSON.stringify(msg.error)));
                else resolve(msg.result);
            }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id: cmdId, method, params }));
    });
}

async function evaluate(ws, expression) {
    const result = await sendCommand(ws, 'Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return result.result.value;
}

async function main() {
    logMsg('CONNECT', 'Connecting to WebView...');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => { ws.on('open', resolve); ws.on('error', reject); });
    logMsg('CONNECT', 'Connected!');

    await sendCommand(ws, 'Runtime.enable');

    // 1. Page info
    const pageInfo = await evaluate(ws, `JSON.stringify({ url: location.href, title: document.title })`);
    logMsg('PAGE', pageInfo);

    // 2. Find all buttons
    const buttons = await evaluate(ws, `
        JSON.stringify(Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.textContent.trim().substring(0, 60),
            class: b.className,
            visible: b.offsetParent !== null,
            rect: { top: b.getBoundingClientRect().top, left: b.getBoundingClientRect().left }
        })));
    `);
    logMsg('BUTTONS', buttons);

    // 3. Capacitor status
    const cap = await evaluate(ws, `
        JSON.stringify({
            hasCapacitor: typeof window.Capacitor !== 'undefined',
            isNative: typeof window.Capacitor !== 'undefined' ? window.Capacitor.isNativePlatform() : false,
            platform: typeof window.Capacitor !== 'undefined' ? window.Capacitor.getPlatform() : 'N/A',
            registeredPlugins: typeof window.Capacitor !== 'undefined' ? Object.keys(window.Capacitor.registeredPlugins || {}) : [],
            pluginKeys: typeof window.Capacitor !== 'undefined' ? Object.keys(window.Capacitor.Plugins || {}) : [],
        });
    `);
    logMsg('CAPACITOR', cap);

    // 4. Click the login button (center card)
    const click1 = await evaluate(ws, `
        const loginBtn = Array.from(document.querySelectorAll('button')).find(b => 
            b.textContent.includes('تسجيل الدخول') && b.classList.contains('btn-primary')
        ) || Array.from(document.querySelectorAll('.btn-primary'));
        
        if (loginBtn && loginBtn.click) {
            loginBtn.click();
            'Clicked: ' + loginBtn.textContent.trim().substring(0, 30);
        } else if (loginBtn && loginBtn.length > 0) {
            loginBtn[0].click();
            'Clicked first btn-primary: ' + loginBtn[0].textContent.trim().substring(0, 30);
        } else {
            // Try header button
            const headerBtn = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('تسجيل')
            );
            if (headerBtn) {
                headerBtn.click();
                'Clicked header: ' + headerBtn.textContent.trim().substring(0, 30);
            } else {
                'No login button found at all!';
            }
        }
    `);
    logMsg('CLICK_LOGIN', click1);

    await new Promise(r => setTimeout(r, 2000));

    // 5. Check modal state
    const modal = await evaluate(ws, `
        const overlay = document.querySelector('.modal-overlay');
        const content = document.querySelector('.modal-content');
        const googleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Google'));
        const inputs = Array.from(document.querySelectorAll('.modal-content input')).map(i => ({
            type: i.type, placeholder: i.placeholder, visible: i.offsetParent !== null
        }));
        JSON.stringify({
            hasOverlay: !!overlay,
            overlayVisible: overlay ? overlay.offsetParent !== null || window.getComputedStyle(overlay).display !== 'none' : false,
            hasContent: !!content,
            hasGoogleBtn: !!googleBtn,
            googleBtnText: googleBtn ? googleBtn.textContent.trim() : 'N/A',
            inputs,
        });
    `);
    logMsg('MODAL', modal);

    // 6. Try clicking Google Sign-In button
    const googleClick = await evaluate(ws, `
        const googleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Google'));
        if (googleBtn) {
            googleBtn.click();
            'Clicked: ' + googleBtn.textContent.trim();
        } else {
            'Google button NOT found';
        }
    `);
    logMsg('GOOGLE_CLICK', googleClick);

    // Wait for Google Sign-In attempt
    await new Promise(r => setTimeout(r, 5000));

    // 7. Check results/errors
    const errors = await evaluate(ws, `
        const errorEl = document.querySelectorAll('.alert-error, .alert, [class*="error"]');
        const errorTexts = Array.from(errorEl).map(e => e.textContent.trim().substring(0, 100));
        const overlay = document.querySelector('.modal-overlay');
        JSON.stringify({
            errors: errorTexts,
            modalStillOpen: !!overlay,
        });
    `);
    logMsg('ERRORS', errors);

    // 8. Check console errors captured
    const consoleErrors = await evaluate(ws, `
        // Check if there are error messages from the auth flow
        const allText = document.body.innerText;
        const hasGoogleError = allText.includes('Google') && (allText.includes('fehlgeschlagen') || allText.includes('فشل'));
        JSON.stringify({
            hasGoogleError,
            bodyTextSnippet: document.querySelector('.modal-content')?.innerText?.substring(0, 300) || 'no modal content'
        });
    `);
    logMsg('CONSOLE', consoleErrors);

    ws.close();
    
    // Write full results to file
    fs.writeFileSync('C:/Users/yazan/AppData/Local/Temp/auth_test_results.txt', log.join('\n\n'), 'utf8');
    logMsg('DONE', 'Results saved to auth_test_results.txt');
}

main().catch(err => {
    logMsg('FATAL', err.message);
    fs.writeFileSync('C:/Users/yazan/AppData/Local/Temp/auth_test_results.txt', log.join('\n\n'), 'utf8');
    process.exit(1);
});
