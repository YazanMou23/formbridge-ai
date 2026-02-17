import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, deviceId } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ success: false, error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, { status: 400 });
        }

        try {
            const user = await createUser(name, email, password, deviceId);

            if (!user) {
                return NextResponse.json({ success: false, error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
            }

            // Send verification email (user object has verificationToken attached internally in lib/auth but here it is stripped!)
            // Wait, createUser returns SafeUser (no passwordHash).
            // But I modified createUser in lib/auth to only return safe user, which DOES NOT include verificationToken (it was stripped along with passwordHash in the return statement at the end of createUser).
            // Wait, in my modification of `createUser` in `lib/auth.ts`:
            // const { passwordHash: _, ...safeUser } = user;
            // return safeUser;
            // `user` (StoredUser) has `verificationToken`. `safeUser` (User) MIGHT have it if I added it to `User` interface.
            // I DID add `verificationToken` to `User` interface in `types/auth.ts`.
            // So `safeUser` WILL include `verificationToken`.

            if (user.verificationToken) {
                await sendVerificationEmail(user.email, user.verificationToken);
            }

            return NextResponse.json({
                success: true,
                message: 'Account created. Please verify your email.',
                requiresVerification: true
            });

        } catch (err: any) {
            // Handle duplicate device error
            if (err.message && err.message.includes('device')) {
                return NextResponse.json({ success: false, error: err.message }, { status: 403 });
            }
            throw err;
        }

    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ success: false, error: 'فشل في إنشاء الحساب' }, { status: 500 });
    }
}
