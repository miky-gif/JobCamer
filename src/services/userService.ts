import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour le profil utilisateur
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'worker' | 'employer';
  avatar?: string;
  phone?: string;
  companyName?: string;
  rating: number;
  totalJobs: number;
  totalJobsPosted: number;
  verified: boolean;
  premium: boolean;
  createdAt: Date;
}

/**
 * Récupérer le profil d'un utilisateur par son ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('📝 Récupération du profil utilisateur:', userId);
    
    if (!userId) {
      console.log('⚠️ ID utilisateur manquant');
      return null;
    }

    const docSnap = await getDoc(doc(db, 'users', userId));
    
    if (!docSnap.exists()) {
      console.log('⚠️ Profil utilisateur non trouvé:', userId);
      return null;
    }

    const data = docSnap.data();
    
    // Convertir les timestamps Firestore en Date
    const profile: UserProfile = {
      id: docSnap.id,
      firstName: data.firstName || 'Utilisateur',
      lastName: data.lastName || '',
      email: data.email || '',
      role: data.role || 'worker',
      avatar: data.avatar,
      phone: data.phone,
      companyName: data.companyName,
      rating: data.rating || 0,
      totalJobs: data.totalJobs || 0,
      totalJobsPosted: data.totalJobsPosted || 0,
      verified: data.verified || false,
      premium: data.premium || false,
      createdAt: data.createdAt?.toDate() || new Date()
    };
    
    console.log('✅ Profil utilisateur récupéré:', profile.firstName, profile.lastName);
    
    return profile;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du profil:', error);
    return null;
  }
};

/**
 * Récupérer plusieurs profils utilisateurs par leurs IDs
 */
export const getUserProfiles = async (userIds: string[]): Promise<{[userId: string]: UserProfile}> => {
  try {
    console.log('📝 Récupération de plusieurs profils:', userIds.length);
    
    const profiles: {[userId: string]: UserProfile} = {};
    
    // Récupérer chaque profil individuellement
    for (const userId of userIds) {
      try {
        const profile = await getUserProfile(userId);
        if (profile) {
          profiles[userId] = profile;
        }
      } catch (error) {
        console.error(`❌ Erreur pour le profil ${userId}:`, error);
      }
    }
    
    console.log('✅ Profils récupérés:', Object.keys(profiles).length);
    
    return profiles;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des profils:', error);
    return {};
  }
};

export default {
  getUserProfile,
  getUserProfiles
};
