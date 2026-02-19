
import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';


interface HistoryItem {
    id: string;
    action: 'translate' | 'explain' | 'analyze' | 'generate_pdf';
    details: string;
    timestamp: string;
    status: 'success' | 'failed';
}

interface HistoryViewProps {
    onBack: () => void;
}

export default function HistoryView({ onBack }: HistoryViewProps) {
    const { locale } = useApp();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/history');
            const data = await res.json();
            if (data.success) {
                setHistory(data.history);
            } else {
                setError(locale === 'ar' ? 'فشل تحميل السجل' : 'Failed to load history');
            }
        } catch (err) {
            setError(locale === 'ar' ? 'حدث خطأ أثناء تحميل السجل' : 'An error occurred while loading history');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (action: string) => {
        switch (action) {
            case 'translate': return '🌍';
            case 'explain': return '💡';
            case 'analyze': return '🔍';
            case 'generate_pdf': return '📄';
            default: return '📝';
        }
    };

    const getActionLabel = (action: string) => {
        if (locale === 'ar') {
            switch (action) {
                case 'translate': return 'ترجمة';
                case 'explain': return 'شرح مستند';
                case 'analyze': return 'تحليل نموذج';
                case 'generate_pdf': return 'إنشاء PDF';
                default: return action;
            }
        } else {
            switch (action) {
                case 'translate': return 'Translation';
                case 'explain': return 'Explanation';
                case 'analyze': return 'Analysis';
                case 'generate_pdf': return 'PDF Generation';
                default: return action;
            }
        }
    };

    const formatDate = (isoString: string) => {
        try {
            return new Date(isoString).toLocaleString(locale === 'ar' ? 'ar-SY' : 'de-DE', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoString;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="btn btn-ghost"
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: locale === 'ar' ? '0' : '1rem',
                        marginLeft: locale === 'ar' ? '1rem' : '0',
                        padding: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--color-neutral-100)'
                    }}
                >
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>
                        {locale === 'ar' ? '→' : '←'}
                    </span>
                </button>
                <h2 className="text-2xl font-bold text-white">
                    {locale === 'ar' ? 'سجل النشاطات' : 'Activity History'}
                </h2>
            </div>

            {loading ? (
                <div className="flex-center py-12">
                    <div className="loading-spinner" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-400">
                    {error}
                    <button onClick={fetchHistory} className="btn btn-ghost mt-4 block mx-auto underline">
                        {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                    </button>
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 glass-card">
                    <p className="text-lg text-neutral-400">
                        {locale === 'ar' ? 'لا يوجد سجل نشاطات حتى الآن' : 'No activity history yet'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="glass-card p-4 flex items-center hover:bg-white/5 transition-colors"
                            style={{ padding: '1.25rem' }}
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl mr-4 ml-4">
                                {getIcon(item.action)}
                            </div>

                            <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-lg font-semibold text-white truncate">
                                        {getActionLabel(item.action)}
                                    </h3>
                                    <span className="text-xs text-neutral-400 whitespace-nowrap">
                                        {formatDate(item.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-300 truncate">
                                    {item.details}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
