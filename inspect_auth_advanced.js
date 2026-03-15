const WebSocket = require('ws');
const fs = require('fs');

const WS_URL = 'ws://localhost:9333/devtools/page/A7566787438503225830E09E931281CD';
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
        const timeout = setTimeout(() => reject(new Error(`Timeout for ${method}`)), 20000);
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
    logMsg('INFO', 'Starting Advanced Inspection...');
    const ws = new WebSocket(WS_URL);
    await new Promise((resolve, reject) => { 
        ws.on('open', resolve); 
        ws.on('error', (e) => {
            logMsg('ERROR', 'Failed to connect: ' + e.message);
            reject(e);
        }); 
    });
    logMsg('CONNECT', 'Connected to WebView');

    await sendCommand(ws, 'Runtime.enable');

    // 1. Initial State
    const initialText = await evaluate(ws, 'document.body.innerText.substring(0, 100)');
    logMsg('INITIAL_TEXT', initialText);

    // 2. Click Login Button
    logMsg('ACTION', 'Clicking Login Button...');
    await evaluate(ws, `
        const btn = Array.from(document.querySelectorAll('button, a')).find(el => 
            el.innerText.includes('تسجيل الدخول') || el.innerText.includes('Sign In')
        );
        if (btn) btn.click();
    `);

    // Wait for animation/navigation
    await new Promise(r => setTimeout(r, 2000));

    // 3. Scan for Google Button
    const googleBtn = await evaluate(ws, `
        Array.from(document.querySelectorAll('button, [role="button"]')).find(b => 
            b.innerText.toLowerCase().includes('google') || b.className.toLowerCase().includes('google')
        ) ? 'FOUND' : 'NOT FOUND'
    `);
    logMsg('GOOGLE_BTN', googleBtn);

    if (googleBtn === 'FOUND') {
        const btnDetails = await evaluate(ws, `
            const b = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => 
                b.innerText.toLowerCase().includes('google') || b.className.toLowerCase().includes('google')
            );
            ({
                text: b.innerText,
                className: b.className,
                visible: b.offsetParent !== null,
                rect: b.getBoundingClientRect()
            })
        `);
        logMsg('GOOGLE_BTN_DETAILS', btnDetails);
        
        // 4. Test loading state (trigger click)
        logMsg('ACTION', 'Clicking Google Sign-In Button...');
        await evaluate(ws, `
            const b = Array.from(document.querySelectorAll('button, [role="button"]')).find(b => 
                b.innerText.toLowerCase().includes('google') || b.className.toLowerCase().includes('google')
            );
            if (b) b.click();
        `);

        // Wait a bit for the intent to trigger
        await new Promise(r => setTimeout(r, 3000));

        // 5. Check for errors or loading state change
        const checkAfterClick = await evaluate(ws, `
            ({
                loading: !!document.querySelector('.loading, .spinner, [class*="loading"]'),
                errors: Array.from(document.querySelectorAll('.alert-error, .error, [class*="error"]')).map(e => e.innerText)
            })
        `);
        logMsg('POST_CLICK_CHECK', checkAfterClick);
    } else {
        logMsg('ERROR', 'Google Sign-In button not found after clicking Login.');
        // Log all buttons for debugging
        const allBtns = await evaluate(ws, "Array.from(document.querySelectorAll('button')).map(b => b.innerText)");
        logMsg('ALL_BUTTONS', allBtns);
    }

    ws.close();
    fs.writeFileSync('inspection_report_advanced.json', JSON.stringify(log, null, 2));
}

main().catch(console.error);
