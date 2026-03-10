import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const origin = request.headers.get('origin') || '*';
    const isOptions = request.method === 'OPTIONS';

    const corsHeaders = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };

    // Handle preflight directly
    if (isOptions) {
        return new NextResponse(null, { headers: corsHeaders, status: 204 });
    }

    const requestHeaders = new Headers(request.headers);

    // Inject auth_token into cookies if a Bearer token is provided 
    // This allows Capacitor's Authorization header to work seamlessly with NextJS's cookie-based auth check
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const currentCookies = requestHeaders.get('cookie') || '';
        requestHeaders.set('cookie', `${currentCookies ? currentCookies + '; ' : ''}auth_token=${token}`);
    }

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
