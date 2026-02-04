import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Stethoscope, ArrowRight, Shield, Users, Clock } from "lucide-react";
import Image from "next/image";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-primary/5 to-brand-cyan/10">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-brand-blue/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-brand-teal/15 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-brand-cyan/20 rounded-full blur-xl animate-pulse delay-500" />

      <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32 max-w-full">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-sm">
              <Stethoscope className="h-4 w-4 text-brand-blue" />
              <span className="text-sm font-medium text-brand-blue">Solution Médicale Innovante</span>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                <span className="text-foreground">Révolutionnez</span>
                <br />
                <span className="bg-gradient-to-r from-brand-blue via-brand-teal to-brand-cyan bg-clip-text text-transparent">
                  Votre Cabinet Médical
                </span>
              </h1>

              <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Clinoo+ transforme la gestion de votre cabinet avec une plateforme intelligente,
                sécurisée et intuitive. Optimisez vos consultations, simplifiez vos processus.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-green shrink-0" />
                <span className="whitespace-nowrap">Conforme RGPD</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-blue shrink-0" />
                <span className="whitespace-nowrap">+1000 Praticiens</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-brand-teal shrink-0" />
                <span className="whitespace-nowrap">Support 24/7</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-brand-blue/90 hover:to-brand-cyan/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <a href="https://wa.me/22770212112?text=Bonjour,%20je%20souhaite%20démarrer%20gratuitement%20avec%20Clinoo+" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  Démarrer Gratuitement
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
              >
                <Link href="/auth/login">Se Connecter</Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-6 md:pt-8 border-t border-border">
              <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">Ils nous font confiance :</p>
              <div className="flex flex-wrap items-center gap-4 md:gap-8 opacity-60">
                <div className="text-sm md:text-lg font-semibold text-muted-foreground whitespace-nowrap">Clinique Santé+</div>
                <div className="text-sm md:text-lg font-semibold text-muted-foreground whitespace-nowrap">Centre Médical Pro</div>
                <div className="text-sm md:text-lg font-semibold text-muted-foreground whitespace-nowrap">Cabinet Moderne</div>
              </div>
            </div>
          </div>

          {/* Right Content - Medical Doctor Image */}
          <div className="relative lg:pl-8 px-4 md:px-0">
            <div className="relative max-w-full">
              {/* Main Image Container */}
              <div className="relative">
                {/* Doctor Image */}
                <div className="relative bg-gradient-to-br from-white to-primary/5 rounded-3xl p-8 shadow-2xl border border-primary/10 overflow-hidden">
                  <Image
                    src="/images/applicationmedical.png"
                    alt="Femme médecin tenant un ordinateur portable - Application médicale Clinoo+"
                    width={600}
                    height={700}
                    className="w-full h-auto object-cover rounded-2xl"
                    priority
                  />

                  {/* Overlay gradient for better integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-2xl"></div>
                </div>
              </div>

              {/* Floating Stats Cards - Hidden on mobile to prevent overflow */}
              <div className="hidden md:block absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-primary/10 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-green rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-foreground/80">Système Actif</span>
                </div>
              </div>

              <div className="hidden lg:block absolute top-1/2 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-brand-green/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-green">1000+</div>
                  <div className="text-xs text-muted-foreground">Praticiens</div>
                </div>
              </div>

              <div className="hidden md:block absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-brand-teal/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-teal">98%</div>
                  <div className="text-xs text-muted-foreground">Satisfaction</div>
                </div>
              </div>

              <div className="hidden md:block absolute bottom-1/3 -right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-primary/10">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-brand-blue" />
                  <div className="text-sm">
                    <div className="font-semibold text-foreground">RGPD</div>
                    <div className="text-xs text-muted-foreground">Conforme</div>
                  </div>
                </div>
              </div>

              {/* Floating particles around the image */}
              <div className="absolute top-20 -left-4 w-2 h-2 bg-brand-blue/60 rounded-full animate-bounce"></div>
              <div className="absolute top-40 -right-2 w-3 h-3 bg-brand-teal/60 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-32 -left-2 w-2 h-2 bg-brand-cyan/60 rounded-full animate-bounce delay-700"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
