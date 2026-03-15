// ═══════════════════════════════════════════════════════════════════════════
// FormBridge AI - Platform-Aware Google Authentication
// Works on Web (popup) AND Android/iOS (native Capacitor plugin)
// ═══════════════════════════════════════════════════════════════════════════

import { Capacitor } from '@capacitor/core';

/**
 * Detects if the app is running inside a Capacitor native shell (Android/iOS)
 */
export function isNativePlatform(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Sign in with Google on native platforms (Android/iOS).
 * Uses @codetrix-studio/capacitor-google-auth which opens the native Google
 * sign-in dialog instead of a popup (which is blocked in WebView).
 *
 * Returns the serverAuthCode or idToken that we send to our backend.
 */
export async function googleSignInNative(): Promise<{
    email: string;
    name: string;
    imageUrl?: string;
    idToken?: string;
    serverAuthCode?: string;
    accessToken?: string;
}> {
    // Dynamic import so this module doesn't break web bundles
    const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');

    // Initialize (safe to call multiple times)
    await GoogleAuth.initialize({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
    });

    const user = await GoogleAuth.signIn();

    return {
        email: user.email,
        name: user.name || user.givenName || user.email.split('@')[0],
        imageUrl: user.imageUrl,
        idToken: user.authentication?.idToken,
        serverAuthCode: user.serverAuthCode,
        accessToken: user.authentication?.accessToken,
    };
}

/**
 * Sign out on native platforms
 */
export async function googleSignOutNative(): Promise<void> {
    try {
        const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
        await GoogleAuth.signOut();
    } catch {
        // Ignore errors during sign-out
    }
}
