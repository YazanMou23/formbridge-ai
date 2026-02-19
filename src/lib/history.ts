
import { kv, createClient } from '@vercel/kv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Manual KV Client Setup (copied from auth.ts)
let kvClient = kv;
if (process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
    // Only initialize manually if specific Upstash vars are present and standard KV vars aren't
    kvClient = createClient({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
}

const IS_VERCEL = !!(
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_URL ||
    process.env.VERCEL ||
    process.env.NODE_ENV === 'production'
);

export interface HistoryItem {
    id: string;
    action: 'translate' | 'explain' | 'analyze' | 'generate_pdf';
    details: string;
    timestamp: string;
    status: 'success' | 'failed';
    metadata?: any;
}

interface HistoryData {
    history: Record<string, HistoryItem[]>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadHistoryLocal(): Record<string, HistoryItem[]> {
    try {
        ensureDataDir();
        if (fs.existsSync(HISTORY_FILE)) {
            const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
            const parsed: HistoryData = JSON.parse(data);
            return parsed.history || {};
        }
    } catch (error) {
        console.error('Error loading local history:', error);
    }
    return {};
}

function saveHistoryLocal(history: Record<string, HistoryItem[]>): void {
    try {
        ensureDataDir();
        const data: HistoryData = { history };
        fs.writeFileSync(HISTORY_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving local history:', error);
    }
}

export async function logUserHistory(
    email: string,
    action: HistoryItem['action'],
    details: string,
    status: 'success' | 'failed' = 'success',
    metadata?: any
): Promise<void> {
    const item: HistoryItem = {
        id: crypto.randomUUID(),
        action,
        details,
        timestamp: new Date().toISOString(),
        status,
        metadata
    };

    if (IS_VERCEL) {
        try {
            // Use lpush/lrange for list structure in Redis
            // Key: history:{email}
            await kvClient.lpush(`history:${email}`, item);
            // Optional: Limit history length to prevent infinite growth?
            // await kvClient.ltrim(`history:${email}`, 0, 99); // Keep last 100
        } catch (error) {
            console.error('Error logging history to KV:', error);
        }
    } else {
        const history = loadHistoryLocal();
        if (!history[email]) {
            history[email] = [];
        }
        history[email].unshift(item); // Add to beginning
        saveHistoryLocal(history);
    }
}

export async function getUserHistory(email: string, limit: number = 50): Promise<HistoryItem[]> {
    if (IS_VERCEL) {
        try {
            return await kvClient.lrange(`history:${email}`, 0, limit - 1) as HistoryItem[];
        } catch (error) {
            console.error('Error fetching history from KV:', error);
            return [];
        }
    } else {
        const history = loadHistoryLocal();
        return (history[email] || []).slice(0, limit);
    }
}
