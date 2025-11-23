// Types pour l'application JobCamer

export type UserRole = 'worker' | 'employer';

export type JobCategory = 
  | 'construction'
  | 'agriculture'
  | 'domestic'
  | 'restaurant'
  | 'delivery'
  | 'events'
  | 'artisan';

export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export type PaymentMethod = 'orange_money' | 'mtn_momo' | 'cash';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  verified: boolean;
  premium: boolean;
}

export interface WorkerProfile extends User {
  role: 'worker';
  category: JobCategory;
  skills: string[];
  experience: number; // années
  hourlyRate: number; // FCFA
  dailyRate: number; // FCFA
  bio: string;
  portfolio: PortfolioItem[];
  availability: Availability[];
  location: Location;
  rating: number;
  totalJobs: number;
  certifications: Certification[];
  languages: string[];
}

export interface EmployerProfile extends User {
  role: 'employer';
  companyName?: string;
  location: Location;
  rating: number;
  totalJobsPosted: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: Date;
}

export interface Availability {
  dayOfWeek: number; // 0-6 (Dimanche-Samedi)
  startTime: string; // "08:00"
  endTime: string; // "18:00"
  available: boolean;
}

export interface Location {
  city: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  category: JobCategory;
  location: {
    city: string;
    district: string;
    latitude?: number;
    longitude?: number;
  };
  budget: number; // FCFA
  duration: number; // jours
  startDate: Date;
  status: JobStatus;
  applicants: string[]; // worker IDs
  views: number; // Nombre de vues
  createdAt: Date;
  updatedAt: Date;
  urgent: boolean;
  sponsored: boolean;
  requirements: string[];
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  worker: WorkerProfile;
  message: string;
  proposedRate: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  jobId?: string;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  commission: number; // 5-10%
  total: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payerId: string;
  payeeId: string;
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: Date;
  verified: boolean;
  icon: string;
}

export type NotificationType = 
  | 'account_created' // Création de compte
  | 'profile_completed' // Profil complété
  | 'new_job' // Nouvelle offre correspondante
  | 'job_posted' // Offre publiée avec succès
  | 'application_received' // Candidature reçue (employeur)
  | 'application_accepted' // Candidature acceptée (travailleur)
  | 'application_rejected' // Candidature rejetée (travailleur)
  | 'job_started' // Travail commencé
  | 'job_completed' // Travail terminé
  | 'payment_sent' // Paiement envoyé (employeur)
  | 'payment_received' // Paiement reçu (travailleur)
  | 'payment_failed' // Paiement échoué
  | 'review_received' // Avis reçu
  | 'message' // Nouveau message
  | 'profile_verified' // Profil vérifié
  | 'premium_activated' // Premium activé
  | 'premium_expired'; // Premium expiré

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  data?: Record<string, any>; // Données supplémentaires
}

export interface SearchFilters {
  category?: JobCategory;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  radius?: number; // km
  rating?: number;
  verified?: boolean;
  available?: boolean;
}
