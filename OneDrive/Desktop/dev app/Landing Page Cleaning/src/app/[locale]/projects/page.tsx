import { getTranslations, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import Image from 'next/image';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('ProjectsDetail');

    const projectKeys = ['office', 'glass', 'industrial', 'medical'] as const;
    const projectData = {
        office: { color: 'bg-primary', image: '/images/office.png' },
        glass: { color: 'bg-secondary', image: '/images/glass.png' },
        industrial: { color: 'bg-accent', image: '/images/industrial.png' },
        medical: { color: 'bg-primary', image: '/images/medical.png' }
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Header Section */}
            <section className="pt-48 pb-32 bg-primary relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-secondary/20 opacity-40"></div>
                <div className="absolute top-0 right-0 w-full h-full bg-secondary/5 skew-x-12 transform origin-top-right"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-10">
                    <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-black text-[10px] tracking-[0.4em] uppercase shadow-2xl">
                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        <span>{t('badge')}</span>
                    </div>
                    <h1 className="text-6xl md:text-[8rem] font-black text-white tracking-tighter leading-[0.85] uppercase">
                        {t.rich('title', {
                            span: (chunks) => <span className="text-secondary italic">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed opacity-70">
                        {t('description')}
                    </p>
                </div>
            </section>

            {/* Projects Grid */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                        {projectKeys.map((key, idx) => (
                            <div key={key} className="group flex flex-col gap-12 relative">
                                {/* Image/Visual Part */}
                                <div className="relative rounded-[4rem] overflow-hidden h-[600px] border-[10px] border-white ring-1 ring-gray-100 shadow-[0_50px_100px_-30px_rgba(10,77,104,0.2)] hover:shadow-secondary/30 transition-all duration-700 hover:-translate-y-4">
                                    <Image
                                        src={projectData[key].image}
                                        alt={t(`items.${key}.name`)}
                                        fill
                                        className="object-cover transition-all duration-1000 group-hover:scale-110 brightness-[0.4] group-hover:brightness-[0.6] contrast-125"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-80"></div>

                                    {/* Content on Image */}
                                    <div className="absolute inset-0 p-16 flex flex-col justify-end text-white z-20 space-y-8">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 group-hover:bg-secondary group-hover:border-secondary transition-all shadow-2xl">
                                                <ExternalLink size={24} />
                                            </div>
                                            <div>
                                                <p className="text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-1">{t('project_type')}</p>
                                                <p className="text-lg font-black tracking-tight">{t(`items.${key}.name`).split(' ')[0]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-12 right-12 text-white/10 text-[10rem] font-black leading-none pointer-events-none group-hover:text-secondary/10 transition-colors duration-700">
                                        {idx + 1}
                                    </div>
                                </div>

                                {/* Text/Content Part */}
                                <div className="space-y-8 px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 text-secondary font-black text-[10px] uppercase tracking-[0.3em] bg-gray-50 px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
                                            <MapPin size={16} />
                                            <span>{t(`items.${key}.name`).split(' ').pop()}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-100"></div>
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-200"></div>
                                        </div>
                                    </div>

                                    <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter hover:text-secondary transition-colors duration-500 leading-none">
                                        {t(`items.${key}.name`)}
                                    </h2>
                                    <p className="text-gray-500 font-bold text-xl leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {t(`items.${key}.description`)}
                                    </p>

                                    <div className="pt-4 flex flex-wrap gap-4">
                                        {['certified', 'punctual', 'discreet'].map(labelKey => (
                                            <div key={labelKey} className="flex items-center space-x-3 text-[11px] font-black uppercase text-primary/60 tracking-[0.2em] border border-gray-100 px-6 py-3 rounded-2xl bg-white shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all">
                                                <CheckCircle2 size={16} className="text-secondary" />
                                                <span>{t(`labels.${labelKey}`)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
