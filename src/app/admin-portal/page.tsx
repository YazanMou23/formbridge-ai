'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { apiFetch } from '@/lib/apiHelper';
import Header from '@/components/Header';
import type { User } from '@/types/auth';

export default function AdminPortal() {
    const { locale, setLocale, credits } = useApp();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Marketing Form State
    const [emailSubject, setEmailSubject] = useState('');
    const [emailHtml, setEmailHtml] = useState('');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    // Check auth session
    useEffect(() => {
        async function checkSession() {
            try {
                const res = await apiFetch('/api/auth/me');
                const data = await res.json();
                if (data.success && data.user && data.user.role === 'admin') {
                    setUser(data.user);
                    fetchUsers();
                } else {
                    window.location.href = '/'; // Kick out if not admin
                }
            } catch (err) {
                console.error(err);
                window.location.href = '/';
            } finally {
                setAuthLoading(false);
            }
        }
        checkSession();
    }, []);

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        setError(null);
        try {
            const res = await apiFetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
            else setError(data.error || 'Failed to fetch users');
        } catch {
            setError('Fetch failed');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleUpdateUser = async (email: string, amount: number, updates?: any) => {
        setError(null);
        setSuccessMsg(null);
        try {
            const res = await apiFetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, credits: amount, updates }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(`User ${email} updated successfully!`);
                fetchUsers();
            } else {
                setError(data.error || 'Update failed');
            }
        } catch {
            setError('Update failed');
        }
    };

    const handleSendMarketing = async () => {
        if (!emailSubject || !emailHtml) {
            alert('Subject and Content required!');
            return;
        }

        if (!confirm(`Are you sure you want to send this email to ${users.length} users?`)) {
            return;
        }

        setIsSendingEmail(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const res = await apiFetch('/api/admin/marketing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject: emailSubject, htmlContent: emailHtml }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccessMsg(`Emails sent! Success: ${data.successCount}, Fails: ${data.failCount}`);
                setEmailSubject('');
                setEmailHtml('');
            } else {
                setError(data.error || 'Marketing campaign failed');
            }
        } catch {
            setError('Marketing failed');
        } finally {
            setIsSendingEmail(false);
        }
    };

    if (authLoading) return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="loading-spinner" /></div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Header
                locale={locale}
                onLocaleChange={setLocale}
                credits={user?.credits || 0}
                user={user}
                onLoginClick={() => {}}
                onLogout={() => {}}
                onBuyCredits={() => {}}
                onEditProfile={() => {}}
            />

            <main className="container py-12">
                <section className="flex justify-between items-center mb-12">
                     <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Admin Command Center
                    </h1>
                    <button className="btn btn-secondary" onClick={fetchUsers}>🔄 Refresh Data</button>
                </section>

                {error && <div className="alert alert-error mb-8">{error}</div>}
                {successMsg && <div className="alert alert-success mb-8">{successMsg}</div>}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                    {/* User List & Credit Management */}
                    <div className="glass-card p-6 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">👥</span>
                            <h2 className="text-2xl font-semibold">User Management ({users.length})</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="py-4 px-2">User</th>
                                        <th className="py-4 px-2">Credits</th>
                                        <th className="py-4 px-2">Role</th>
                                        <th className="py-4 px-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.email} className="border-b border-slate-800 hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-2">
                                                <div className="font-medium">{u.name}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </td>
                                            <td className="py-4 px-2">
                                                 <div className="flex items-center gap-2">
                                                     <span className="font-bold text-blue-400">{u.credits}</span>
                                                     <div className="flex flex-col gap-1">
                                                         <button className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded hover:bg-green-500/40" onClick={() => handleUpdateUser(u.email, u.credits + 10)}>+10</button>
                                                         <button className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded hover:bg-blue-500/40" onClick={() => handleUpdateUser(u.email, u.credits + 100)}>+100</button>
                                                     </div>
                                                 </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-slate-700 text-slate-300'}`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex gap-2">
                                                    <button className="btn btn-sm btn-ghost text-xs" onClick={() => {
                                                        const newCredits = prompt(`Update credits for ${u.name}:`, u.credits.toString());
                                                        if (newCredits) handleUpdateUser(u.email, parseInt(newCredits, 10));
                                                    }}>Edit Credits</button>
                                                    <button className="btn btn-sm btn-ghost text-xs" onClick={() => {
                                                        const newName = prompt(`Update Name for ${u.email}:`, u.name);
                                                        if (newName) handleUpdateUser(u.email, u.credits, { name: newName });
                                                    }}>Edit Profile</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && !isLoadingUsers && (
                                        <tr><td colSpan={4} className="py-12 text-center text-slate-500">No users found in database.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Marketing Email Blast */}
                    <div className="glass-card p-8 rounded-2xl border border-slate-700/50 shadow-2xl space-y-8">
                         <div className="flex items-center gap-3">
                            <span className="text-2xl">🚀</span>
                            <h2 className="text-2xl font-semibold">Marketing Email Blast</h2>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                             Send an email to <strong>all {users.length} registered users</strong>. You can use HTML for the content. Make sure to include an unsubscribe link!
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Campaign Subject</label>
                                <input
                                    type="text"
                                    className="input-field w-full bg-slate-800/50"
                                    placeholder="Enter email subject line..."
                                    value={emailSubject}
                                    onChange={e => setEmailSubject(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">HTML Content</label>
                                <textarea
                                    className="input-field w-full h-[300px] font-mono text-sm bg-slate-800/50"
                                    placeholder="<p>Welcome to FormBridge AI!</p>..."
                                    value={emailHtml}
                                    onChange={e => setEmailHtml(e.target.value)}
                                />
                            </div>

                            <button
                                className="btn btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-blue-500/20 disabled:scale-100"
                                onClick={handleSendMarketing}
                                disabled={isSendingEmail || users.length === 0}
                            >
                                {isSendingEmail ? (
                                    <>
                                        <span className="loading-spinner mr-2" />
                                        Sending blast...
                                    </>
                                ) : (
                                    '🚀 Send Broadcast to All Clients'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="container py-8 text-center text-slate-600 text-xs border-t border-slate-800 mt-20">
                FormBridge AI Admin Dashboard • Professional Use Only • Unauthorized Access is Prohibited
            </footer>

            <style jsx>{`
                .glass-card {
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(20px);
                }
                .btn-ghost:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>
        </div>
    );
}

