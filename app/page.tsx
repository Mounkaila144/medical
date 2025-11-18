import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import LandingHero from '@/components/landing/landing-hero';
import { LandingFeatures } from '@/components/landing/landing-features';
import { LandingTestimonials } from '@/components/landing/landing-testimonials';
import { LandingPricing } from '@/components/landing/landing-pricing';
import { LandingContact } from '@/components/landing/landing-contact';
import { LandingCTA } from '@/components/landing/landing-cta';

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-full">
          <Link href="/" className="flex items-center gap-1.5 md:gap-2 group shrink-0">
            <div className="p-1.5 md:p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
              <Stethoscope className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent whitespace-nowrap">
              MedClinic test2
            </span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Fonctionnalités
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Témoignages
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Tarifs
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Contact
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all text-sm md:text-base px-3 md:px-4">
                <Link href="/auth/login">Se Connecter</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col w-full overflow-x-hidden">
      <LandingHero />
        <div id="features">
      <LandingFeatures />
        </div>
        <div id="testimonials">
      <LandingTestimonials />
        </div>
        <div id="pricing">
          <LandingPricing />
        </div>
        <div id="contact">
          <LandingContact />
        </div>
      <LandingCTA />
    </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white w-full overflow-x-hidden">
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-16 max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">MedClinic</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                La solution complète pour la gestion de votre cabinet médical.
                Moderne, sécurisée et intuitive.
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4">
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="#" className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shrink-0">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-base md:text-lg font-semibold">Produit</h3>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-base md:text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm md:text-base">
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Communauté</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-3 md:space-y-4">
              <h3 className="text-base md:text-lg font-semibold">Contact</h3>
              <div className="space-y-3 text-gray-400 text-sm md:text-base">
                <div className="flex items-center gap-2 md:gap-3">
                  <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="break-all">mail@ptrniger.com</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="whitespace-nowrap">+227 97 97 71 99</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <MapPin className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Niamey, Niger</span>
                </div>
              </div>
              <div className="pt-2 md:pt-4">
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-sm md:text-base">
                  <a href="https://wa.me/22797977199?text=Bonjour,%20je%20souhaite%20vous%20contacter%20pour%20MedClinic" target="_blank" rel="noopener noreferrer">
                    Nous Contacter
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
                © 2024 MedClinic. Tous droits réservés. Système de gestion médicale professionnel.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Politique de confidentialité</a>
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Conditions d'utilisation</a>
                <a href="#" className="hover:text-white transition-colors whitespace-nowrap">Mentions légales</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}