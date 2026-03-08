'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
    const t = useTranslations('Footer');
    const nav = useTranslations('Navigation');

    const links = [
        { href: '/', label: nav('home') },
        { href: '/services', label: nav('services') },
        { href: '/projects', label: nav('projects') },
        { href: '/contact', label: nav('contact') },
    ];

    const cities = ['Berlin', 'Hamburg', 'Frankfurt', 'München', 'Köln', t('nationwide')];

    return (
        <footer className="bg-primary text-white pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Company Info */}
                <div className="space-y-8">
                    <Link href="/" className="text-3xl font-black tracking-tighter">
                        CLEAN <span className="text-secondary">UP</span>
                    </Link>
                    <p className="text-gray-400 text-base leading-relaxed max-w-xs font-medium">
                        {t('description')}
                    </p>
                    <div className="flex space-x-4">
                        {[Instagram, Facebook, Linkedin].map((Icon, idx) => (
                            <a key={idx} href="#" className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl hover:bg-secondary hover:text-white transition-all duration-300 border border-white/10">
                                <Icon size={18} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-xl font-bold mb-8 text-white relative inline-block">
                        {t('quick_links')}
                        <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
                    </h4>
                    <ul className="space-y-4 font-bold text-gray-400">
                        {links.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className="hover:text-secondary transition-all flex items-center group">
                                    <span className="w-0 h-0.5 bg-secondary mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Service Areas */}
                <div>
                    <h4 className="text-xl font-bold mb-8 text-white relative inline-block">
                        {t('service_areas')}
                        <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-bold text-gray-400">
                        {cities.map((city) => (
                            <span key={city} className="hover:text-white transition-colors cursor-default">{city}</span>
                        ))}
                    </div>
                </div>

                {/* Contact infoHeader */}
                <div>
                    <h4 className="text-xl font-bold mb-8 text-white relative inline-block">
                        {t('contact_title')}
                        <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-secondary rounded-full"></span>
                    </h4>
                    <ul className="space-y-6 text-[15px] font-bold text-gray-400">
                        <li className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary">
                                <Mail size={18} />
                            </div>
                            <a href="mailto:info@cleanup.de" className="hover:text-white transition-colors">info@cleanup.de</a>
                        </li>
                        <li className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary">
                                <Phone size={18} />
                            </div>
                            <a href="tel:+491234567890" className="hover:text-white transition-colors">+49 123 4567890</a>
                        </li>
                        <li className="flex items-start space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-secondary shrink-0">
                                <MapPin size={18} />
                            </div>
                            <span className="pt-2">{t('nationwide_detail')}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-gray-500 text-sm font-bold tracking-tight">
                    {t('copyright')}
                </p>
                <div className="flex space-x-8 text-xs font-black uppercase text-gray-500 tracking-widest">
                    <a href="#" className="hover:text-secondary transition-colors">{t('imprint')}</a>
                    <a href="#" className="hover:text-secondary transition-colors">{t('privacy')}</a>
                    <a href="#" className="hover:text-secondary transition-colors">{t('terms')}</a>
                </div>
            </div>
        </footer>
    );
}
