import { getTranslations, setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight } from 'lucide-react';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('Contact');

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

            {/* Main Content */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-32 items-start">

                    {/* Left side: Info */}
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tighter leading-none">{t('next_step_title')}</h2>
                            <p className="text-gray-500 font-bold text-xl leading-relaxed opacity-80">
                                {t('next_step_text')}
                            </p>
                        </div>

                        <div className="space-y-12">
                            <div className="flex items-center space-x-8 group">
                                <div className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary border border-secondary/20 shadow-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-secondary/10">
                                    <Phone size={36} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-2">{t('info.phone')}</p>
                                    <p className="text-3xl font-black text-primary hover:text-secondary transition-colors cursor-pointer">+49 123 4567890</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 group">
                                <div className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary border border-secondary/20 shadow-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-secondary/10">
                                    <Mail size={36} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-2">{t('info.email')}</p>
                                    <p className="text-3xl font-black text-primary hover:text-secondary transition-colors cursor-pointer">info@cleanup.de</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8 group">
                                <div className="w-24 h-24 bg-secondary/10 rounded-3xl flex items-center justify-center text-secondary border border-secondary/20 shadow-2xl group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all duration-500 shadow-secondary/10">
                                    <MapPin size={36} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <p className="text-secondary font-black text-[10px] tracking-[0.3em] uppercase mb-2">{t('info.location')}</p>
                                    <p className="text-3xl font-black text-primary">{t('info.location_detail')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Simple Map Visualization */}
                        <div className="relative rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(10,77,104,0.15)] h-[450px] border-[10px] border-white ring-1 ring-gray-100 bg-gray-50 flex items-center justify-center group">
                            <div className="absolute inset-0 bg-primary/5 group-hover:bg-secondary/5 transition-colors duration-700"></div>
                            <div className="relative text-center space-y-6 z-10 px-12">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl mx-auto group-hover:scale-110 group-hover:text-secondary transition-all">
                                    <MapPin size={32} />
                                </div>
                                <p className="text-primary font-black uppercase text-xs tracking-[0.4em] leading-relaxed">
                                    {t('info.maps')}
                                </p>
                                <div className="h-1 bg-secondary/20 mx-auto rounded-full w-20 group-hover:w-32 transition-all duration-700"></div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Form */}
                    <div className="bg-light-gray p-16 md:p-24 rounded-[5rem] shadow-[0_60px_100px_-30px_rgba(10,77,104,0.08)] border border-gray-100 relative overflow-hidden h-fit">
                        {/* Form background accent */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 -z-10"></div>

                        <div className="space-y-12 relative z-10">
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-primary tracking-tighter">{t('form.title')}</h3>
                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-secondary tracking-[0.3em]">
                                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                                    <span>{t('form.badge')}</span>
                                </div>
                            </div>

                            <form className="space-y-10">
                                <div className="space-y-8">
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] ml-4 group-focus-within:text-secondary transition-colors">{t('form.labels.name')}</label>
                                        <input type="text" className="w-full bg-white border-2 border-gray-50 rounded-[2rem] px-10 py-7 text-primary text-xl font-bold focus:border-secondary transition-all shadow-sm outline-none placeholder:text-gray-200" placeholder={t('form.placeholders.name')} />
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] ml-4 group-focus-within:text-secondary transition-colors">{t('form.labels.email')}</label>
                                        <input type="email" className="w-full bg-white border-2 border-gray-50 rounded-[2rem] px-10 py-7 text-primary text-xl font-bold focus:border-secondary transition-all shadow-sm outline-none placeholder:text-gray-200" placeholder={t('form.placeholders.email')} />
                                    </div>
                                    <div className="space-y-4 group">
                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] ml-4 group-focus-within:text-secondary transition-colors">{t('form.labels.message')}</label>
                                        <textarea rows={6} className="w-full bg-white border-2 border-gray-50 rounded-[2.5rem] px-10 py-7 text-primary text-xl font-bold focus:border-secondary transition-all shadow-sm outline-none placeholder:text-gray-200 resize-none" placeholder={t('form.placeholders.message')}></textarea>
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-9 bg-secondary text-white font-black uppercase text-xs tracking-[0.4em] rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(58,183,149,0.5)] hover:shadow-secondary/80 hover:-translate-y-2 hover:scale-[1.03] transition-all duration-500 group flex items-center justify-center">
                                    {t('form.button')}
                                    <Send className="ml-5 group-hover:translate-x-3 group-hover:-translate-y-1 transition-all duration-500" size={20} strokeWidth={2.5} />
                                </button>
                            </form>

                            <p className="text-center text-[10px] font-bold text-gray-400 leading-relaxed max-w-xs mx-auto">
                                {t('form.privacy')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
