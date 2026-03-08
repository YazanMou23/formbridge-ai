'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Shield, Map, Users, Leaf } from 'lucide-react';

export default function WhyChooseUs() {
    const t = useTranslations('WhyChooseUs');

    const icons = {
        reliable: Shield,
        nationwide: Map,
        professional: Users,
        eco: Leaf
    };

    const cards = ['reliable', 'nationwide', 'professional', 'eco'] as const;

    return (
        <section className="py-32 bg-light-gray relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-accent/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>

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
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: 100 }}
                        viewport={{ once: true }}
                        className="h-2 bg-secondary mx-auto rounded-full mt-4"
                    ></motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {cards.map((key, index) => {
                        const Icon = icons[key];
                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.8 }}
                                whileHover={{ y: -15, scale: 1.02 }}
                                className="bg-white p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-gray-100 hover:border-secondary/30 transition-all duration-500 group relative overflow-hidden"
                            >
                                {/* Hover Background Accent */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full group-hover:scale-[3] transition-all duration-700"></div>

                                <div className="relative z-10">
                                    <div className="w-20 h-20 bg-accent/30 rounded-[1.5rem] flex items-center justify-center text-primary mb-10 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-inner group-hover:shadow-[0_15px_30px_-5px_var(--secondary)]">
                                        <Icon size={40} className="stroke-[1.5]" />
                                    </div>
                                    <h3 className="text-2xl font-black text-primary mb-6 leading-tight group-hover:text-primary transition-colors">
                                        {t(`cards.${key}.title`)}
                                    </h3>
                                    <p className="text-gray-500 font-bold text-base leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {t(`cards.${key}.description`)}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
