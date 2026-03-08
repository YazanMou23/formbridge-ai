'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
    const t = useTranslations('CTA');

    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative rounded-[5rem] overflow-hidden bg-primary text-white p-20 md:p-32 text-center shadow-[0_60px_100px_-30px_rgba(10,77,104,0.4)]"
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>

                    <div className="relative z-10 space-y-12 max-w-4xl mx-auto">
                        <motion.div
                            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 mb-8 mx-auto shadow-2xl"
                        >
                            <Sparkles size={48} className="text-secondary drop-shadow-[0_0_15px_var(--secondary)]" />
                        </motion.div>

                        <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter leading-[0.85]">
                            {t.rich('headline', {
                                span: (chunks) => <span className="text-secondary italic">{chunks}</span>
                            })}
                        </h2>

                        <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed opacity-80">
                            {t('description')}
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center items-center gap-10 pt-10">
                            <Link href="/contact" className="px-12 py-7 bg-secondary text-white font-black uppercase text-xs tracking-[0.3em] rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(58,183,149,0.5)] hover:shadow-secondary/80 hover:-translate-y-2 hover:scale-[1.05] transition-all duration-500 group flex items-center justify-center">
                                {t('cta_request')}
                                <ArrowRight className="ml-4 group-hover:translate-x-2 transition-transform" size={18} />
                            </Link>
                            <Link href="/services" className="px-12 py-7 bg-white/5 text-white font-black uppercase text-xs tracking-[0.3em] rounded-[2rem] border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 shadow-2xl min-w-[280px]">
                                {t('cta_discover')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
