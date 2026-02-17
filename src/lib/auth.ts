// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Persistent User Store (Hybrid: Local Files + Vercel KV)
// ═══════════════════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';
import type { User } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'formbridge-ai-secret-key-change-in-production';
const INITIAL_CREDITS = 10;
const IS_VERCEL = !!process.env.KV_REST_API_URL;

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
        existingUser = await kv.get<StoredUser>(`user:${email}`);
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
            const existingDeviceEmail = await kv.get<string>(`device:${deviceId}`);
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

    const newUser: StoredUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        credits: INITIAL_CREDITS,
        createdAt: new Date().toISOString(),
        passwordHash,
        deviceId,
        isVerified: false,
        verificationToken,
    };

    if (IS_VERCEL) {
        // Save to Vercel KV
        await kv.set(`user:${email}`, newUser);
        if (deviceId) await kv.set(`device:${deviceId}`, email);
        if (verificationToken) await kv.set(`token:${verificationToken}`, email); // Index for verification
    } else {
        // Save to Local File
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
        user = await kv.get<StoredUser>(`user:${email}`);
    } else {
        const users = loadUsersLocal();
        user = users[email] || null;
    }

    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    if (user.isVerified === false) {
        console.warn(`Login attempt for unverified user: ${email}`);
        return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
}

export async function getUserByEmail(email: string): Promise<User | null> {
    let user: StoredUser | null = null;

    if (IS_VERCEL) {
        user = await kv.get<StoredUser>(`user:${email}`);
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
        const user = await kv.get<StoredUser>(`user:${email}`);
        if (!user) return false;

        user.credits = credits;
        await kv.set(`user:${email}`, user);
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
        const user = await kv.get<StoredUser>(`user:${email}`);
        if (!user) return { success: false, newCredits: 0 };

        if (user.credits < amount) {
            return { success: false, newCredits: user.credits };
        }

        user.credits -= amount;
        await kv.set(`user:${email}`, user);
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
        const user = await kv.get<StoredUser>(`user:${email}`);
        if (!user) return { success: false, newCredits: 0 };

        user.credits += amount;
        await kv.set(`user:${email}`, user);
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
        const email = await kv.get<string>(`token:${token}`);
        if (!email) return null;

        const user = await kv.get<StoredUser>(`user:${email}`);
        if (!user) return null; // Should not happen if token exists

        user.isVerified = true;
        user.verificationToken = undefined;

        await kv.set(`user:${email}`, user);
        await kv.del(`token:${token}`); // Clean up the token index

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
