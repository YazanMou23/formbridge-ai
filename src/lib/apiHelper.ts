export const getApiUrl = (path: string) => {
    // If NEXT_PUBLIC_MOBILE_API_URL is set (e.g. your production URL for mobile builds),
    // use it as the base URL. Otherwise, it will fallback to the relative path (for normal web).
    const baseUrl = process.env.NEXT_PUBLIC_MOBILE_API_URL || "";
    return `${baseUrl}${path}`;
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
    const url = getApiUrl(path);
    const headers = new Headers(options.headers || {});

    // Auto-inject security token from client storage for API routes
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
    }

    // Explicitly configure cross-domain options for Capacitor
    options.credentials = 'include';
    options.headers = headers;

    return fetch(url, options);
};
