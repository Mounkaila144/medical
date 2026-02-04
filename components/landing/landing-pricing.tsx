import { Check, Star, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LandingPricing() {
    const plans = [
        {
            name: "Starter",
            description: "Parfait pour les praticiens individuels",
            price: "30 000",
            period: "mois",
            currency: "FCFA",
            icon: <Zap className="h-6 w-6" />,
            gradient: "from-brand-green to-brand-teal",
            bgGradient: "from-brand-green/5 to-brand-teal/5",
            popular: false,
            features: [
                "Jusqu'à 100 patients",
                "Fiches patients complètes (ajout, modification, historique)",
                "Gestion des rendez-vous avec calendrier simple",
                "Enregistrement des consultations",
                "Création de factures pour les consultations",
                "Historique des consultations par patient",
                "Recherche et filtrage des patients (nom, âge, genre)",
                "Filtrage des patients par date de création ou de consultation",
                "1 praticien / 1 utilisateur",
                "Suivi des revenus de base",
                "Facturation simple",
                "Support email"
            ]
        },
        {
            name: "Professional",
            description: "Idéal pour les cabinets en croissance",
            price: "70 000",
            period: "mois",
            currency: "FCFA",
            icon: <Star className="h-6 w-6" />,
            gradient: "from-brand-blue to-brand-cyan",
            bgGradient: "from-primary/5 to-brand-cyan/5",
            popular: true,
            features: [
                "Patients illimités",
                "Toutes les fonctionnalités du plan Starter",
                "Gestion des praticiens (médecins, infirmiers, etc.)",
                "Chaque praticien dispose de son propre compte",
                "Jusqu'à 5 utilisateurs / praticiens",
                "Gestion avancée des consultations par praticien",
                "Prescriptions et ordonnances",
                "Enregistrement et consultation des résultats de laboratoire et analyses",
                "Gestion avancée des rendez-vous",
                "Calendrier clair et partagé pour tous les praticiens",
                "Gestion de la file d'attente avec système de tickets",
                "Affichage des tickets et des numéros appelés sur écran",
                "Gestion de l'imprimante de tickets pour les patients",
                "Gestion complète de la comptabilité (revenus et dépenses)",
                "Enregistrement des salaires du personnel",
                "Gestion des achats de médicaments, sérums et consommables",
                "Prix d'achat et prix de vente patient pour chaque produit",
                "Dashboard financier : revenus, dépenses et statistiques clés",
                "Site web personnalisé pour la clinique (logo, couleurs et pages de base)",
                "Analyses et rapports d'activité",
                "Intégrations tierces essentielles",
                "Support prioritaire"
            ]
        },
        {
            name: "Enterprise",
            description: "Pour les grandes structures médicales",
            price: "200 000",
            period: "mois",
            currency: "FCFA",
            icon: <Crown className="h-6 w-6" />,
            gradient: "from-brand-teal to-brand-blue",
            bgGradient: "from-brand-teal/5 to-primary/5",
            popular: false,
            features: [
                "Tout du plan Professional",
                "Utilisateurs et praticiens illimités",
                "Gestion multi-services ou multi-départements",
                "File d'attente multi-postes / multi-guichets",
                "API complète pour intégration avec d'autres systèmes",
                "Intégrations avancées (laboratoires, pharmacies, etc.)",
                "Personnalisation avancée du site de la clinique",
                "Nom de domaine personnalisé pour la clinique",
                "Pages supplémentaires (services, équipe, blog, etc.)",
                "Tableaux de bord financiers avancés",
                "Rapports détaillés par praticien / service",
                "Conformité renforcée et meilleures pratiques de sécurité",
                "Formation dédiée à l'équipe",
                "Support 24/7",
                "Gestionnaire de compte dédié"
            ]
        }
    ];


  return (
    <section id="pricing" className="relative py-20 md:py-32 bg-gradient-to-br from-slate-50 to-primary/5 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-brand-blue/10 to-brand-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-brand-teal/10 to-brand-green/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-sm mb-6">
            <Shield className="h-4 w-4 text-brand-blue" />
            <span className="text-sm font-medium text-brand-blue">Tarification Transparente</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choisissez le Plan
            <span className="bg-gradient-to-r from-brand-blue to-brand-cyan bg-clip-text text-transparent"> Parfait pour Vous</span>
          </h2>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Des tarifs adaptés à chaque taille de cabinet. Commencez gratuitement, évoluez selon vos besoins.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border ${
                plan.popular
                  ? 'border-primary/20 ring-2 ring-primary/20 scale-105'
                  : 'border-border hover:border-border/80'
              } hover:-translate-y-2`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-brand-blue to-brand-cyan text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Le plus populaire
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {plan.icon}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">{plan.price}</span>
                  <div className="flex flex-col items-start">
                    <span className="text-lg font-semibold text-foreground/80">{plan.currency}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Facturation mensuelle</p>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-brand-green flex-shrink-0" />
                    <span className="text-foreground/80">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                asChild
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-brand-blue/90 hover:to-brand-cyan/90 text-white'
                    : 'bg-muted hover:bg-muted/80 text-foreground'
                } transition-all duration-300 group-hover:shadow-lg`}
                size="lg"
              >
                <a href={`https://wa.me/22770212112?text=Bonjour,%20je%20souhaite%20souscrire%20au%20plan%20${plan.name}%20de%20Clinoo+`} target="_blank" rel="noopener noreferrer">
                  {plan.popular ? 'Commencer maintenant' : 'Choisir ce plan'}
                </a>
              </Button>

              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${plan.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Besoin d&apos;une solution sur mesure ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Contactez notre équipe pour discuter de vos besoins spécifiques et obtenir un devis personnalisé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                className="bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-brand-blue/90 hover:to-brand-cyan/90 text-white"
              >
                <a href="https://wa.me/22770212112?text=Bonjour,%20je%20souhaite%20obtenir%20un%20devis%20pour%20Clinoo+" target="_blank" rel="noopener noreferrer">
                  Demander un devis
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-border hover:border-primary/30 hover:text-primary"
              >
                <a href="https://wa.me/22770212112?text=Bonjour,%20je%20souhaite%20planifier%20une%20démo%20de%20Clinoo+" target="_blank" rel="noopener noreferrer">
                  Planifier une démo
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-brand-green" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Essai gratuit 5 jours</h4>
            <p className="text-muted-foreground text-sm">Testez toutes les fonctionnalités sans engagement</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-brand-blue" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Sécurité garantie</h4>
            <p className="text-muted-foreground text-sm">Conformité RGPD et chiffrement de bout en bout</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-brand-teal" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Support expert</h4>
            <p className="text-muted-foreground text-sm">Équipe dédiée aux professionnels de santé</p>
          </div>
        </div>
      </div>
    </section>
  );
}
