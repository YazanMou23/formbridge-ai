'use client';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';

export default function Navbar() {
    const t = useTranslations('Navigation');
    const pathname = usePathname();
    const locale = useLocale();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/services', label: t('services') },
        { href: '/projects', label: t('projects') },
        { href: '/contact', label: t('contact') },
    ];


    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2 group">
                    <span className={`text-2xl font-black tracking-tighter transition-colors duration-300 ${isScrolled ? 'text-primary' : 'text-white'}`}>
                        CLEAN <span className="text-secondary group-hover:text-white transition-colors">UP</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-[15px] font-bold uppercase tracking-wider transition-all duration-300 hover:text-secondary relative group ${isScrolled ? 'text-foreground' : 'text-white/90'}`}
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    ))}

                    <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/20 shadow-xl">
                        <Globe size={14} className={isScrolled ? 'text-primary' : 'text-white'} />
                        <div className="flex items-center space-x-3">
                            <Link href={pathname} locale="de" className={`text-xs font-black transition-all ${locale === 'de' ? 'text-secondary bg-secondary/10 px-2 py-1 rounded-md' : 'text-gray-400 hover:text-white'}`}>DE</Link>
                            <span className="text-white/20 text-xs">|</span>
                            <Link href={pathname} locale="en" className={`text-xs font-black transition-all ${locale === 'en' ? 'text-secondary bg-secondary/10 px-2 py-1 rounded-md' : 'text-gray-400 hover:text-white'}`}>EN</Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'text-primary hover:bg-gray-100' : 'text-primary hover:bg-white/20'}`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl animate-in slide-in-from-top-5 duration-300">
                    <div className="flex flex-col space-y-1 p-4 bg-white">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="font-bold text-lg py-3 px-4 rounded-xl hover:bg-secondary/5 hover:text-secondary transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 px-4">
                            <span className="text-sm font-semibold text-gray-500">Language</span>
                            <div className="flex space-x-4">
                                <Link href={pathname} locale="de" className={`font-black uppercase ${locale === 'de' ? 'text-secondary underline decoration-2 underline-offset-4' : 'text-gray-400'}`}>DE</Link>
                                <Link href={pathname} locale="en" className={`font-black uppercase ${locale === 'en' ? 'text-secondary underline decoration-2 underline-offset-4' : 'text-gray-400'}`}>EN</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
