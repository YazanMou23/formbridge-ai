'use client';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ExternalLink, MapPin, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function ProjectsPreview() {
    const t = useTranslations('Projects');
    const projects = [
        { key: 'berlin', location: 'Berlin', type: 'Offices', color: 'bg-primary', image: '/images/office.png' },
        { key: 'frankfurt', location: 'Frankfurt', type: 'Glass Facade', color: 'bg-secondary', image: '/images/glass.png' },
        { key: 'hamburg', location: 'Hamburg', type: 'Warehouse', color: 'bg-accent', image: '/images/building.png' },
    ];

    return (
        <section className="py-32 bg-primary relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-20"></div>
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
                    <div className="max-w-2xl space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center space-x-3 px-5 py-2 rounded-full bg-white/5 text-secondary border border-white/10 font-black text-[10px] tracking-widest uppercase shadow-2xl shadow-black/40"
                        >
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                            <span>{t('subtitle')}</span>
                        </motion.div>
                        <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-[1]">{t('title')}</h2>
                    </div>
                    <Link href="/projects" className="px-10 py-5 bg-secondary text-white font-black uppercase text-xs tracking-[0.2em] rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(58,183,149,0.3)] hover:shadow-secondary/50 hover:-translate-y-1 transition-all duration-300 flex items-center group">
                        {t('all_projects')}
                        <ArrowRight className="ml-3 group-hover:translate-x-1.5 transition-transform" size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.8 }}
                            className="group relative overflow-hidden rounded-[3.5rem] h-[550px] border-8 border-white/5 shadow-2xl"
                        >
                            {/* Visual Image with fallback/overlay */}
                            <div className="absolute inset-0 bg-primary">
                                <Image
                                    src={project.image}
                                    alt={t(`items.${project.key}`)}
                                    fill
                                    className="object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.4] group-hover:brightness-[0.6] contrast-125"
                                />
                            </div>

                            {/* Gradient Overlay for Text Readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

                            {/* Content Overlay */}
                            <div className="absolute inset-0 p-12 flex flex-col justify-end text-white z-20 space-y-6">
                                <div className="flex items-center space-x-3 text-secondary font-black text-[10px] uppercase tracking-[0.3em] mb-4 bg-white/5 backdrop-blur-md w-fit px-4 py-2 rounded-xl border border-white/10">
                                    <MapPin size={14} />
                                    <span>{project.location}</span>
                                </div>

                                <h3 className="text-3xl font-black mb-2 group-hover:text-secondary transition-colors duration-500 leading-tight">
                                    {t(`items.${project.key}`)}
                                </h3>

                                <div className="flex items-center justify-between">
                                    <p className="text-gray-300 font-bold text-sm uppercase tracking-widest">{project.type}</p>
                                    <Link
                                        href="/projects"
                                        className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-secondary hover:border-secondary transition-all shadow-2xl group/btn"
                                    >
                                        <ExternalLink size={24} className="group-hover/btn:scale-110 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                            {/* Progress bar effect on hover */}
                            <div className="absolute bottom-0 left-0 h-2 bg-secondary w-0 group-hover:w-full transition-all duration-700 delay-100"></div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
