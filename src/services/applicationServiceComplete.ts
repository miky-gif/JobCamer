import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour une candidature
export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  employerId: string; // Pour faciliter les requêtes
  workerProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    bio?: string;
    rating: number;
    totalJobs: number;
    skills: string[];
  };
  jobTitle: string; // Pour faciliter l'affichage
  message: string;
  proposedRate?: number;
  attachments?: string[]; // URLs des fichiers joints
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
  // Champs pour le suivi
  viewedByEmployer: boolean;
  employerResponse?: string;
  responseDate?: Date;
}

// Interface pour les statistiques des candidatures
export interface ApplicationStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

// ==================== CRÉATION DE CANDIDATURES ====================

/**
 * Créer une nouvelle candidature
 */
export const createApplication = async (
  jobId: string,
  workerId: string,
  employerId: string,
  workerProfile: Application['workerProfile'],
  jobTitle: string,
  message: string,
  proposedRate?: number,
  attachments?: string[]
): Promise<string> => {
  try {
    console.log('📝 Création d\'une candidature pour l\'offre:', jobId);
    
    // Validation des données
    if (!jobId || !workerId || !employerId || !message.trim()) {
      throw new Error('Données manquantes pour créer la candidature');
    }

    // Vérifier si le travailleur a déjà postulé
    const existingApplication = await hasWorkerApplied(jobId, workerId);
    if (existingApplication) {
      throw new Error('Vous avez déjà postulé pour cette offre');
    }

    // Préparer les données
    const applicationData = {
      jobId,
      workerId,
      employerId,
      workerProfile: {
        firstName: workerProfile.firstName,
        lastName: workerProfile.lastName,
        email: workerProfile.email,
        phone: workerProfile.phone,
        avatar: workerProfile.avatar || '',
        bio: workerProfile.bio || '',
        rating: workerProfile.rating || 0,
        totalJobs: workerProfile.totalJobs || 0,
        skills: workerProfile.skills || [],
      },
      jobTitle,
      message: message.trim(),
      proposedRate: proposedRate ? Number(proposedRate) : undefined,
      attachments: attachments || [],
      status: 'pending' as const,
      viewedByEmployer: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('📝 Données de candidature préparées');

    // Créer la candidature
    const docRef = await addDoc(collection(db, 'applications'), applicationData);
    
    // Mettre à jour la liste des candidats dans l'offre
    await updateJobApplicants(jobId, workerId, 'add');
    
    // Créer une notification pour l'employeur
    try {
      const { createNotification } = await import('./notificationService');
      await createNotification(
        employerId,
        'application',
        'Nouvelle candidature reçue',
        `${workerProfile.firstName} ${workerProfile.lastName} a postulé pour votre offre "${jobTitle}"`,
        `/job/${jobId}`
      );
      console.log('✅ Notification envoyée à l\'employeur');
    } catch (notifError) {
      console.error('⚠️ Erreur lors de l\'envoi de la notification:', notifError);
      // Ne pas faire échouer la candidature pour une erreur de notification
    }
    
    console.log('✅ Candidature créée avec succès:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la candidature:', error);
    throw new Error(`Impossible de créer la candidature: ${error.message}`);
  }
};

// ==================== LECTURE DES CANDIDATURES ====================

/**
 * Récupérer toutes les candidatures pour une offre
 */
export const getApplicationsByJob = async (jobId: string): Promise<Application[]> => {
  try {
    console.log('📝 Récupération des candidatures pour l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        orderBy('createdAt', 'desc')
      )
    );

    const applications = querySnapshot.docs.map(doc => convertFirestoreApplication(doc));
    console.log('✅ Candidatures récupérées:', applications.length);
    
    return applications;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidatures:', error);
    throw new Error('Impossible de récupérer les candidatures');
  }
};

/**
 * Récupérer toutes les candidatures d'un travailleur
 */
export const getApplicationsByWorker = async (workerId: string): Promise<Application[]> => {
  try {
    console.log('📝 Récupération des candidatures du travailleur:', workerId);
    
    if (!workerId) {
      throw new Error('ID du travailleur manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('workerId', '==', workerId),
        orderBy('createdAt', 'desc')
      )
    );

    const applications = querySnapshot.docs.map(doc => convertFirestoreApplication(doc));
    console.log('✅ Candidatures du travailleur récupérées:', applications.length);
    
    return applications;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidatures du travailleur:', error);
    throw new Error('Impossible de récupérer les candidatures du travailleur');
  }
};

/**
 * Récupérer toutes les candidatures reçues par un employeur
 */
export const getApplicationsByEmployer = async (employerId: string): Promise<Application[]> => {
  try {
    console.log('📝 Récupération des candidatures pour l\'employeur:', employerId);
    
    if (!employerId) {
      throw new Error('ID de l\'employeur manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('employerId', '==', employerId),
        orderBy('createdAt', 'desc')
      )
    );

    const applications = querySnapshot.docs.map(doc => convertFirestoreApplication(doc));
    console.log('✅ Candidatures de l\'employeur récupérées:', applications.length);
    
    return applications;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidatures de l\'employeur:', error);
    throw new Error('Impossible de récupérer les candidatures de l\'employeur');
  }
};

/**
 * Récupérer une candidature par son ID
 */
export const getApplicationById = async (applicationId: string): Promise<Application | null> => {
  try {
    console.log('📝 Récupération de la candidature:', applicationId);
    
    if (!applicationId) {
      throw new Error('ID de la candidature manquant');
    }

    const docSnap = await getDoc(doc(db, 'applications', applicationId));
    
    if (!docSnap.exists()) {
      console.log('⚠️ Candidature non trouvée:', applicationId);
      return null;
    }

    const application = convertFirestoreApplication(docSnap);
    console.log('✅ Candidature récupérée');
    
    return application;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la candidature:', error);
    throw new Error('Impossible de récupérer la candidature');
  }
};

// ==================== MODIFICATION DES CANDIDATURES ====================

/**
 * Mettre à jour le statut d'une candidature
 */
export const updateApplicationStatus = async (
  applicationId: string,
  status: Application['status'],
  employerResponse?: string
): Promise<void> => {
  try {
    console.log('📝 Mise à jour du statut de la candidature:', applicationId, 'vers', status);
    
    if (!applicationId) {
      throw new Error('ID de la candidature manquant');
    }

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (employerResponse) {
      updateData.employerResponse = employerResponse;
      updateData.responseDate = new Date();
    }

    await updateDoc(doc(db, 'applications', applicationId), updateData);
    
    console.log('✅ Statut de la candidature mis à jour');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du statut:', error);
    throw new Error('Impossible de mettre à jour le statut de la candidature');
  }
};

/**
 * Marquer une candidature comme vue par l'employeur
 */
export const markApplicationAsViewed = async (applicationId: string): Promise<void> => {
  try {
    console.log('📝 Marquage de la candidature comme vue:', applicationId);
    
    await updateDoc(doc(db, 'applications', applicationId), {
      viewedByEmployer: true,
      updatedAt: new Date(),
    });
    
    console.log('✅ Candidature marquée comme vue');
  } catch (error) {
    console.error('❌ Erreur lors du marquage de la candidature:', error);
    // Ne pas faire échouer l'opération pour le marquage
  }
};

/**
 * Retirer une candidature (par le travailleur)
 */
export const withdrawApplication = async (applicationId: string, workerId: string): Promise<void> => {
  try {
    console.log('📝 Retrait de la candidature:', applicationId);
    
    // Vérifier que la candidature appartient au travailleur
    const application = await getApplicationById(applicationId);
    if (!application) {
      throw new Error('Candidature non trouvée');
    }
    
    if (application.workerId !== workerId) {
      throw new Error('Vous n\'êtes pas autorisé à retirer cette candidature');
    }
    
    if (application.status !== 'pending') {
      throw new Error('Vous ne pouvez retirer que les candidatures en attente');
    }

    // Mettre à jour le statut
    await updateApplicationStatus(applicationId, 'withdrawn');
    
    // Retirer de la liste des candidats de l'offre
    await updateJobApplicants(application.jobId, workerId, 'remove');
    
    console.log('✅ Candidature retirée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du retrait de la candidature:', error);
    throw new Error('Impossible de retirer la candidature');
  }
};

// ==================== VÉRIFICATIONS ====================

/**
 * Vérifier si un travailleur a déjà postulé pour une offre
 */
export const hasWorkerApplied = async (jobId: string, workerId: string): Promise<boolean> => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        where('workerId', '==', workerId),
        where('status', 'in', ['pending', 'accepted'])
      )
    );

    return querySnapshot.docs.length > 0;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la candidature:', error);
    return false;
  }
};

// ==================== STATISTIQUES ====================

/**
 * Récupérer les statistiques des candidatures pour un employeur
 */
export const getEmployerApplicationStats = async (employerId: string): Promise<ApplicationStats> => {
  try {
    console.log('📝 Calcul des statistiques des candidatures pour l\'employeur:', employerId);
    
    const applications = await getApplicationsByEmployer(employerId);
    
    const stats: ApplicationStats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    };
    
    console.log('✅ Statistiques calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques des candidatures');
  }
};

/**
 * Récupérer les statistiques des candidatures pour un travailleur
 */
export const getWorkerApplicationStats = async (workerId: string): Promise<ApplicationStats> => {
  try {
    console.log('📝 Calcul des statistiques des candidatures pour le travailleur:', workerId);
    
    const applications = await getApplicationsByWorker(workerId);
    
    const stats: ApplicationStats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      acceptedApplications: applications.filter(app => app.status === 'accepted').length,
      rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    };
    
    console.log('✅ Statistiques calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques des candidatures');
  }
};

// ==================== UTILITAIRES ====================

/**
 * Convertir un document Firestore en objet Application
 */
function convertFirestoreApplication(docSnap: any): Application {
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    jobId: data.jobId,
    workerId: data.workerId,
    employerId: data.employerId,
    workerProfile: data.workerProfile,
    jobTitle: data.jobTitle,
    message: data.message,
    proposedRate: data.proposedRate,
    attachments: data.attachments || [],
    status: data.status,
    viewedByEmployer: data.viewedByEmployer || false,
    employerResponse: data.employerResponse,
    responseDate: data.responseDate?.toDate ? data.responseDate.toDate() : undefined,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
  };
}

/**
 * Mettre à jour la liste des candidats dans une offre
 */
async function updateJobApplicants(jobId: string, workerId: string, action: 'add' | 'remove'): Promise<void> {
  try {
    // Importer dynamiquement pour éviter les dépendances circulaires
    const { getJobById, updateJob } = await import('./jobServiceComplete');
    
    const job = await getJobById(jobId);
    if (!job) {
      throw new Error('Offre non trouvée');
    }

    let updatedApplicants = [...job.applicants];
    
    if (action === 'add' && !updatedApplicants.includes(workerId)) {
      updatedApplicants.push(workerId);
    } else if (action === 'remove') {
      updatedApplicants = updatedApplicants.filter(id => id !== workerId);
    }

    await updateJob(jobId, { applicants: updatedApplicants });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des candidats de l\'offre:', error);
    // Ne pas faire échouer l'opération principale
  }
}

/**
 * Valider les données d'une candidature
 */
export function validateApplicationData(data: Partial<Application>): string[] {
  const errors: string[] = [];
  
  if (!data.jobId) {
    errors.push('ID de l\'offre manquant');
  }
  
  if (!data.workerId) {
    errors.push('ID du travailleur manquant');
  }
  
  if (!data.message?.trim()) {
    errors.push('Le message est obligatoire');
  }
  
  if (data.proposedRate && data.proposedRate <= 0) {
    errors.push('Le tarif proposé doit être supérieur à 0');
  }
  
  return errors;
}

/**
 * Formater le statut d'une candidature pour l'affichage
 */
export function formatApplicationStatus(status: Application['status']): string {
  const statusMap = {
    pending: 'En attente',
    accepted: 'Acceptée',
    rejected: 'Rejetée',
    withdrawn: 'Retirée',
  };
  
  return statusMap[status] || status;
}

/**
 * Obtenir la couleur du statut pour l'affichage
 */
export function getApplicationStatusColor(status: Application['status']): string {
  const colorMap = {
    pending: 'text-yellow-600 bg-yellow-100',
    accepted: 'text-green-600 bg-green-100',
    rejected: 'text-red-600 bg-red-100',
    withdrawn: 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}
