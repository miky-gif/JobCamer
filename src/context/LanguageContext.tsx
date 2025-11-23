import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  fr: {
    // Header
    'header.search': 'Rechercher',
    'header.postJob': 'Publier une offre',
    'header.notifications': 'Notifications',
    'header.messages': 'Messages',
    'header.profile': 'Profil',
    'header.logout': 'Déconnexion',
    'header.settings': 'Paramètres',
    'header.darkMode': 'Mode sombre',
    
    // Home page
    'home.hero.title': 'Trouvez le travail qu\'il vous faut',
    'home.hero.subtitle': 'Connectez-vous avec les meilleurs professionnels du Cameroun',
    'home.hero.search': 'Rechercher',
    'home.hero.browse': 'Parcourir les offres',
    'home.hero.free': '100% Gratuit',
    'home.hero.secure': 'Sécurisé',
    
    'home.stats.title': 'Nos chiffres parlent',
    'home.stats.subtitle': 'Une communauté en croissance constante',
    'home.stats.workers': 'Travailleurs',
    'home.stats.workersDesc': 'Professionnels actifs',
    'home.stats.employers': 'Employeurs',
    'home.stats.employersDesc': 'Entreprises inscrites',
    'home.stats.missions': 'Missions',
    'home.stats.missionsDesc': 'Projets réalisés',
    'home.stats.satisfaction': 'Satisfaction',
    'home.stats.satisfactionDesc': 'Note moyenne',
    
    'home.categories.title': 'Nos catégories de métiers',
    'home.categories.subtitle': 'Explorez les 7 catégories de professionnels disponibles',
    
    'home.howItWorks.title': 'Comment ça marche ?',
    'home.howItWorks.subtitle': 'Trois étapes simples pour commencer',
    'home.howItWorks.step1': 'Créez votre profil',
    'home.howItWorks.step1Desc': 'Inscrivez-vous gratuitement en tant que travailleur ou employeur',
    'home.howItWorks.step2': 'Recherchez ou publiez',
    'home.howItWorks.step2Desc': 'Trouvez des offres ou publiez vos besoins en quelques clics',
    'home.howItWorks.step3': 'Travaillez ensemble',
    'home.howItWorks.step3Desc': 'Réalisez la mission et laissez une évaluation mutuelle',
    
    'home.cta.title': 'Prêt à commencer ?',
    'home.cta.subtitle': 'Rejoignez des milliers de travailleurs et employeurs',
    'home.cta.button': 'S\'inscrire maintenant',
    
    'home.recentJobs.title': 'Offres récentes',
    'home.recentJobs.viewAll': 'Voir tout',
    
    // Footer
    'footer.description': 'La plateforme camerounaise de mise en relation pour l\'emploi informel',
    'footer.proudlyCamera': 'Fièrement camerounais',
    'footer.company': 'Entreprise',
    'footer.about': 'À propos',
    'footer.careers': 'Carrières',
    'footer.blog': 'Blog',
    'footer.support': 'Support',
    'footer.help': 'Aide',
    'footer.contact': 'Contact',
    'footer.faq': 'FAQ',
    'footer.legal': 'Légal',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\'utilisation',
    'footer.copyright': '© 2024 JobCamer. Tous droits réservés.',
    
    // Auth pages
    'auth.login.title': 'Bon retour !',
    'auth.login.subtitle': 'Connectez-vous à votre compte JobCamer',
    'auth.login.email': 'Email',
    'auth.login.phone': 'Numéro de téléphone',
    'auth.login.password': 'Mot de passe',
    'auth.login.remember': 'Se souvenir de moi',
    'auth.login.forgot': 'Mot de passe oublié ?',
    'auth.login.button': 'Se connecter',
    'auth.login.newUser': 'Nouveau sur JobCamer ?',
    'auth.login.signup': 'Pas encore de compte ? S\'inscrire',
    
    'auth.register.title': 'Créer un compte',
    'auth.register.subtitle': 'Rejoignez JobCamer en quelques minutes',
    'auth.register.worker': 'Travailleur',
    'auth.register.workerDesc': 'Je cherche du travail',
    'auth.register.employer': 'Employeur',
    'auth.register.employerDesc': 'Je cherche des travailleurs',
    'auth.register.firstName': 'Prénom',
    'auth.register.lastName': 'Nom',
    'auth.register.email': 'Email',
    'auth.register.phone': 'Numéro de téléphone',
    'auth.register.category': 'Catégorie',
    'auth.register.button': 'S\'inscrire',
    'auth.register.login': 'Vous avez déjà un compte ? Se connecter',
    
    // Search page
    'search.title': 'Recherche',
    'search.jobs': 'Offres d\'emploi',
    'search.workers': 'Travailleurs',
    'search.filters': 'Filtres',
    'search.clearFilters': 'Réinitialiser les filtres',
    'search.noResults': 'Aucun résultat trouvé',
    
    // Profile page
    'profile.title': 'Mon profil',
    'profile.edit': 'Modifier',
    'profile.save': 'Enregistrer',
    'profile.cancel': 'Annuler',
    'profile.verified': 'Vérifié',
    'profile.premium': 'Premium',
    
    // Chat page
    'chat.title': 'Messages',
    'chat.noConversations': 'Aucune conversation',
    'chat.send': 'Envoyer',
    
    // Notifications page
    'notifications.title': 'Notifications',
    'notifications.all': 'Toutes',
    'notifications.unread': 'Non lues',
    'notifications.markAllAsRead': 'Tout marquer comme lu',
    'notifications.noNotifications': 'Aucune nouvelle notification',
    
    // PostJob page
    'postJob.title': 'Publier une offre d\'emploi',
    'postJob.subtitle': 'Remplissez les informations ci-dessous pour trouver le travailleur idéal',
    'postJob.success': 'Offre publiée avec succès !',
    'postJob.successDesc': 'Votre offre est maintenant visible par tous les travailleurs.',
    
    // Payment page
    'payment.title': 'Paiement sécurisé',
    'payment.summary': 'Récapitulatif',
    'payment.amount': 'Montant de la mission',
    'payment.commission': 'Commission JobCamer',
    'payment.total': 'Total à payer',
    'payment.method': 'Méthode de paiement',
    'payment.success': 'Paiement réussi !',
    'payment.successDesc': 'Votre paiement a été effectué avec succès.',
    
    // Job detail page
    'jobDetail.title': 'Détails de l\'offre',
    'jobDetail.apply': 'Postuler',
    'jobDetail.applied': 'Déjà postulé',
    'jobDetail.back': 'Retour',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Une erreur s\'est produite',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.save': 'Enregistrer',
    'common.close': 'Fermer',
  },
  en: {
    // Header
    'header.search': 'Search',
    'header.postJob': 'Post a Job',
    'header.notifications': 'Notifications',
    'header.messages': 'Messages',
    'header.profile': 'Profile',
    'header.logout': 'Logout',
    'header.settings': 'Settings',
    'header.darkMode': 'Dark Mode',
    
    // Home page
    'home.hero.title': 'Find the work you need',
    'home.hero.subtitle': 'Connect with the best professionals in Cameroon',
    'home.hero.search': 'Search',
    'home.hero.browse': 'Browse offers',
    'home.hero.free': '100% Free',
    'home.hero.secure': 'Secure',
    
    'home.stats.title': 'Our numbers speak',
    'home.stats.subtitle': 'A constantly growing community',
    'home.stats.workers': 'Workers',
    'home.stats.workersDesc': 'Active professionals',
    'home.stats.employers': 'Employers',
    'home.stats.employersDesc': 'Registered companies',
    'home.stats.missions': 'Missions',
    'home.stats.missionsDesc': 'Completed projects',
    'home.stats.satisfaction': 'Satisfaction',
    'home.stats.satisfactionDesc': 'Average rating',
    
    'home.categories.title': 'Our job categories',
    'home.categories.subtitle': 'Explore 7 categories of available professionals',
    
    'home.howItWorks.title': 'How it works?',
    'home.howItWorks.subtitle': 'Three simple steps to get started',
    'home.howItWorks.step1': 'Create your profile',
    'home.howItWorks.step1Desc': 'Sign up for free as a worker or employer',
    'home.howItWorks.step2': 'Search or post',
    'home.howItWorks.step2Desc': 'Find offers or post your needs in a few clicks',
    'home.howItWorks.step3': 'Work together',
    'home.howItWorks.step3Desc': 'Complete the mission and leave mutual feedback',
    
    'home.cta.title': 'Ready to get started?',
    'home.cta.subtitle': 'Join thousands of workers and employers',
    'home.cta.button': 'Sign up now',
    
    'home.recentJobs.title': 'Recent offers',
    'home.recentJobs.viewAll': 'View all',
    
    // Footer
    'footer.description': 'Cameroon\'s platform for connecting informal employment',
    'footer.proudlyCamera': 'Proudly Cameroonian',
    'footer.company': 'Company',
    'footer.about': 'About',
    'footer.careers': 'Careers',
    'footer.blog': 'Blog',
    'footer.support': 'Support',
    'footer.help': 'Help',
    'footer.contact': 'Contact',
    'footer.faq': 'FAQ',
    'footer.legal': 'Legal',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.copyright': '© 2024 JobCamer. All rights reserved.',
    
    // Auth pages
    'auth.login.title': 'Welcome back!',
    'auth.login.subtitle': 'Sign in to your JobCamer account',
    'auth.login.email': 'Email',
    'auth.login.phone': 'Phone number',
    'auth.login.password': 'Password',
    'auth.login.remember': 'Remember me',
    'auth.login.forgot': 'Forgot password?',
    'auth.login.button': 'Sign in',
    'auth.login.newUser': 'New to JobCamer?',
    'auth.login.signup': 'Don\'t have an account? Sign up',
    
    'auth.register.title': 'Create an account',
    'auth.register.subtitle': 'Join JobCamer in minutes',
    'auth.register.worker': 'Worker',
    'auth.register.workerDesc': 'I\'m looking for work',
    'auth.register.employer': 'Employer',
    'auth.register.employerDesc': 'I\'m looking for workers',
    'auth.register.firstName': 'First name',
    'auth.register.lastName': 'Last name',
    'auth.register.email': 'Email',
    'auth.register.phone': 'Phone number',
    'auth.register.category': 'Category',
    'auth.register.button': 'Sign up',
    'auth.register.login': 'Already have an account? Sign in',
    
    // Search page
    'search.title': 'Search',
    'search.jobs': 'Job offers',
    'search.workers': 'Workers',
    'search.filters': 'Filters',
    'search.clearFilters': 'Clear filters',
    'search.noResults': 'No results found',
    
    // Profile page
    'profile.title': 'My profile',
    'profile.edit': 'Edit',
    'profile.save': 'Save',
    'profile.cancel': 'Cancel',
    'profile.verified': 'Verified',
    'profile.premium': 'Premium',
    
    // Chat page
    'chat.title': 'Messages',
    'chat.noConversations': 'No conversations',
    'chat.send': 'Send',
    
    // Notifications page
    'notifications.title': 'Notifications',
    'notifications.all': 'All',
    'notifications.unread': 'Unread',
    'notifications.markAllAsRead': 'Mark all as read',
    'notifications.noNotifications': 'No new notifications',
    
    // PostJob page
    'postJob.title': 'Post a job offer',
    'postJob.subtitle': 'Fill in the information below to find the ideal worker',
    'postJob.success': 'Job posted successfully!',
    'postJob.successDesc': 'Your offer is now visible to all workers.',
    
    // Payment page
    'payment.title': 'Secure payment',
    'payment.summary': 'Summary',
    'payment.amount': 'Mission amount',
    'payment.commission': 'JobCamer commission',
    'payment.total': 'Total to pay',
    'payment.method': 'Payment method',
    'payment.success': 'Payment successful!',
    'payment.successDesc': 'Your payment has been processed successfully.',
    
    // Job detail page
    'jobDetail.title': 'Job details',
    'jobDetail.apply': 'Apply',
    'jobDetail.applied': 'Already applied',
    'jobDetail.back': 'Back',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.save': 'Save',
    'common.close': 'Close',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Récupérer la langue sauvegardée ou utiliser le français par défaut
    const saved = localStorage.getItem('language') as Language | null;
    return saved || 'fr';
  });

  useEffect(() => {
    // Sauvegarder la langue dans localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
