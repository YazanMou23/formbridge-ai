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
        const timeout = setTimeout(() => reject(new Error(`Timeout for ${method}`)), 15000);
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
    logMsg('INFO', 'Starting Inspection...');
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
    await sendCommand(ws, 'Log.enable');

    // 1. Check Page state
    const url = await evaluate(ws, 'location.href');
    const title = await evaluate(ws, 'document.title');
    logMsg('PAGE', { url, title });

    // 2. Check for Capacitor and GoogleAuth plugin
    const capacitorInfo = await evaluate(ws, `
        ({
            hasCapacitor: typeof window.Capacitor !== 'undefined',
            platform: typeof window.Capacitor !== 'undefined' ? window.Capacitor.getPlatform() : 'none',
            hasGoogleAuth: typeof window.Capacitor !== 'undefined' && !!window.Capacitor.Plugins.GoogleAuth
        })
    `);
    logMsg('CAPACITOR', capacitorInfo);

    // 3. Scan for "Sign in with Google" button
    const buttons = await evaluate(ws, `
        Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
            text: b.innerText,
            id: b.id,
            className: b.className,
            visible: b.offsetParent !== null
        })).filter(b => b.text.toLowerCase().includes('google') || b.className.toLowerCase().includes('google'))
    `);
    logMsg('UI_INSPECTION', { googleButtons: buttons });

    // 4. Scan for potential PII in window object (Context Analysis)
    const contextScan = await evaluate(ws, `
        (() => {
            const results = {};
            const keys = Object.keys(window).filter(k => k.toLowerCase().includes('user') || k.toLowerCase().includes('token') || k.toLowerCase().includes('auth'));
            keys.forEach(k => {
                try {
                    const val = window[k];
                    if (typeof val === 'string' && val.length > 20) {
                        results[k] = val.substring(0, 10) + '... (length: ' + val.length + ')';
                    } else if (typeof val === 'object' && val !== null) {
                        results[k] = 'Object with keys: ' + Object.keys(val).join(', ');
                    }
                } catch(e) {}
            });
            return results;
        })()
    `);
    logMsg('CONTEXT_SCAN', contextScan);

    // 5. Look for loading states
    const loadingStates = await evaluate(ws, `
        Array.from(document.querySelectorAll('*')).filter(el => {
            const style = window.getComputedStyle(el);
            return (el.className.includes('loading') || el.className.includes('spinner')) && style.display !== 'none' && style.visibility !== 'hidden';
        }).map(el => el.className)
    `);
    logMsg('LOADING_STATE', loadingStates);

    ws.close();
    fs.writeFileSync('inspection_report.json', JSON.stringify(log, null, 2));
}

main().catch(console.error);
