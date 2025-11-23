import { WorkerProfile, EmployerProfile, Job, Review, Conversation, Message } from '../types';

// Mock Workers
export const mockWorkers: WorkerProfile[] = [
  {
    id: 'w1',
    phone: '677123456',
    firstName: 'Jean',
    lastName: 'Kamga',
    role: 'worker',
    avatar: 'https://i.pravatar.cc/150?img=12',
    createdAt: new Date('2023-06-15'),
    verified: true,
    premium: true,
    category: 'construction',
    skills: ['Maçonnerie', 'Carrelage', 'Plâtrerie'],
    experience: 8,
    hourlyRate: 2000,
    dailyRate: 15000,
    bio: 'Maçon expérimenté avec plus de 8 ans d\'expérience. Spécialisé dans la construction résidentielle et commerciale. Travail soigné et respect des délais.',
    portfolio: [
      {
        id: 'p1',
        title: 'Construction villa moderne',
        description: 'Villa 4 chambres à Bastos',
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
        date: new Date('2023-08-20')
      }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '07:00', endTime: '17:00', available: true },
      { dayOfWeek: 2, startTime: '07:00', endTime: '17:00', available: true },
      { dayOfWeek: 3, startTime: '07:00', endTime: '17:00', available: true },
      { dayOfWeek: 4, startTime: '07:00', endTime: '17:00', available: true },
      { dayOfWeek: 5, startTime: '07:00', endTime: '17:00', available: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '13:00', available: true }
    ],
    location: {
      city: 'Yaoundé',
      district: 'Ngousso',
      latitude: 3.8667,
      longitude: 11.5167
    },
    rating: 4.8,
    totalJobs: 47,
    certifications: [
      {
        id: 'c1',
        name: 'Maçonnerie professionnelle',
        issuer: 'CFPM Yaoundé',
        date: new Date('2020-03-15'),
        verified: true,
        icon: '🏗️'
      }
    ],
    languages: ['Français', 'Ewondo']
  },
  {
    id: 'w2',
    phone: '655987654',
    firstName: 'Marie',
    lastName: 'Ngo Biyong',
    role: 'worker',
    avatar: 'https://i.pravatar.cc/150?img=45',
    createdAt: new Date('2023-09-10'),
    verified: true,
    premium: false,
    category: 'domestic',
    skills: ['Ménage', 'Cuisine', 'Repassage'],
    experience: 5,
    hourlyRate: 1500,
    dailyRate: 10000,
    bio: 'Aide ménagère professionnelle et discrète. Expérience avec familles expatriées. Excellentes références.',
    portfolio: [],
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', available: true },
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', available: true },
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', available: true },
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', available: true },
      { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', available: true }
    ],
    location: {
      city: 'Yaoundé',
      district: 'Bastos',
      latitude: 3.8833,
      longitude: 11.5167
    },
    rating: 4.9,
    totalJobs: 32,
    certifications: [],
    languages: ['Français', 'Anglais']
  },
  {
    id: 'w3',
    phone: '699456789',
    firstName: 'Paul',
    lastName: 'Tchounga',
    role: 'worker',
    avatar: 'https://i.pravatar.cc/150?img=33',
    createdAt: new Date('2023-07-22'),
    verified: true,
    premium: true,
    category: 'agriculture',
    skills: ['Labourage', 'Défrichage', 'Plantation'],
    experience: 12,
    hourlyRate: 1800,
    dailyRate: 12000,
    bio: 'Agriculteur expérimenté. Spécialiste du défrichage et de la préparation des terrains. Équipe disponible pour grands projets.',
    portfolio: [
      {
        id: 'p2',
        title: 'Défrichage terrain 2 hectares',
        description: 'Préparation terrain agricole à Obala',
        images: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400'],
        date: new Date('2023-10-05')
      }
    ],
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '18:00', available: true },
      { dayOfWeek: 2, startTime: '06:00', endTime: '18:00', available: true },
      { dayOfWeek: 3, startTime: '06:00', endTime: '18:00', available: true },
      { dayOfWeek: 4, startTime: '06:00', endTime: '18:00', available: true },
      { dayOfWeek: 5, startTime: '06:00', endTime: '18:00', available: true },
      { dayOfWeek: 6, startTime: '06:00', endTime: '14:00', available: true }
    ],
    location: {
      city: 'Yaoundé',
      district: 'Obala',
      latitude: 4.1667,
      longitude: 11.5333
    },
    rating: 4.7,
    totalJobs: 68,
    certifications: [],
    languages: ['Français', 'Ewondo']
  },
  {
    id: 'w4',
    phone: '670234567',
    firstName: 'Aminata',
    lastName: 'Sow',
    role: 'worker',
    avatar: 'https://i.pravatar.cc/150?img=28',
    createdAt: new Date('2023-08-05'),
    verified: false,
    premium: false,
    category: 'restaurant',
    skills: ['Service', 'Bar', 'Accueil'],
    experience: 3,
    hourlyRate: 1200,
    dailyRate: 8000,
    bio: 'Serveuse dynamique et souriante. Expérience en restauration et événementiel. Disponible pour missions ponctuelles.',
    portfolio: [],
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '22:00', available: true },
      { dayOfWeek: 2, startTime: '10:00', endTime: '22:00', available: true },
      { dayOfWeek: 3, startTime: '10:00', endTime: '22:00', available: true },
      { dayOfWeek: 5, startTime: '10:00', endTime: '22:00', available: true },
      { dayOfWeek: 6, startTime: '10:00', endTime: '22:00', available: true },
      { dayOfWeek: 0, startTime: '10:00', endTime: '22:00', available: true }
    ],
    location: {
      city: 'Douala',
      district: 'Akwa',
      latitude: 4.0511,
      longitude: 9.7679
    },
    rating: 4.5,
    totalJobs: 15,
    certifications: [],
    languages: ['Français', 'Anglais', 'Fulfulde']
  }
];

// Mock Employers
export const mockEmployers: EmployerProfile[] = [
  {
    id: 'e1',
    phone: '677888999',
    firstName: 'Robert',
    lastName: 'Mbarga',
    role: 'employer',
    avatar: 'https://i.pravatar.cc/150?img=60',
    createdAt: new Date('2023-05-20'),
    verified: true,
    premium: true,
    companyName: 'Mbarga Construction',
    location: {
      city: 'Yaoundé',
      district: 'Bastos',
      latitude: 3.8833,
      longitude: 11.5167
    },
    rating: 4.6,
    totalJobsPosted: 23
  },
  {
    id: 'e2',
    phone: '655777888',
    firstName: 'Sophie',
    lastName: 'Dupont',
    role: 'employer',
    avatar: 'https://i.pravatar.cc/150?img=47',
    createdAt: new Date('2023-07-12'),
    verified: true,
    premium: false,
    location: {
      city: 'Yaoundé',
      district: 'Bastos',
      latitude: 3.8833,
      longitude: 11.5167
    },
    rating: 4.9,
    totalJobsPosted: 8
  }
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 'j1',
    employerId: 'e1',
    employer: mockEmployers[0],
    title: 'Maçon pour construction villa',
    description: 'Recherche maçon expérimenté pour construction d\'une villa de 5 pièces à Bastos. Travail sur 3 mois. Équipe de 2-3 personnes souhaitée.',
    category: 'construction',
    location: {
      city: 'Yaoundé',
      district: 'Bastos',
      latitude: 3.8833,
      longitude: 11.5167
    },
    budget: 800000,
    duration: 90,
    startDate: new Date('2024-01-15'),
    status: 'open',
    applicants: ['w1'],
    createdAt: new Date('2023-11-05'),
    urgent: true,
    sponsored: true,
    requirements: ['Expérience minimum 5 ans', 'Références vérifiables', 'Équipe disponible']
  },
  {
    id: 'j2',
    employerId: 'e2',
    employer: mockEmployers[1],
    title: 'Aide ménagère à temps partiel',
    description: 'Famille recherche aide ménagère pour 3 jours par semaine (lundi, mercredi, vendredi). Ménage, repassage, cuisine simple.',
    category: 'domestic',
    location: {
      city: 'Yaoundé',
      district: 'Bastos',
      latitude: 3.8833,
      longitude: 11.5167
    },
    budget: 60000,
    duration: 30,
    startDate: new Date('2023-12-01'),
    status: 'open',
    applicants: ['w2'],
    createdAt: new Date('2023-11-08'),
    urgent: false,
    sponsored: false,
    requirements: ['Discrétion', 'Références', 'Expérience avec enfants']
  },
  {
    id: 'j3',
    employerId: 'e1',
    employer: mockEmployers[0],
    title: 'Défrichage terrain 1 hectare',
    description: 'Besoin de défricher un terrain d\'environ 1 hectare à Obala pour projet agricole. Travail manuel et mécanique accepté.',
    category: 'agriculture',
    location: {
      city: 'Yaoundé',
      district: 'Obala',
      latitude: 4.1667,
      longitude: 11.5333
    },
    budget: 150000,
    duration: 7,
    startDate: new Date('2023-11-20'),
    status: 'open',
    applicants: ['w3'],
    createdAt: new Date('2023-11-09'),
    urgent: true,
    sponsored: false,
    requirements: ['Équipement disponible', 'Expérience défrichage']
  },
  {
    id: 'j4',
    employerId: 'e2',
    employer: mockEmployers[1],
    title: 'Serveurs pour événement',
    description: 'Recherche 5 serveurs/serveuses pour mariage le samedi 25 novembre. Service de 14h à 23h. Tenue fournie.',
    category: 'events',
    location: {
      city: 'Yaoundé',
      district: 'Centre-ville',
      latitude: 3.8480,
      longitude: 11.5021
    },
    budget: 50000,
    duration: 1,
    startDate: new Date('2023-11-25'),
    status: 'open',
    applicants: ['w4'],
    createdAt: new Date('2023-11-10'),
    urgent: false,
    sponsored: false,
    requirements: ['Présentation soignée', 'Expérience service', 'Ponctualité']
  }
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'r1',
    jobId: 'j1',
    reviewerId: 'e1',
    reviewerName: 'Robert Mbarga',
    reviewerAvatar: 'https://i.pravatar.cc/150?img=60',
    revieweeId: 'w1',
    rating: 5,
    comment: 'Excellent travail ! Jean est très professionnel et respecte les délais. Je recommande vivement.',
    createdAt: new Date('2023-10-15')
  },
  {
    id: 'r2',
    jobId: 'j2',
    reviewerId: 'e2',
    reviewerName: 'Sophie Dupont',
    reviewerAvatar: 'https://i.pravatar.cc/150?img=47',
    revieweeId: 'w2',
    rating: 5,
    comment: 'Marie est formidable ! Très discrète, efficace et les enfants l\'adorent.',
    createdAt: new Date('2023-09-20')
  }
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: [mockEmployers[0], mockWorkers[0]],
    lastMessage: {
      id: 'm1',
      conversationId: 'conv1',
      senderId: 'e1',
      senderName: 'Robert Mbarga',
      senderAvatar: 'https://i.pravatar.cc/150?img=60',
      content: 'Bonjour Jean, êtes-vous disponible pour commencer lundi prochain ?',
      timestamp: new Date('2023-11-10T14:30:00'),
      read: false
    },
    unreadCount: 1,
    jobId: 'j1'
  }
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'm1',
    conversationId: 'conv1',
    senderId: 'e1',
    senderName: 'Robert Mbarga',
    senderAvatar: 'https://i.pravatar.cc/150?img=60',
    content: 'Bonjour Jean, j\'ai vu votre profil et je suis intéressé par vos services.',
    timestamp: new Date('2023-11-10T10:00:00'),
    read: true
  },
  {
    id: 'm2',
    conversationId: 'conv1',
    senderId: 'w1',
    senderName: 'Jean Kamga',
    senderAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Bonjour Monsieur Mbarga, merci pour votre message. Je suis disponible.',
    timestamp: new Date('2023-11-10T10:15:00'),
    read: true
  },
  {
    id: 'm3',
    conversationId: 'conv1',
    senderId: 'e1',
    senderName: 'Robert Mbarga',
    senderAvatar: 'https://i.pravatar.cc/150?img=60',
    content: 'Parfait ! Pouvez-vous passer au chantier demain pour voir le projet ?',
    timestamp: new Date('2023-11-10T11:00:00'),
    read: true
  },
  {
    id: 'm4',
    conversationId: 'conv1',
    senderId: 'w1',
    senderName: 'Jean Kamga',
    senderAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Oui, pas de problème. À quelle heure ?',
    timestamp: new Date('2023-11-10T11:30:00'),
    read: true
  },
  {
    id: 'm5',
    conversationId: 'conv1',
    senderId: 'e1',
    senderName: 'Robert Mbarga',
    senderAvatar: 'https://i.pravatar.cc/150?img=60',
    content: 'Bonjour Jean, êtes-vous disponible pour commencer lundi prochain ?',
    timestamp: new Date('2023-11-10T14:30:00'),
    read: false
  }
];
