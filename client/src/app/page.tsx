'use client';

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Demo } from '@/components/landing/Demo';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { FAQ } from '@/components/landing/FAQ';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
            <Header />
            <main className="flex-1">
                <Hero />
                <Features />
                <Demo />
                <CTA />
                <Testimonials />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
}
