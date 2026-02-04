import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Shield,
  Database,
  UserCheck,
  Lock,
  Cookie,
  FileWarning,
  Scale,
  BookOpen,
  PenTool,
  Mail,
  Phone,
  MapPin,
  ScrollText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sections = [
  {
    id: 'introduction',
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Introduction',
    gradient: 'from-brand-blue to-brand-cyan',
    bgGradient: 'from-primary/5 to-brand-cyan/5',
    content: (
      <>
        <p>
          Les présentes conditions d&apos;utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme
          <strong> Clinoo+</strong>, éditée par <strong>PTR Niger</strong>. En accédant à notre service, vous acceptez d&apos;être lié par ces
          conditions. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
        </p>
        <p>
          Clinoo+ est une solution de gestion médicale destinée aux professionnels de santé, cliniques et
          cabinets médicaux. Elle permet la gestion des patients, des rendez-vous, des consultations, de la
          facturation et de l&apos;administration des établissements de santé.
        </p>
      </>
    ),
  },
  {
    id: 'definitions',
    icon: <ScrollText className="h-5 w-5" />,
    title: 'Définitions',
    gradient: 'from-brand-teal to-brand-cyan',
    bgGradient: 'from-brand-teal/5 to-brand-cyan/5',
    content: (
      <div className="grid gap-3">
        {[
          { term: 'Plateforme', def: 'le logiciel Clinoo+ accessible via le web et ses applications associées.' },
          { term: 'Utilisateur', def: 'toute personne physique ou morale accédant à la plateforme.' },
          { term: 'Praticien', def: 'tout professionnel de santé utilisant la plateforme dans le cadre de son activité médicale.' },
          { term: 'Patient', def: 'toute personne dont les données médicales sont enregistrées sur la plateforme.' },
          { term: 'Données personnelles', def: 'toute information se rapportant à une personne physique identifiée ou identifiable.' },
          { term: 'Données de santé', def: 'toute donnée relative à la santé physique ou mentale d\'un patient.' },
        ].map((item, i) => (
          <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/60 border border-border/50">
            <ChevronRight className="h-4 w-4 text-brand-teal mt-0.5 shrink-0" />
            <p><strong className="text-foreground">{item.term} :</strong> {item.def}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'protection',
    icon: <Shield className="h-5 w-5" />,
    title: 'Protection des données personnelles',
    gradient: 'from-brand-green to-brand-teal',
    bgGradient: 'from-brand-green/5 to-brand-teal/5',
    content: (
      <>
        <p>
          La protection des données personnelles et des données de santé est au c&oelig;ur de notre engagement.
          Clinoo+ s&apos;engage à respecter la réglementation en vigueur en matière de protection des données
          personnelles, notamment le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et les
          législations locales applicables au Niger.
        </p>
        <p>
          Le responsable du traitement des données est <strong>PTR Niger</strong>, dont le siège social est situé à Niamey, Niger.
          Pour toute question relative à la protection de vos données, vous pouvez nous contacter à
          l&apos;adresse : <a href="mailto:mail@ptrniger.com" className="text-brand-blue hover:underline font-medium">mail@ptrniger.com</a>.
        </p>
      </>
    ),
  },
  {
    id: 'collecte',
    icon: <Database className="h-5 w-5" />,
    title: 'Collecte et traitement des données',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    content: (
      <>
        <p>
          Dans le cadre de l&apos;utilisation de la plateforme, nous collectons les catégories de données suivantes :
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Identification', desc: 'Nom, prénom, adresse e-mail, numéro de téléphone, adresse postale.' },
            { label: 'Professionnelles', desc: 'Spécialité médicale, numéro d\'enregistrement, établissement de rattachement.' },
            { label: 'Santé des patients', desc: 'Antécédents médicaux, diagnostics, prescriptions, résultats d\'examens, notes SOAP.' },
            { label: 'Connexion', desc: 'Adresse IP, type de navigateur, dates et heures de connexion.' },
            { label: 'Facturation', desc: 'Informations relatives aux paiements et factures émises.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/60 border border-border/50 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-foreground text-sm mb-1">{item.label}</h4>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4">
          Ces données sont collectées aux fins suivantes : gestion des rendez-vous, suivi médical des patients,
          facturation, administration des cliniques et amélioration continue de nos services.
        </p>
      </>
    ),
  },
  {
    id: 'droits',
    icon: <UserCheck className="h-5 w-5" />,
    title: 'Droits des utilisateurs',
    gradient: 'from-brand-blue to-brand-teal',
    bgGradient: 'from-primary/5 to-brand-teal/5',
    content: (
      <>
        <p>
          Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {[
            { right: 'Droit d\'accès', desc: 'Obtenir la confirmation que vos données sont traitées et en recevoir une copie.' },
            { right: 'Droit de rectification', desc: 'Demander la correction de vos données inexactes ou incomplètes.' },
            { right: 'Droit à l\'effacement', desc: 'Demander la suppression de vos données dans les limites prévues par la loi.' },
            { right: 'Droit à la limitation', desc: 'Demander la restriction du traitement de vos données dans certains cas.' },
            { right: 'Droit à la portabilité', desc: 'Recevoir vos données dans un format structuré et couramment utilisé.' },
            { right: 'Droit d\'opposition', desc: 'Vous opposer au traitement de vos données pour des motifs légitimes.' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/60 border border-border/50 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <h4 className="font-semibold text-foreground text-sm mb-1">{item.right}</h4>
              <p className="text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 border border-brand-blue/20">
          <p className="text-sm">
            Pour exercer vos droits, contactez-nous par e-mail à{' '}
            <a href="mailto:mail@ptrniger.com" className="text-brand-blue hover:underline font-medium">mail@ptrniger.com</a>.
            Nous nous engageons à répondre dans un délai de <strong>30 jours</strong>.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'securite',
    icon: <Lock className="h-5 w-5" />,
    title: 'Sécurité des données',
    gradient: 'from-slate-500 to-gray-600',
    bgGradient: 'from-slate-50 to-gray-50',
    content: (
      <>
        <p>
          Clinoo+ met en &oelig;uvre des mesures techniques et organisationnelles appropriées pour garantir
          la sécurité et la confidentialité de vos données :
        </p>
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          {[
            { label: 'Chiffrement', desc: 'Données chiffrées en transit (HTTPS/TLS) et au repos.' },
            { label: 'Authentification', desc: 'Système sécurisé avec gestion des tokens d\'accès et de rafraîchissement.' },
            { label: 'Isolation', desc: 'Données isolées par établissement (architecture multi-tenant).' },
            { label: 'Contrôle d\'accès', desc: 'Basé sur les rôles (administrateur, personnel, praticien).' },
            { label: 'Sauvegardes', desc: 'Sauvegardes régulières et automatisées des données.' },
            { label: 'Surveillance', desc: 'Journalisation et surveillance continue des accès.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/60 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0" />
              <div>
                <span className="font-semibold text-foreground text-sm">{item.label}</span>
                <p className="text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'cookies',
    icon: <Cookie className="h-5 w-5" />,
    title: 'Cookies et stockage local',
    gradient: 'from-pink-500 to-rose-500',
    bgGradient: 'from-pink-50 to-rose-50',
    content: (
      <>
        <p>
          La plateforme utilise le <strong>stockage local du navigateur</strong> (localStorage) pour conserver vos
          informations d&apos;authentification (tokens d&apos;accès). Ces données sont strictement nécessaires
          au fonctionnement du service et ne sont pas partagées avec des tiers.
        </p>
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand-green/10 to-brand-teal/10 border border-brand-green/20">
          <p className="text-sm font-medium text-foreground">
            Aucun cookie publicitaire ou de suivi tiers n&apos;est utilisé sur la plateforme.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'obligations',
    icon: <FileWarning className="h-5 w-5" />,
    title: 'Obligations de l\'utilisateur',
    gradient: 'from-brand-cyan to-brand-blue',
    bgGradient: 'from-brand-cyan/5 to-primary/5',
    content: (
      <>
        <p>En utilisant la plateforme Clinoo+, vous vous engagez à :</p>
        <div className="grid gap-2 mt-4">
          {[
            'Fournir des informations exactes et à jour lors de votre inscription.',
            'Maintenir la confidentialité de vos identifiants de connexion.',
            'Utiliser la plateforme conformément à sa destination (gestion médicale).',
            'Respecter le secret médical et la confidentialité des données des patients.',
            'Ne pas tenter d\'accéder de manière non autorisée aux données d\'autres utilisateurs.',
            'Signaler immédiatement toute utilisation non autorisée de votre compte.',
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/60 border border-border/50">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-brand-blue to-brand-cyan text-white text-xs font-bold shrink-0">
                {i + 1}
              </span>
              <p className="text-sm pt-0.5">{item}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'responsabilite',
    icon: <Scale className="h-5 w-5" />,
    title: 'Limitation de responsabilité',
    gradient: 'from-brand-green to-brand-teal',
    bgGradient: 'from-brand-green/5 to-brand-teal/5',
    content: (
      <>
        <p>
          Clinoo+ est un <strong>outil d&apos;aide à la gestion médicale</strong> et ne se substitue en aucun cas au jugement
          professionnel du praticien. PTR Niger ne saurait être tenu responsable des décisions médicales
          prises sur la base des informations contenues dans la plateforme.
        </p>
        <p>
          PTR Niger s&apos;efforce de maintenir la plateforme accessible et fonctionnelle, mais ne garantit pas
          une disponibilité ininterrompue du service. En cas de maintenance programmée, les utilisateurs
          seront informés dans un délai raisonnable.
        </p>
      </>
    ),
  },
  {
    id: 'propriete',
    icon: <PenTool className="h-5 w-5" />,
    title: 'Propriété intellectuelle',
    gradient: 'from-brand-teal to-brand-cyan',
    bgGradient: 'from-brand-teal/5 to-brand-cyan/5',
    content: (
      <p>
        L&apos;ensemble des éléments composant la plateforme Clinoo+ (logiciel, design, marques, logos,
        textes) est la <strong>propriété exclusive de PTR Niger</strong>. Toute reproduction, représentation ou
        utilisation non autorisée de ces éléments est strictement interdite.
      </p>
    ),
  },
  {
    id: 'modifications',
    icon: <ScrollText className="h-5 w-5" />,
    title: 'Modification des conditions',
    gradient: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-50 to-red-50',
    content: (
      <p>
        PTR Niger se réserve le droit de modifier les présentes conditions d&apos;utilisation à tout moment.
        Les utilisateurs seront informés des modifications par <strong>notification sur la plateforme</strong> ou par
        e-mail. La poursuite de l&apos;utilisation du service après notification vaut acceptation des
        nouvelles conditions.
      </p>
    ),
  },
];

export default function ConditionsUtilisation() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 border-b border-border/50 shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 max-w-full">
          <Link href="/" className="flex items-center group shrink-0">
            <Image src="/images/logo.png" alt="Clinoo+" width={140} height={42} className="h-9 w-auto group-hover:scale-105 transition-transform" />
          </Link>
          <Button asChild variant="outline" size="sm" className="border-2 border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour à l&apos;accueil</span>
              <span className="sm:hidden">Accueil</span>
            </Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-primary/5 to-brand-cyan/10">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
        <div className="absolute top-10 left-10 w-32 h-32 bg-brand-blue/15 rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-20 right-20 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-brand-cyan/15 rounded-full blur-2xl animate-pulse delay-500" />

        <div className="relative container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-sm mb-6">
            <Shield className="h-4 w-4 text-brand-blue" />
            <span className="text-sm font-medium text-brand-blue">Document Juridique</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Conditions </span>
            <span className="bg-gradient-to-r from-brand-blue via-brand-teal to-brand-cyan bg-clip-text text-transparent">
              d&apos;Utilisation
            </span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-6">
            Votre confiance est notre priorité. Découvrez comment nous protégeons vos données
            et garantissons la sécurité de votre expérience sur Clinoo+.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 rounded-full border border-border/50 text-sm text-muted-foreground">
            <span>Dernière mise à jour :</span>
            <span className="font-semibold text-foreground">1er février 2025</span>
          </div>
        </div>
      </section>

      {/* Table of contents - mobile */}
      <div className="lg:hidden bg-white border-b border-border/50 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-foreground">
              <span>Sommaire ({sections.length} sections)</span>
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <nav className="mt-3 grid grid-cols-2 gap-2 pb-2">
              {sections.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand-blue transition-colors p-2 rounded-lg hover:bg-primary/5"
                >
                  <span className="text-brand-blue/60 font-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate">{section.title}</span>
                </a>
              ))}
            </nav>
          </details>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-7xl">
        <div className="flex gap-10">
          {/* Sidebar - desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Sommaire</h3>
              <nav className="space-y-1">
                {sections.map((section, i) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-brand-blue hover:bg-gradient-to-r hover:from-primary/5 hover:to-brand-cyan/5 transition-all"
                  >
                    <span className="font-mono text-xs text-brand-blue/50 group-hover:text-brand-blue transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </nav>

              {/* Contact quick card */}
              <div className="mt-8 p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-brand-cyan/5 border border-primary/10">
                <h4 className="text-sm font-semibold text-foreground mb-2">Une question ?</h4>
                <p className="text-xs text-muted-foreground mb-3">Notre équipe est à votre disposition.</p>
                <Button asChild size="sm" className="w-full bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-brand-blue/90 hover:to-brand-cyan/90 text-white shadow-md text-xs">
                  <a href="mailto:mail@ptrniger.com">Nous contacter</a>
                </Button>
              </div>
            </div>
          </aside>

          {/* Sections */}
          <div className="flex-1 max-w-4xl space-y-8">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="group relative bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-500 border border-border/50 hover:border-border/80 scroll-mt-24"
              >
                {/* Background Gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${section.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r ${section.gradient} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      {section.icon}
                    </div>
                    <div>
                      <span className="text-xs font-mono text-muted-foreground">Article {i + 1}</span>
                      <h2 className="text-lg md:text-xl font-bold text-foreground leading-tight">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-sm md:text-base text-muted-foreground leading-relaxed space-y-3 [&_strong]:text-foreground">
                    {section.content}
                  </div>
                </div>
              </section>
            ))}

            {/* Contact CTA Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-10 text-white">
              {/* Background decorations */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-cyan/15 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-5">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Nous contacter</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Des questions sur ces conditions ?
                </h2>
                <p className="text-gray-300 mb-8 max-w-lg">
                  Notre équipe est disponible pour répondre à toutes vos questions concernant ces conditions
                  d&apos;utilisation ou la protection de vos données.
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Mail className="h-5 w-5 text-brand-cyan shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">E-mail</p>
                      <a href="mailto:mail@ptrniger.com" className="text-sm font-medium hover:text-brand-cyan transition-colors">mail@ptrniger.com</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Phone className="h-5 w-5 text-brand-cyan shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Téléphone</p>
                      <p className="text-sm font-medium">+227 70 21 21 12</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                    <MapPin className="h-5 w-5 text-brand-cyan shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Adresse</p>
                      <p className="text-sm font-medium">Niamey, Niger</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button asChild className="bg-gradient-to-r from-brand-blue to-brand-cyan hover:from-brand-blue/90 hover:to-brand-cyan/90 shadow-lg hover:shadow-xl transition-all text-white">
                    <a href="https://wa.me/22770212112?text=Bonjour,%20j%27ai%20une%20question%20concernant%20les%20conditions%20d%27utilisation%20de%20Clinoo+" target="_blank" rel="noopener noreferrer">
                      Contacter via WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white">
                    <a href="mailto:mail@ptrniger.com">
                      Envoyer un e-mail
                    </a>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto border-t border-gray-800">
        <div className="container mx-auto px-4 md:px-6 py-8 max-w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Image src="/images/logo.png" alt="Clinoo+" width={100} height={30} className="h-7 w-auto brightness-0 invert" />
              <span className="text-gray-600">|</span>
              <p className="text-gray-400 text-xs md:text-sm">
                © 2024 Tous droits réservés. Fait par{' '}
                <a href="https://ptrniger.com" target="_blank" rel="noopener noreferrer" className="text-brand-cyan hover:text-white transition-colors font-medium">
                  PTR Niger
                </a>
              </p>
            </div>
            <Link href="/" className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
