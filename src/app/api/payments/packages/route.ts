import { NextResponse } from 'next/server';
import { CREDIT_PACKAGES } from '@/lib/stripe';

export async function GET() {
    return NextResponse.json({
        success: true,
        packages: CREDIT_PACKAGES
    });
}
