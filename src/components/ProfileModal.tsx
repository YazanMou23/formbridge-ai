'use client';

import React, { useState, useRef } from 'react';
import type { User } from '@/types/auth';
import type { Locale } from '@/types';

interface Props {
    user: User;
    locale: Locale;
    onClose: () => void;
    onUpdate: (updatedUser: User) => void;
}

export default function ProfileModal({ user, locale, onClose, onUpdate }: Props) {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [photoUrl, setPhotoUrl] = useState(user.photoUrl || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError(locale === 'ar' ? 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت' : 'Bildgröße darf 2MB nicht überschreiten');
                return;
            }

            const reader = new FileReader();
            reader.onload = (ev) => {
                setPhotoUrl(ev.target?.result as string);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch('/api/auth/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, photoUrl }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Success
            setSuccess(true);
            onUpdate(data.user); // Parent updates state

            // Close after delay
            setTimeout(() => {
                onClose();
            }, 1000);

        } catch (err: any) {
            setError(err.message || 'Error updating profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="glass-card animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: locale === 'ar' ? 'auto' : '1rem',
                        left: locale === 'ar' ? '1rem' : 'auto',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-neutral-400)',
                        cursor: 'pointer',
                        fontSize: '1.5rem'
                    }}
                >
                    ×
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    {locale === 'ar' ? 'تعديل الملف الشخصي' : 'Profil bearbeiten'}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: photoUrl ? `url(${photoUrl}) center/cover no-repeat` : 'var(--color-primary-600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'white',
                            marginBottom: '1rem',
                            border: '2px solid var(--color-primary-400)',
                            position: 'relative',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {!photoUrl && name.charAt(0).toUpperCase()}
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'rgba(0,0,0,0.6)',
                            fontSize: '0.8rem',
                            padding: '0.2rem',
                            textAlign: 'center',
                            width: '100%'
                        }}>
                            {locale === 'ar' ? 'تغيير' : 'Ändern'}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        accept="image/*"
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                            {locale === 'ar' ? 'الاسم' : 'Name'}
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">
                            {locale === 'ar' ? 'البريد الإلكتروني' : 'E-Mail'}
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field w-full"
                        />
                    </div>

                    {error && (
                        <div className="alert alert-error text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success text-sm bg-green-500/10 text-green-400 border border-green-500/20 p-3 rounded">
                            {locale === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profil erfolgreich aktualisiert!'}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="btn btn-primary w-full mt-4"
                    >
                        {isLoading ? (
                            <span className="loading-spinner" />
                        ) : (
                            locale === 'ar' ? 'حفظ التغييرات' : 'Änderungen speichern'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
