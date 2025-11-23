import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Compter le nombre de candidatures pour une offre
 */
export const getJobApplicationsCount = async (jobId: string): Promise<number> => {
  try {
    console.log('📊 Comptage des candidatures pour l\'offre:', jobId);
    
    if (!jobId) {
      return 0;
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        where('status', 'in', ['pending', 'accepted'])
      )
    );

    const count = querySnapshot.docs.length;
    console.log('✅ Nombre de candidatures trouvées:', count);
    
    return count;
  } catch (error) {
    console.error('❌ Erreur lors du comptage des candidatures:', error);
    return 0;
  }
};

/**
 * Compter le nombre de candidatures pour plusieurs offres
 */
export const getMultipleJobsApplicationsCount = async (jobIds: string[]): Promise<{[jobId: string]: number}> => {
  try {
    console.log('📊 Comptage des candidatures pour plusieurs offres:', jobIds.length);
    
    const counts: {[jobId: string]: number} = {};
    
    // Initialiser tous les compteurs à 0
    jobIds.forEach(jobId => {
      counts[jobId] = 0;
    });

    if (jobIds.length === 0) {
      return counts;
    }

    // Récupérer toutes les candidatures pour ces offres
    const querySnapshot = await getDocs(
      query(
        collection(db, 'applications'),
        where('jobId', 'in', jobIds),
        where('status', 'in', ['pending', 'accepted'])
      )
    );

    // Compter les candidatures par offre
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const jobId = data.jobId;
      if (counts.hasOwnProperty(jobId)) {
        counts[jobId]++;
      }
    });

    console.log('✅ Comptages calculés:', counts);
    return counts;
  } catch (error) {
    console.error('❌ Erreur lors du comptage multiple:', error);
    return {};
  }
};

/**
 * Mettre à jour les statistiques d'une offre
 */
export const updateJobStats = async (jobId: string): Promise<{applications: number, views: number}> => {
  try {
    const applicationsCount = await getJobApplicationsCount(jobId);
    
    // Pour les vues, on peut les récupérer depuis le document job
    // ou utiliser un compteur séparé
    const views = 0; // À implémenter si nécessaire
    
    return {
      applications: applicationsCount,
      views: views
    };
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des stats:', error);
    return { applications: 0, views: 0 };
  }
};
