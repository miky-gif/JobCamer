import { JobCategory } from '../types';

export const JOB_CATEGORIES: Record<JobCategory, { 
  label: string; 
  icon: string; 
  color: string;
  subcategories: string[];
}> = {
  construction: {
    label: 'Construction & Chantiers',
    icon: '🏗️',
    color: 'bg-orange-500',
    subcategories: ['Manœuvre', 'Maçon', 'Électricien', 'Plombier', 'Peintre', 'Menuisier']
  },
  agriculture: {
    label: 'Agriculture & Jardinage',
    icon: '🌾',
    color: 'bg-green-600',
    subcategories: ['Labourage', 'Récolte', 'Défrichage', 'Entretien jardins', 'Arrosage']
  },
  domestic: {
    label: 'Services Domestiques',
    icon: '🏠',
    color: 'bg-blue-500',
    subcategories: ['Ménagère', 'Baby-sitter', 'Cuisinière', 'Gardien', 'Blanchisserie']
  },
  restaurant: {
    label: 'Restauration & Hôtellerie',
    icon: '🍽️',
    color: 'bg-red-500',
    subcategories: ['Serveur', 'Cuisinier', 'Plongeur', 'Barman', 'Aide cuisine']
  },
  delivery: {
    label: 'Livraison & Transport',
    icon: '🚚',
    color: 'bg-yellow-600',
    subcategories: ['Livreur', 'Chauffeur', 'Déménageur', 'Coursier', 'Moto-taxi']
  },
  events: {
    label: 'Événementiel',
    icon: '🎉',
    color: 'bg-purple-500',
    subcategories: ['Serveur événements', 'Agent entretien', 'Hôtesse', 'Décorateur', 'Traiteur']
  },
  artisan: {
    label: 'Artisanat',
    icon: '✂️',
    color: 'bg-pink-500',
    subcategories: ['Couturier', 'Coiffeur', 'Mécanicien', 'Cordonnier', 'Bijoutier']
  }
};

export const CITIES = [
  'Yaoundé',
  'Douala',
  'Garoua',
  'Bamenda',
  'Bafoussam',
  'Ngaoundéré',
  'Bertoua',
  'Maroua',
  'Kribi',
  'Limbé',
  'Buea',
  'Ebolowa'
];

export const LANGUAGES = [
  'Français',
  'Anglais',
  'Pidgin English',
  'Fulfulde',
  'Ewondo',
  'Duala',
  'Bamiléké'
];

export const COMMISSION_RATE = 0.08; // 8%

export const PREMIUM_PRICE = 5000; // FCFA/mois

export const PAYMENT_METHODS = {
  orange_money: {
    label: 'Orange Money',
    icon: '🟠',
    color: 'bg-orange-500'
  },
  mtn_momo: {
    label: 'MTN Mobile Money',
    icon: '🟡',
    color: 'bg-yellow-500'
  },
  cash: {
    label: 'Espèces',
    icon: '💵',
    color: 'bg-green-500'
  }
};

export const RATING_LABELS = {
  5: 'Excellent',
  4: 'Très bien',
  3: 'Bien',
  2: 'Moyen',
  1: 'Mauvais'
};

export const DEFAULT_LOCATION = {
  city: 'Yaoundé',
  district: 'Centre-ville',
  latitude: 3.8480,
  longitude: 11.5021
};
