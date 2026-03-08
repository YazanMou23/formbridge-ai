import { getTranslations, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Building2, Wind, Factory, Stethoscope, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ServicesPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('ServicesDetail');
    const services = ['office', 'building', 'glass', 'industrial', 'medical'] as const;

    const icons = {
        office: Briefcase,
        building: Building2,
        glass: Wind,
        industrial: Factory,
        medical: Stethoscope
    };

    const features = [
        t('features.service_24_7'),
        t('features.team'),
        t('features.eco'),
        t('features.prices')
    ];

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            <Navbar />

            {/* Header Section */}
            <section className="pt-48 pb-32 bg-primary text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary to-secondary/10 opacity-40"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
                    <div className="inline-flex items-center space-x-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white font-black text-[10px] tracking-[0.4em] uppercase shadow-2xl">
                        <span className="w-2 h-2 bg-secondary rounded-full"></span>
                        <span>{t('badge')}</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-[6rem] font-black tracking-tighter leading-[0.9] uppercase break-words">
                        {t.rich('title', {
                            span: (chunks) => <span className="text-secondary italic">{chunks}</span>
                        })}
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-400 font-bold max-w-2xl mx-auto leading-relaxed opacity-80">
                        {t('description')}
                    </p>
                </div>
            </section>

            {/* Services List */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-48">
                    {services.map((key, idx) => {
                        const Icon = icons[key];
                        return (
                            <div key={key} className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center group relative">
                                {/* Number Indicator (absolute positioned) */}
                                <div className={`absolute -top-10 md:-top-20 ${idx % 2 === 0 ? '-left-10' : '-right-10'} text-[15rem] md:text-[20rem] font-black text-gray-50 leading-none pointer-events-none -z-10 transition-colors group-hover:text-secondary/5`}>
                                    {idx + 1}
                                </div>

                                {/* Text content - switches column based on index */}
                                <div className={`space-y-10 lg:col-span-7 ${idx % 2 !== 0 ? 'lg:order-2 lg:pl-12' : 'lg:order-1 lg:pr-12'}`}>
                                    <div className="flex items-center space-x-6 mb-8">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary border border-secondary/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                                            <Icon size={32} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <p className="text-secondary font-black text-[10px] tracking-[0.3em] uppercase truncate">{t('premium_badge')}</p>
                                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary tracking-tighter leading-[1.05] break-words">
                                                {t(`items.${key}.name`)}
                                            </h2>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-lg md:text-xl font-bold leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                        {t(`items.${key}.description`)}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {features.map(feat => (
                                            <div key={feat} className="flex items-center space-x-4 text-[11px] font-black text-primary/60 uppercase tracking-widest bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 hover:border-secondary/20 hover:bg-white transition-all shadow-sm hover:shadow-xl">
                                                <CheckCircle size={18} className="text-secondary flex-shrink-0" />
                                                <span className="truncate">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <button className="px-10 py-5 bg-primary text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 hover:-translate-y-1 flex items-center group/btn">
                                            {t('cta_button')}
                                            <ArrowRight className="ml-4 group-hover/btn:translate-x-2 transition-transform" size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Image content - switches column based on index */}
                                <div className={`lg:col-span-5 relative ${idx % 2 !== 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                                    <div className="relative z-10 rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(10,77,104,0.3)] border-[8px] md:border-[10px] border-white ring-1 ring-gray-100 h-[380px] md:h-[550px] bg-secondary/5 group-hover:shadow-secondary/30 transition-all duration-700">
                                        <Image
                                            src={`/images/${key}.png`}
                                            alt={t(`items.${key}.name`)}
                                            fill
                                            className="object-cover transition-all duration-1000 group-hover:scale-110 brightness-75 group-hover:brightness-90 contrast-[1.1]"
                                        />
                                        <div className="absolute inset-0 bg-primary/30 backdrop-blur-[1px] opacity-40"></div>

                                        <div className="absolute inset-0 flex items-center justify-center p-20 z-20">
                                            <Icon size={150} className="text-white opacity-20 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" strokeWidth={1} />
                                        </div>

                                        <div className="absolute bottom-10 left-10 right-10 p-6 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-30">
                                            <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] mb-1">{t('guarantee_title')}</p>
                                            <p className="text-gray-300 text-xs font-bold leading-tight">{t('guarantee_text')}</p>
                                        </div>
                                    </div>
                                    {/* Decoration */}
                                    <div className={`absolute ${idx % 2 === 0 ? '-top-10 -right-10' : '-bottom-10 -left-10'} w-48 h-48 bg-secondary/20 rounded-full blur-[80px] -z-10 animate-pulse`}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </main>
    );
}
