import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Incrémenter le nombre de vues d'une offre
 */
export const incrementJobViews = async (jobId: string): Promise<void> => {
  try {
    console.log('👁️ Incrémentation des vues pour l\'offre:', jobId);
    
    if (!jobId) {
      throw new Error('ID de l\'offre manquant');
    }

    // Incrémenter le compteur de vues
    await updateDoc(doc(db, 'jobs', jobId), {
      views: increment(1),
      updatedAt: new Date()
    });

    console.log('✅ Vues incrémentées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'incrémentation des vues:', error);
    // Ne pas faire échouer l'opération pour les vues
  }
};

/**
 * Récupérer le nombre de vues d'une offre
 */
export const getJobViews = async (jobId: string): Promise<number> => {
  try {
    if (!jobId) {
      return 0;
    }

    const docSnap = await getDoc(doc(db, 'jobs', jobId));
    
    if (!docSnap.exists()) {
      return 0;
    }

    const data = docSnap.data();
    return data.views || 0;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des vues:', error);
    return 0;
  }
};

/**
 * Marquer qu'un utilisateur a vu une offre (pour éviter les vues multiples)
 */
export const markJobAsViewed = async (jobId: string, userId: string): Promise<void> => {
  try {
    // Utiliser localStorage pour éviter les vues multiples par session
    const viewedKey = `job_viewed_${jobId}_${userId}`;
    const hasViewed = localStorage.getItem(viewedKey);
    
    if (!hasViewed) {
      await incrementJobViews(jobId);
      localStorage.setItem(viewedKey, 'true');
    }
  } catch (error) {
    console.error('❌ Erreur lors du marquage de la vue:', error);
  }
};
