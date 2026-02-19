// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Persistent User Store (Hybrid: Local Files + Vercel KV)
// ═══════════════════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { kv, createClient } from '@vercel/kv';
import type { User } from '@/types/auth';

// Manual KV Client Setup (Fix for missing var error)
let kvClient = kv;
if (!process.env.KV_REST_API_URL && process.env.UPSTASH_REDIS_REST_URL) {
    console.log('[Auth Init] Manually initializing KV client with Upstash vars');
    kvClient = createClient({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
}

const JWT_SECRET = process.env.JWT_SECRET || 'formbridge-ai-secret-key-change-in-production';
const INITIAL_CREDITS = 10;

// FORCE Vercel mode if any of these are true:
// 1. KV_REST_API_URL exists
// 2. UPSTASH_REDIS_REST_URL exists
// 3. VERCEL env var exists (we are running on Vercel)
// 4. NODE_ENV is 'production' (we shouldn't use local files in prod)
const IS_VERCEL = !!(
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.REDIS_URL ||
    process.env.VERCEL ||
    process.env.NODE_ENV === 'production'
);

console.log('[Auth Init] Environment Check:', {
    hasKvUrl: !!process.env.KV_REST_API_URL,
    hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasRedisUrl: !!process.env.REDIS_URL,
    isVercelEnv: !!process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    IS_VERCEL_DETERMINED: IS_VERCEL
});

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

interface StoredUser extends User {
    passwordHash: string;
    deviceId?: string;
    verificationToken?: string;
    isVerified?: boolean;
}

interface UsersData {
    users: Record<string, StoredUser>;
}

// ----------------------------------------------------------------------------
// Local File Storage Helpers (Fallbacks like before)
// ----------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), '.data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

function loadUsersLocal(): Record<string, StoredUser> {
    try {
        ensureDataDir();
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf-8');
            const parsed: UsersData = JSON.parse(data);
            return parsed.users || {};
        }
    } catch (error) {
        console.error('Error loading local users:', error);
    }
    return {};
}

function saveUsersLocal(users: Record<string, StoredUser>): void {
    try {
        ensureDataDir();
        const data: UsersData = { users };
        fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving local users:', error);
    }
}

// ----------------------------------------------------------------------------
// Auth Functions (Async wrappers for KV compat)
// ----------------------------------------------------------------------------

export async function createUser(name: string, email: string, password: string, deviceId?: string): Promise<User | null> {
    // 1. Check if user exists
    let existingUser: StoredUser | null = null;

    if (IS_VERCEL) {
        existingUser = await kvClient.get<StoredUser>(`user:${email}`);
    } else {
        const users = loadUsersLocal();
        existingUser = users[email] || null;
    }

    if (existingUser) {
        return null; // User already exists
    }

    // 2. Check Device ID Usage (Prevent duplicate accounts per device)
    if (deviceId) {
        if (IS_VERCEL) {
            // Check if device ID is already mapped to an email
            const existingDeviceEmail = await kvClient.get<string>(`device:${deviceId}`);
            if (existingDeviceEmail) {
                console.warn(`Blocked registration attempt from duplicate device: ${deviceId}`);
                throw new Error('This device is already registered. Only one account per device is allowed.');
            }
        } else {
            const users = loadUsersLocal();
            const existingDeviceUser = Object.values(users).find(u => u.deviceId === deviceId);
            if (existingDeviceUser) {
                console.warn(`Blocked registration attempt from duplicate device: ${deviceId}`);
                throw new Error('This device is already registered. Only one account per device is allowed.');
            }
        }
    }

    const verificationToken = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`[Auth] Creating user ${email}. IS_VERCEL=${IS_VERCEL}`);

    // Data to save
    const newUser: StoredUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        credits: INITIAL_CREDITS,
        createdAt: new Date().toISOString(),
        passwordHash,
        deviceId,
        isVerified: true,
        verificationToken,
    };

    if (IS_VERCEL) {
        console.log('[Auth] Saving to Vercel KV...');
        try {
            await kvClient.set(`user:${email}`, newUser);
            if (deviceId) {
                console.log(`[Auth] Mapping device ${deviceId} to email`);
                await kvClient.set(`device:${deviceId}`, email);
            }
            if (verificationToken) await kvClient.set(`token:${verificationToken}`, email);
            console.log('[Auth] Successfully saved to KV');
        } catch (kvError) {
            console.error('[Auth] CRITICAL ERROR saving to KV:', kvError);
            // Fallback? No, just throw for now so we see the error
            throw kvError;
        }
    } else {
        // Save to Local File
        console.log('[Auth] Saving to Local File System');
        const users = loadUsersLocal();
        users[email] = newUser;
        saveUsersLocal(users);
    }

    // Return safe user object
    const { passwordHash: _, ...safeUser } = newUser;
    return safeUser;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
    let user: StoredUser | null = null;

    if (IS_VERCEL) {
        user = await kvClient.get<StoredUser>(`user:${email}`);
    } else {
        const users = loadUsersLocal();
        user = users[email] || null;
    }

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    // if (user.isVerified === false) {
    //     console.warn(`Login attempt for unverified user: ${email}`);
    //     return null;
    // }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    let user: StoredUser | null = null;

    if (IS_VERCEL) {
        user = await kvClient.get<StoredUser>(`user:${email}`);
    } else {
        const users = loadUsersLocal();
        user = users[email] || null;
    }

    if (!user) return null;

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
}

export async function updateUserCredits(email: string, credits: number): Promise<boolean> {
    if (IS_VERCEL) {
        const user = await kvClient.get<StoredUser>(`user:${email}`);
        if (!user) return false;

        user.credits = credits;
        await kvClient.set(`user:${email}`, user);
        return true;
    } else {
        const users = loadUsersLocal();
        const user = users[email];
        if (!user) return false;

        user.credits = credits;
        users[email] = user;
        saveUsersLocal(users);
        return true;
    }
}

export async function deductUserCredits(email: string, amount: number): Promise<{ success: boolean; newCredits: number }> {
    if (IS_VERCEL) {
        const user = await kvClient.get<StoredUser>(`user:${email}`);
        if (!user) return { success: false, newCredits: 0 };

        if (user.credits < amount) {
            return { success: false, newCredits: user.credits };
        }

        user.credits -= amount;
        await kvClient.set(`user:${email}`, user);
        return { success: true, newCredits: user.credits };
    } else {
        const users = loadUsersLocal();
        const user = users[email];
        if (!user) return { success: false, newCredits: 0 };

        if (user.credits < amount) {
            return { success: false, newCredits: user.credits };
        }

        user.credits -= amount;
        users[email] = user;
        saveUsersLocal(users);
        return { success: true, newCredits: user.credits };
    }
}

export async function addUserCredits(email: string, amount: number): Promise<{ success: boolean; newCredits: number }> {
    if (IS_VERCEL) {
        const user = await kvClient.get<StoredUser>(`user:${email}`);
        if (!user) return { success: false, newCredits: 0 };

        user.credits += amount;
        await kvClient.set(`user:${email}`, user);
        return { success: true, newCredits: user.credits };
    } else {
        const users = loadUsersLocal();
        const user = users[email];
        if (!user) return { success: false, newCredits: 0 };

        user.credits += amount;
        users[email] = user;
        saveUsersLocal(users);
        return { success: true, newCredits: user.credits };
    }
}

export async function verifyUserAccount(token: string): Promise<User | null> {
    if (IS_VERCEL) {
        // Use the token index we created during registration
        const email = await kvClient.get<string>(`token:${token}`);
        if (!email) return null;

        const user = await kvClient.get<StoredUser>(`user:${email}`);
        if (!user) return null; // Should not happen if token exists

        user.isVerified = true;
        user.verificationToken = undefined;

        await kvClient.set(`user:${email}`, user);
        await kvClient.del(`token:${token}`); // Clean up the token index

        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    } else {
        const users = loadUsersLocal();
        const userEmail = Object.keys(users).find(email => users[email].verificationToken === token);

        if (!userEmail) return null;

        const user = users[userEmail];
        user.isVerified = true;
        user.verificationToken = undefined;

        users[userEmail] = user;
        saveUsersLocal(users);

        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
}

// ----------------------------------------------------------------------------
// Tokens (Pure functions, no storage access)
// ----------------------------------------------------------------------------

export function generateToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; email: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    } catch {
        return null;
    }
}

export async function updateUserProfile(
    currentEmail: string,
    updates: { name?: string; email?: string; photoUrl?: string }
): Promise<{ success: boolean; user?: User; error?: string }> {
    console.log(`[Auth] Updating user profile for ${currentEmail}`, updates);

    let user: StoredUser | null = null;
    let usersLocal: Record<string, StoredUser> = {};

    // 1. Load User
    if (IS_VERCEL) {
        user = await kvClient.get<StoredUser>(`user:${currentEmail}`);
    } else {
        usersLocal = loadUsersLocal();
        user = usersLocal[currentEmail];
    }

    if (!user) {
        return { success: false, error: 'User not found' };
    }

    // 2. Prepare Updates
    const newName = updates.name || user.name;
    const newPhotoUrl = updates.photoUrl !== undefined ? updates.photoUrl : user.photoUrl;
    const newEmail = updates.email && updates.email !== currentEmail ? updates.email : currentEmail;

    // Check Email Availability
    if (newEmail !== currentEmail) {
        let exists = false;
        if (IS_VERCEL) {
            // In KV, check if key exists
            exists = (await kvClient.exists(`user:${newEmail}`)) === 1;
        } else {
            exists = !!usersLocal[newEmail];
        }

        if (exists) {
            return { success: false, error: 'Email already in use' };
        }
    }

    const updatedUser: StoredUser = {
        ...user,
        name: newName,
        email: newEmail,
        photoUrl: newPhotoUrl,
    };

    // 3. Save Changes
    if (IS_VERCEL) {
        if (newEmail !== currentEmail) {
            // Transaction-like sequence
            await kvClient.set(`user:${newEmail}`, updatedUser);
            await kvClient.del(`user:${currentEmail}`);

            // Update Device Mapping
            if (user.deviceId) {
                await kvClient.set(`device:${user.deviceId}`, newEmail);
            }

            // Migrate History
            try {
                const historyKey = `history:${currentEmail}`;
                const newHistoryKey = `history:${newEmail}`;
                // Check if history exists
                const historyExists = await kvClient.exists(historyKey);
                if (historyExists) {
                    await kvClient.rename(historyKey, newHistoryKey);
                }
            } catch (e) {
                console.warn('History migration failed', e);
            }

        } else {
            await kvClient.set(`user:${currentEmail}`, updatedUser);
        }
    } else {
        // Local File Storage
        if (newEmail !== currentEmail) {
            usersLocal[newEmail] = updatedUser;
            delete usersLocal[currentEmail];

            // Migrate History Local
            try {
                const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
                if (fs.existsSync(HISTORY_FILE)) {
                    const historyData = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
                    if (historyData[currentEmail]) {
                        historyData[newEmail] = historyData[currentEmail];
                        delete historyData[currentEmail];
                        fs.writeFileSync(HISTORY_FILE, JSON.stringify(historyData, null, 2), 'utf-8');
                    }
                }
            } catch (e) {
                console.warn('History migration failed locally', e);
            }

        } else {
            usersLocal[currentEmail] = updatedUser;
        }
        saveUsersLocal(usersLocal);
    }

    // Clean return
    const { passwordHash: _, ...safeUser } = updatedUser;
    return { success: true, user: safeUser };
}
