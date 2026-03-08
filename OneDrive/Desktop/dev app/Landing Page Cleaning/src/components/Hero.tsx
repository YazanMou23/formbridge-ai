'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowRight, CheckCircle } from 'lucide-react';

export default function Hero() {
    const t = useTranslations('Hero');

    return (
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden bg-primary">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary/10 to-transparent skew-x-12 transform origin-top-right"></div>
            <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
            <div className="absolute top-20 right-20 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-10 lg:col-span-7 lg:pr-10"
                >
                    <div className="inline-flex items-center space-x-3 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-black text-[10px] tracking-widest uppercase shadow-xl shadow-black/20">
                        <span className="w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_var(--secondary)]"></span>
                        <span>{t('badge')}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-[3.8rem] font-black text-white leading-[1.1] md:leading-[1] lg:leading-[1.05] tracking-tighter break-words max-w-3xl">
                        {t.rich('headline', {
                            span: (chunks) => (
                                <span className="text-secondary italic font-black relative inline-block">
                                    {chunks}
                                    <motion.span
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        className="absolute -bottom-2 left-0 h-2 bg-secondary/30 -z-10"
                                    ></motion.span>
                                </span>
                            )
                        })}
                    </h1>

                    <p className="text-xl text-gray-400 font-bold leading-relaxed max-w-xl">
                        {t('subheadline')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 pt-4">
                        <Link href="/contact" className="px-10 py-5 bg-secondary text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(58,183,149,0.4)] hover:shadow-secondary/50 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group">
                            {t('cta_request')}
                            <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={16} />
                        </Link>
                        <Link href="/services" className="px-10 py-5 bg-white/5 text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] hover:bg-white/10 transition-all border border-white/10 backdrop-blur-md flex items-center justify-center shadow-2xl">
                            {t('cta_services')}
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 pt-6">
                        <div className="flex items-center space-x-3 text-white/60 font-black text-[10px] uppercase tracking-widest border-r border-white/10 pr-8">
                            <CheckCircle size={16} className="text-secondary" />
                            <span>{t('features.nationwide')}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white/60 font-black text-[10px] uppercase tracking-widest border-r border-white/10 pr-8">
                            <CheckCircle size={16} className="text-secondary" />
                            <span>{t('features.pros')}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-white/60 font-black text-[10px] uppercase tracking-widest">
                            <CheckCircle size={16} className="text-secondary" />
                            <span>{t('features.eco')}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="relative lg:col-span-5"
                >
                    <div className="relative z-10 rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-8 border-white/5">
                        <Image
                            src="/images/hero.png"
                            alt="Professional Cleaning Team"
                            width={1000}
                            height={1200}
                            className="object-cover hover:scale-105 transition-all duration-1000 h-[700px] brightness-90 contrast-110"
                            priority
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent"></div>
                    </div>

                    {/* Floating Feature Card */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] z-20 border border-gray-100 hidden md:block"
                    >
                        <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 bg-secondary/10 flex items-center justify-center text-secondary rounded-2xl">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <p className="text-4xl font-black text-primary leading-none">100%</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{t('guarantee')}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="absolute top-1/2 -right-10 w-20 h-20 bg-accent rounded-full -z-10 animate-ping opacity-20"></div>
                </motion.div>
            </div>
        </section>
    );
}
