'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Building2, Wind, Factory, Stethoscope, Briefcase, ArrowRight } from 'lucide-react';

export default function ServicesOverview() {
    const t = useTranslations('Services');
    const services = ['office', 'building', 'glass', 'industrial', 'medical'] as const;

    const icons = {
        office: Briefcase,
        building: Building2,
        glass: Wind,
        industrial: Factory,
        medical: Stethoscope
    };

    return (
        <section className="py-24 md:py-32 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="max-w-2xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 font-black text-[10px] tracking-widest uppercase shadow-sm"
                        >
                            <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                            <span>{t('subtitle')}</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-[1] max-w-xl"
                        >
                            {t('main_title')}
                        </motion.h2>
                    </div>
                    <Link href="/services" className="px-10 py-5 bg-white border-2 border-primary text-primary font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center group shadow-xl hover:shadow-primary/20">
                        {t('view_more')}
                        <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {services.map((key, index) => {
                        const Icon = icons[key];
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                className="group relative h-[450px] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 hover:scale-[1.03] hover:shadow-primary/25 border-4 border-gray-50"
                            >
                                {/* Background Image with animated overlay */}
                                <Image
                                    src={`/images/${key}.png`}
                                    alt={t(`items.${key}.title`)}
                                    fill
                                    className="object-cover transition-all duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-90 contrast-[1.1]"
                                />

                                {/* Animated Background Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent transition-all duration-700"></div>

                                <div className="absolute inset-0 p-12 flex flex-col justify-end text-white z-20 space-y-6">
                                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:border-secondary transition-all duration-500 shadow-2xl group-hover:rotate-[360deg] group-hover:scale-110">
                                        <Icon size={36} className="text-white fill-current/10" strokeWidth={1.5} />
                                    </div>

                                    <h3 className="text-3xl font-black tracking-tight leading-none group-hover:text-secondary transition-colors duration-500">
                                        {t(`items.${key}.title`)}
                                    </h3>

                                    <p className="text-gray-300 font-bold text-base leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden line-clamp-3">
                                        {t(`items.${key}.description`)}
                                    </p>

                                    <Link href="/services" className="inline-flex items-center text-secondary font-black text-[10px] uppercase tracking-[0.3em] mt-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:tracking-[0.4em]">
                                        {t('learn_more')} <ArrowRight size={14} className="ml-3" />
                                    </Link>
                                </div>

                                {/* Number Indicator */}
                                <div className="absolute top-8 right-8 text-white/5 text-[12rem] font-black leading-none pointer-events-none group-hover:text-secondary/10 transition-colors duration-700">
                                    {index + 1}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
