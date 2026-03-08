'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
    const t = useTranslations('Testimonials');
    const items = ['1', '2', '3'] as const;

    return (
        <section className="py-24 md:py-32 bg-light-gray relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-black text-[10px] tracking-widest uppercase mb-4 shadow-sm"
                    >
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                        <span>{t('subtitle')}</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-tight"
                    >
                        {t('title')}
                    </motion.h2>
                    <div className="w-20 h-2 bg-secondary mx-auto rounded-full mt-4"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {items.map((key, idx) => (
                        <motion.div
                            key={key}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="bg-white p-12 rounded-[3.5rem] shadow-[0_45px_100px_-25px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col items-start gap-10 relative overflow-hidden group hover:scale-[1.02] transition-all duration-500"
                        >
                            <Quote className="absolute -top-6 -right-6 w-32 h-32 text-gray-50 opacity-20 group-hover:text-secondary group-hover:scale-125 transition-all duration-700 pointer-events-none" strokeWidth={1} />

                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={20} className="fill-secondary text-secondary" />
                                ))}
                            </div>

                            <p className="text-gray-600 font-bold text-xl leading-relaxed italic relative z-10 group-hover:text-primary transition-colors">
                                "{t(`items.${key}.text`)}"
                            </p>

                            <div className="mt-auto flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary/40 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 group-hover:rotate-6 transition-transform">
                                    {t(`items.${key}.name`).charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-primary leading-none mb-3">{t(`items.${key}.name`)}</h4>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{t(`items.${key}.role`)}</span>
                                        <span className="w-1.5 h-1.5 bg-gray-200 rounded-full"></span>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('verified_customer')}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
