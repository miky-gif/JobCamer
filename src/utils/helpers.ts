import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('XAF', 'FCFA');
};

export const formatDate = (date: any): string => {
  try {
    // Gérer les Firestore Timestamps
    if (date && typeof date === 'object' && 'toDate' in date) {
      date = date.toDate();
    }
    
    // Gérer les strings ISO
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    // Vérifier que c'est une date valide
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return format(date, 'dd MMM yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Date invalide';
  }
};

export const formatDateTime = (date: any): string => {
  try {
    // Gérer les Firestore Timestamps
    if (date && typeof date === 'object' && 'toDate' in date) {
      date = date.toDate();
    }
    
    // Gérer les strings ISO
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    // Vérifier que c'est une date valide
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return format(date, 'dd MMM yyyy à HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Date invalide';
  }
};

export const formatRelativeTime = (date: any): string => {
  try {
    // Gérer les Firestore Timestamps
    if (date && typeof date === 'object' && 'toDate' in date) {
      date = date.toDate();
    }
    
    // Gérer les strings ISO
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    // Vérifier que c'est une date valide
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return 'Date invalide';
    }
    
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch (error) {
    console.error('Error formatting relative time:', error, date);
    return 'Date invalide';
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: +237 6XX XX XX XX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+237 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Formule de Haversine pour calculer la distance en km
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value: number): number => {
  return (value * Math.PI) / 180;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const validatePhone = (phone: string): boolean => {
  // Valide les numéros camerounais (6XXXXXXXX)
  const cleaned = phone.replace(/\D/g, '');
  return /^6[0-9]{8}$/.test(cleaned);
};

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export const calculateCommission = (amount: number, rate: number): number => {
  return Math.round(amount * rate);
};

export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 3.5) return 'text-yellow-600';
  if (rating >= 2.5) return 'text-orange-600';
  return 'text-red-600';
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
