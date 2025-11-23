import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour une vue
export interface JobView {
  id: string;
  jobId: string;
  viewerId?: string; // ID de l'utilisateur qui a vu (optionnel pour les anonymes)
  viewerType: 'worker' | 'employer' | 'anonymous';
  ipAddress?: string; // Pour éviter les vues multiples du même IP
  userAgent?: string; // Informations sur le navigateur
  referrer?: string; // D'où vient le visiteur
  createdAt: Date;
  sessionId?: string; // Pour grouper les vues d'une même session
}

// Interface pour les statistiques de vues
export interface ViewStats {
  totalViews: number;
  uniqueViews: number;
  workerViews: number;
  employerViews: number;
  anonymousViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
}

// ==================== ENREGISTREMENT DES VUES ====================

/**
 * Enregistrer une vue d'offre
 */
export const recordJobView = async (
  jobId: string,
  viewerId?: string,
  viewerType: JobView['viewerType'] = 'anonymous',
  ipAddress?: string,
  userAgent?: string,
  referrer?: string,
  sessionId?: string
): Promise<string> => {
  try {
    console.log('📝 Enregistrement d\'une vue pour l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    // Vérifier si cette vue n'a pas déjà été enregistrée récemment
    const isDuplicate = await checkDuplicateView(jobId, viewerId, ipAddress, sessionId);
    if (isDuplicate) {
      console.log('⚠️ Vue déjà enregistrée récemment, ignorée');
      return '';
    }

    // Préparer les données de la vue
    const viewData = {
      jobId,
      viewerId,
      viewerType,
      ipAddress,
      userAgent,
      referrer,
      sessionId,
      createdAt: new Date(),
    };

    console.log('📝 Données de vue préparées');

    // Enregistrer la vue
    const docRef = await addDoc(collection(db, 'jobViews'), viewData);
    
    // Incrémenter le compteur de vues dans l'offre
    await incrementJobViewCount(jobId);
    
    console.log('✅ Vue enregistrée avec succès:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'enregistrement de la vue:', error);
    // Ne pas faire échouer l'opération principale pour les vues
    return '';
  }
};

/**
 * Enregistrer une vue simple (méthode rapide)
 */
export const recordSimpleJobView = async (
  jobId: string,
  userId?: string,
  userRole?: 'worker' | 'employer'
): Promise<void> => {
  try {
    const viewerType = userRole || 'anonymous';
    const sessionId = generateSessionId();
    
    await recordJobView(
      jobId,
      userId,
      viewerType,
      undefined, // IP sera récupérée côté serveur si nécessaire
      navigator.userAgent,
      document.referrer,
      sessionId
    );
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de la vue simple:', error);
    // Ne pas faire échouer l'opération principale
  }
};

// ==================== LECTURE DES VUES ====================

/**
 * Récupérer toutes les vues d'une offre
 */
export const getJobViews = async (jobId: string, limitCount: number = 100): Promise<JobView[]> => {
  try {
    console.log('📝 Récupération des vues pour l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobViews'),
        where('jobId', '==', jobId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    );

    const views = querySnapshot.docs.map(doc => convertFirestoreView(doc));
    console.log('✅ Vues récupérées:', views.length);
    
    return views;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vues:', error);
    throw new Error('Impossible de récupérer les vues');
  }
};

/**
 * Récupérer les vues d'un utilisateur
 */
export const getUserViews = async (userId: string, limitCount: number = 50): Promise<JobView[]> => {
  try {
    console.log('📝 Récupération des vues de l\'utilisateur:', userId);
    
    if (!userId) {
      throw new Error('ID de l\'utilisateur manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobViews'),
        where('viewerId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    );

    const views = querySnapshot.docs.map(doc => convertFirestoreView(doc));
    console.log('✅ Vues de l\'utilisateur récupérées:', views.length);
    
    return views;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vues de l\'utilisateur:', error);
    throw new Error('Impossible de récupérer les vues de l\'utilisateur');
  }
};

// ==================== STATISTIQUES DES VUES ====================

/**
 * Calculer les statistiques de vues pour une offre
 */
export const getJobViewStats = async (jobId: string): Promise<ViewStats> => {
  try {
    console.log('📝 Calcul des statistiques de vues pour l\'offre:', jobId);
    
    const views = await getJobViews(jobId, 1000); // Récupérer plus de vues pour les stats
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculer les vues uniques (par IP ou utilisateur)
    const uniqueViewers = new Set();
    views.forEach(view => {
      const identifier = view.viewerId || view.ipAddress || 'anonymous';
      uniqueViewers.add(identifier);
    });
    
    const stats: ViewStats = {
      totalViews: views.length,
      uniqueViews: uniqueViewers.size,
      workerViews: views.filter(v => v.viewerType === 'worker').length,
      employerViews: views.filter(v => v.viewerType === 'employer').length,
      anonymousViews: views.filter(v => v.viewerType === 'anonymous').length,
      viewsToday: views.filter(v => v.createdAt >= today).length,
      viewsThisWeek: views.filter(v => v.createdAt >= thisWeek).length,
      viewsThisMonth: views.filter(v => v.createdAt >= thisMonth).length,
    };
    
    console.log('✅ Statistiques de vues calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques de vues:', error);
    throw new Error('Impossible de calculer les statistiques de vues');
  }
};

/**
 * Récupérer les statistiques de vues pour toutes les offres d'un employeur
 */
export const getEmployerViewStats = async (employerId: string): Promise<{ [jobId: string]: ViewStats }> => {
  try {
    console.log('📝 Calcul des statistiques de vues pour l\'employeur:', employerId);
    
    // Récupérer toutes les offres de l'employeur
    const { getJobsByEmployer } = await import('./jobServiceComplete');
    const jobs = await getJobsByEmployer(employerId);
    
    // Calculer les stats pour chaque offre
    const statsPromises = jobs.map(async job => ({
      jobId: job.id,
      stats: await getJobViewStats(job.id),
    }));
    
    const results = await Promise.all(statsPromises);
    
    // Convertir en objet
    const employerStats: { [jobId: string]: ViewStats } = {};
    results.forEach(result => {
      employerStats[result.jobId] = result.stats;
    });
    
    console.log('✅ Statistiques de l\'employeur calculées');
    return employerStats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques de l\'employeur:', error);
    throw new Error('Impossible de calculer les statistiques de l\'employeur');
  }
};

// ==================== UTILITAIRES ====================

/**
 * Vérifier si une vue est un doublon
 */
async function checkDuplicateView(
  jobId: string,
  viewerId?: string,
  ipAddress?: string,
  sessionId?: string
): Promise<boolean> {
  try {
    // Vérifier les vues des 5 dernières minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    let queryConstraints = [
      where('jobId', '==', jobId),
      where('createdAt', '>=', fiveMinutesAgo),
    ];
    
    // Si on a un utilisateur connecté, vérifier par ID
    if (viewerId) {
      queryConstraints.push(where('viewerId', '==', viewerId));
    }
    // Sinon, vérifier par IP si disponible
    else if (ipAddress) {
      queryConstraints.push(where('ipAddress', '==', ipAddress));
    }
    // Ou par session ID
    else if (sessionId) {
      queryConstraints.push(where('sessionId', '==', sessionId));
    }
    
    const querySnapshot = await getDocs(
      query(collection(db, 'jobViews'), ...queryConstraints)
    );
    
    return querySnapshot.docs.length > 0;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des doublons:', error);
    return false; // En cas d'erreur, on autorise la vue
  }
}

/**
 * Incrémenter le compteur de vues dans l'offre
 */
async function incrementJobViewCount(jobId: string): Promise<void> {
  try {
    // Importer dynamiquement pour éviter les dépendances circulaires
    const { incrementJobViews } = await import('./jobServiceComplete');
    await incrementJobViews(jobId);
  } catch (error) {
    console.error('❌ Erreur lors de l\'incrémentation des vues:', error);
    // Ne pas faire échouer l'opération principale
  }
}

/**
 * Générer un ID de session unique
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convertir un document Firestore en objet JobView
 */
function convertFirestoreView(docSnap: any): JobView {
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    jobId: data.jobId,
    viewerId: data.viewerId,
    viewerType: data.viewerType,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    referrer: data.referrer,
    sessionId: data.sessionId,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
  };
}

/**
 * Obtenir les offres les plus vues
 */
export const getMostViewedJobs = async (limitCount: number = 10): Promise<{ jobId: string; views: number }[]> => {
  try {
    console.log('📝 Récupération des offres les plus vues');
    
    // Cette requête nécessiterait un index composite sur (jobId, createdAt)
    // Pour simplifier, on va récupérer toutes les vues récentes et les grouper
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobViews'),
        where('createdAt', '>=', oneWeekAgo),
        orderBy('createdAt', 'desc'),
        limit(1000)
      )
    );
    
    // Grouper par jobId
    const viewCounts: { [jobId: string]: number } = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const jobId = data.jobId;
      viewCounts[jobId] = (viewCounts[jobId] || 0) + 1;
    });
    
    // Trier par nombre de vues
    const sortedJobs = Object.entries(viewCounts)
      .map(([jobId, views]) => ({ jobId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limitCount);
    
    console.log('✅ Offres les plus vues récupérées:', sortedJobs.length);
    return sortedJobs;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des offres les plus vues:', error);
    throw new Error('Impossible de récupérer les offres les plus vues');
  }
};

/**
 * Nettoyer les anciennes vues (pour optimiser la base de données)
 */
export const cleanOldViews = async (daysToKeep: number = 90): Promise<number> => {
  try {
    console.log('📝 Nettoyage des anciennes vues...');
    
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'jobViews'),
        where('createdAt', '<', cutoffDate)
      )
    );
    
    // Supprimer les anciennes vues
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Anciennes vues nettoyées:', querySnapshot.docs.length);
    return querySnapshot.docs.length;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des vues:', error);
    throw new Error('Impossible de nettoyer les anciennes vues');
  }
};

/**
 * Analyser les sources de trafic
 */
export const analyzeTrafficSources = async (jobId: string): Promise<{ [source: string]: number }> => {
  try {
    console.log('📝 Analyse des sources de trafic pour l\'offre:', jobId);
    
    const views = await getJobViews(jobId, 500);
    
    const sources: { [source: string]: number } = {};
    
    views.forEach(view => {
      let source = 'Direct';
      
      if (view.referrer) {
        try {
          const referrerUrl = new URL(view.referrer);
          const hostname = referrerUrl.hostname;
          
          if (hostname.includes('google')) {
            source = 'Google';
          } else if (hostname.includes('facebook')) {
            source = 'Facebook';
          } else if (hostname.includes('twitter')) {
            source = 'Twitter';
          } else if (hostname.includes('linkedin')) {
            source = 'LinkedIn';
          } else if (hostname.includes('whatsapp')) {
            source = 'WhatsApp';
          } else {
            source = hostname;
          }
        } catch (e) {
          source = 'Autre';
        }
      }
      
      sources[source] = (sources[source] || 0) + 1;
    });
    
    console.log('✅ Sources de trafic analysées:', sources);
    return sources;
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des sources de trafic:', error);
    throw new Error('Impossible d\'analyser les sources de trafic');
  }
};
