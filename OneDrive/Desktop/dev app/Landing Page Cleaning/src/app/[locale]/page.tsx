import { setRequestLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyChooseUs from '@/components/WhyChooseUs';
import ServicesOverview from '@/components/ServicesOverview';
import ProjectsPreview from '@/components/ProjectsPreview';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
    const { locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    return (
        <main className="min-h-screen relative overflow-x-hidden">
            <Navbar />
            <Hero />
            <WhyChooseUs />
            <ServicesOverview />
            <ProjectsPreview />
            <Testimonials />
            <CTA />
            <Footer />
        </main>
    );
}

export async function generateMetadata({ params }: Props) {
    const { locale } = await params;
    const title = locale === 'de' ? 'Clean Up | Professionelle Reinigung Deutschland' : 'Clean Up | Professional Cleaning Germany';
    const description = locale === 'de'
        ? 'Clean Up bietet erstklassige Büroreinigung, Gebäudereinigung und Glasreinigung in ganz Deutschland. Zuverlässig, professionell und umweltfreundlich.'
        : 'Clean Up provides top-tier office cleaning, building cleaning, and glass cleaning across Germany. Reliable, professional, and eco-friendly.';

    return {
        title,
        description,
        alternates: {
            canonical: `/${locale}`,
            languages: {
                de: '/de',
                en: '/en'
            }
        }
    };
}
