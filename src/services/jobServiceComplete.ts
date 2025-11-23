import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Job as JobType, JobCategory, JobStatus } from '../types';

// Réexporter les types depuis types/index.ts
export type Job = JobType;

// Interface pour les statistiques d'un employeur
export interface EmployerJobStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  totalApplications: number;
  totalViews: number;
}

// ==================== CRÉATION D'OFFRES ====================

/**
 * Créer une nouvelle offre d'emploi
 */
export const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applicants'>): Promise<string> => {
  try {
    console.log('📝 Création d\'une nouvelle offre:', jobData.title);
    
    // Validation des données
    if (!jobData.employerId || !jobData.title || !jobData.description) {
      throw new Error('Données manquantes pour créer l\'offre');
    }

    // Nettoyer et préparer les données
    const cleanedData = {
      employerId: jobData.employerId,
      title: jobData.title.trim(),
      description: jobData.description.trim(),
      category: jobData.category,
      location: jobData.location,
      budget: Number(jobData.budget),
      duration: Number(jobData.duration),
      startDate: jobData.startDate instanceof Date ? jobData.startDate : new Date(jobData.startDate),
      urgent: Boolean(jobData.urgent),
      sponsored: Boolean(jobData.sponsored),
      requirements: jobData.requirements || [],
      status: jobData.status || 'open',
      applicants: [], // Toujours vide au début
      views: 0, // Toujours 0 au début
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📝 Données nettoyées:', cleanedData);

    // Créer l'offre dans Firestore
    const docRef = await addDoc(collection(db, 'jobs'), cleanedData);
    
    console.log('✅ Offre créée avec succès:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'offre:', error);
    throw new Error(`Impossible de créer l'offre: ${error.message}`);
  }
};

// ==================== LECTURE D'OFFRES ====================

/**
 * Enrichir les jobs avec les compteurs de candidatures
 */
const enrichJobsWithStats = async (jobs: Job[]): Promise<Job[]> => {
  try {
    const { getMultipleJobsApplicationsCount } = await import('./jobStatsService');
    const jobIds = jobs.map(job => job.id);
    const applicationsCounts = await getMultipleJobsApplicationsCount(jobIds);
    
    return jobs.map(job => ({
      ...job,
      applicants: job.applicants || [],
      // Mettre à jour le nombre de candidatures réelles
      applicationCount: applicationsCounts[job.id] || 0
    }));
  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement des jobs:', error);
    return jobs;
  }
};

/**
 * Récupérer toutes les offres (pour la recherche publique)
 */
export const getAllJobs = async (): Promise<Job[]> => {
  try {
    console.log('📝 Récupération de toutes les offres...');
    
    // Simplifier la requête pour éviter les problèmes d'index
    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobs'),
        orderBy('createdAt', 'desc')
      )
    );

    // Filtrer côté client pour les offres ouvertes
    const jobs = querySnapshot.docs
      .map(doc => convertFirestoreJob(doc))
      .filter(job => job.status === 'open');
    
    console.log('✅ Offres récupérées:', jobs.length);
    
    // Enrichir avec les compteurs de candidatures
    const enrichedJobs = await enrichJobsWithStats(jobs);
    console.log('✅ Offres enrichies avec statistiques');
    
    return enrichedJobs;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres:', error);
    console.error('Détails de l\'erreur:', error);
    
    // En cas d'erreur, essayer une requête encore plus simple
    try {
      console.log('🔄 Tentative avec requête simplifiée...');
      const simpleQuery = await getDocs(collection(db, 'jobs'));
      const jobs = simpleQuery.docs
        .map(doc => convertFirestoreJob(doc))
        .filter(job => job.status === 'open')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Offres récupérées (requête simple):', jobs.length);
      
      // Enrichir même en cas d'erreur
      const enrichedJobs = await enrichJobsWithStats(jobs);
      return enrichedJobs;
    } catch (simpleError) {
      console.error('❌ Erreur même avec requête simple:', simpleError);
      return []; // Retourner un tableau vide plutôt que de faire échouer
    }
  }
};

/**
 * Récupérer une offre par son ID
 */
export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    console.log('📝 Récupération de l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    const docSnap = await getDoc(doc(db, 'jobs', jobId));
    
    if (!docSnap.exists()) {
      console.log('⚠️ Offre non trouvée:', jobId);
      return null;
    }

    const job = convertFirestoreJob(docSnap);
    console.log('✅ Offre récupérée:', job.title);
    
    return job;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'offre:', error);
    throw new Error('Impossible de récupérer l\'offre');
  }
};

/**
 * Récupérer toutes les offres d'un employeur
 */
export const getJobsByEmployer = async (employerId: string): Promise<Job[]> => {
  try {
    console.log('📝 Récupération des offres de l\'employeur:', employerId);
    
    if (!employerId) {
      throw new Error('ID de l\'employeur manquant');
    }

    // Simplifier la requête pour éviter les problèmes d'index
    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobs'),
        where('employerId', '==', employerId)
      )
    );

    // Trier côté client
    const jobs = querySnapshot.docs
      .map(doc => convertFirestoreJob(doc))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    console.log('✅ Offres de l\'employeur récupérées:', jobs.length);
    
    return jobs;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres de l\'employeur:', error);
    console.error('Détails de l\'erreur:', error);
    
    // En cas d'erreur, essayer une requête encore plus simple
    try {
      console.log('🔄 Tentative avec requête simplifiée pour employeur...');
      const simpleQuery = await getDocs(collection(db, 'jobs'));
      const jobs = simpleQuery.docs
        .map(doc => convertFirestoreJob(doc))
        .filter(job => job.employerId === employerId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Offres de l\'employeur récupérées (requête simple):', jobs.length);
      return jobs;
    } catch (simpleError) {
      console.error('❌ Erreur même avec requête simple:', simpleError);
      return [];
    }
  }
};

/**
 * Rechercher des offres par catégorie
 */
export const getJobsByCategory = async (category: string): Promise<Job[]> => {
  try {
    console.log('📝 Recherche d\'offres par catégorie:', category);
    
    // Simplifier la requête pour éviter les problèmes d'index
    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobs'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    );

    // Filtrer côté client pour les offres ouvertes
    const jobs = querySnapshot.docs
      .map(doc => convertFirestoreJob(doc))
      .filter(job => job.status === 'open');
    
    console.log('✅ Offres trouvées pour la catégorie:', jobs.length);
    
    return jobs;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche par catégorie:', error);
    
    // En cas d'erreur, essayer une requête encore plus simple
    try {
      console.log('🔄 Tentative avec requête simplifiée pour catégorie...');
      const simpleQuery = await getDocs(collection(db, 'jobs'));
      const jobs = simpleQuery.docs
        .map(doc => convertFirestoreJob(doc))
        .filter(job => job.category === category && job.status === 'open')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log('✅ Offres trouvées (requête simple):', jobs.length);
      return jobs;
    } catch (simpleError) {
      console.error('❌ Erreur même avec requête simple:', simpleError);
      return [];
    }
  }
};

// ==================== MODIFICATION D'OFFRES ====================

/**
 * Mettre à jour une offre d'emploi
 */
export const updateJob = async (jobId: string, updates: Partial<Omit<Job, 'id' | 'createdAt' | 'employerId'>>): Promise<void> => {
  try {
    console.log('📝 Mise à jour de l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    // Nettoyer les données de mise à jour
    const cleanedUpdates: any = { ...updates };
    
    // Convertir les dates si nécessaire
    if (cleanedUpdates.startDate && !(cleanedUpdates.startDate instanceof Date)) {
      cleanedUpdates.startDate = new Date(cleanedUpdates.startDate);
    }
    
    // Ajouter la date de mise à jour
    cleanedUpdates.updatedAt = new Date();
    
    // Supprimer les champs qui ne doivent pas être modifiés
    delete cleanedUpdates.id;
    delete cleanedUpdates.createdAt;
    delete cleanedUpdates.employerId;

    await updateDoc(doc(db, 'jobs', jobId), cleanedUpdates);
    
    console.log('✅ Offre mise à jour avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'offre:', error);
    throw new Error('Impossible de mettre à jour l\'offre');
  }
};

/**
 * Changer le statut d'une offre
 */
export const updateJobStatus = async (jobId: string, status: Job['status']): Promise<void> => {
  try {
    console.log('📝 Changement de statut de l\'offre:', jobId, 'vers', status);
    
    await updateJob(jobId, { status });
    
    console.log('✅ Statut de l\'offre mis à jour');
  } catch (error) {
    console.error('❌ Erreur lors du changement de statut:', error);
    throw new Error('Impossible de changer le statut de l\'offre');
  }
};

/**
 * Incrémenter le nombre de vues d'une offre
 */
export const incrementJobViews = async (jobId: string): Promise<void> => {
  try {
    console.log('📝 Incrémentation des vues pour l\'offre:', jobId);
    
    await updateDoc(doc(db, 'jobs', jobId), {
      views: increment(1),
      updatedAt: new Date()
    });
    
    console.log('✅ Vues incrémentées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'incrémentation des vues:', error);
    // Ne pas faire échouer l'opération pour les vues
  }
};

// ==================== SUPPRESSION D'OFFRES ====================

/**
 * Supprimer une offre d'emploi
 */
export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    console.log('📝 Suppression de l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    // Vérifier que l'offre existe
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      throw new Error('Offre non trouvée');
    }

    // Supprimer l'offre
    await deleteDoc(doc(db, 'jobs', jobId));
    
    console.log('✅ Offre supprimée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'offre:', error);
    throw new Error('Impossible de supprimer l\'offre');
  }
};

// ==================== STATISTIQUES ====================

/**
 * Récupérer les statistiques d'un employeur
 */
export const getEmployerStats = async (employerId: string): Promise<EmployerJobStats> => {
  try {
    console.log('📝 Récupération des statistiques de l\'employeur:', employerId);
    
    const jobs = await getJobsByEmployer(employerId);
    
    const stats: EmployerJobStats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === 'open').length,
      completedJobs: jobs.filter(job => job.status === 'completed').length,
      totalApplications: jobs.reduce((sum, job) => sum + job.applicants.length, 0),
      totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
    };
    
    console.log('✅ Statistiques calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques');
  }
};

// ==================== UTILITAIRES ====================

/**
 * Convertir un document Firestore en objet Job
 */
function convertFirestoreJob(docSnap: any): Job {
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    employerId: data.employerId,
    title: data.title,
    description: data.description,
    category: data.category,
    location: data.location,
    budget: data.budget,
    duration: data.duration,
    startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
    urgent: data.urgent || false,
    sponsored: data.sponsored || false,
    requirements: data.requirements || [],
    applicants: data.applicants || [],
    status: data.status,
    views: data.views || 0,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}

/**
 * Valider les données d'une offre
 */
export function validateJobData(jobData: Partial<Job>): string[] {
  const errors: string[] = [];
  
  if (!jobData.title?.trim()) {
    errors.push('Le titre est obligatoire');
  }
  
  if (!jobData.description?.trim()) {
    errors.push('La description est obligatoire');
  }
  
  if (!jobData.category) {
    errors.push('La catégorie est obligatoire');
  }
  
  if (!jobData.budget || jobData.budget <= 0) {
    errors.push('Le budget doit être supérieur à 0');
  }
  
  if (!jobData.duration || jobData.duration <= 0) {
    errors.push('La durée doit être supérieure à 0');
  }
  
  if (!jobData.location?.city) {
    errors.push('La ville est obligatoire');
  }
  
  if (!jobData.startDate) {
    errors.push('La date de début est obligatoire');
  }
  
  return errors;
}

/**
 * Formater le budget pour l'affichage
 */
export function formatBudget(budget: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(budget);
}

/**
 * Calculer le temps écoulé depuis la création
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    }
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays === 1) {
    return 'Hier';
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR');
  }
}
