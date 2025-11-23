import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  notifyAccountCreated, 
  notifyProfileCompleted,
  notifyNewMessage 
} from './notificationService';

// Fonction utilitaire pour créer un hash MD5 simple (pour Gravatar)
const createEmailHash = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 32); // Utiliser les 32 premiers caractères comme "MD5"
};

export interface UserProfile {
  id: string;
  phone: string;
  email?: string;
  firstName: string;
  lastName: string;
  role: 'worker' | 'employer';
  avatar?: string;
  bio?: string;
  category?: string;
  location?: {
    city: string;
    district: string;
  };
  verified: boolean;
  premium: boolean;
  createdAt: Date;
  rating?: number;
  totalJobs?: number;
  totalJobsPosted?: number;
}

// Authentification par téléphone
export const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Erreur lors de la connexion par téléphone:', error);
    throw error;
  }
};

// Vérifier le code OTP
export const verifyOTP = async (confirmationResult: any, code: string) => {
  try {
    const result = await confirmationResult.confirm(code);
    return result.user;
  } catch (error) {
    console.error('Erreur lors de la vérification du code OTP:', error);
    throw error;
  }
};

// Authentification par email
// Fonction utilitaire pour traduire les erreurs Firebase
const getErrorMessage = (error: any): string => {
  const errorCode = error.code || error.message;
  
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé',
    'auth/invalid-email': 'Email invalide',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères',
    'auth/user-not-found': 'Utilisateur non trouvé',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/invalid-credential': 'Identifiants invalides',
    'auth/user-disabled': 'Compte désactivé',
    'auth/network-request-failed': 'Erreur réseau. Vérifiez votre connexion',
    'firestore/failed-precondition': 'Firestore n\'est pas accessible. Vérifiez votre connexion Internet.',
    'firestore/unavailable': 'Firestore n\'est pas disponible. Réessayez plus tard.',
    'firestore/unauthenticated': 'Vous n\'êtes pas authentifié. Connectez-vous à nouveau.',
    'firestore/permission-denied': 'Vous n\'avez pas la permission d\'accéder à ces données.',
  };
  
  // Gérer les erreurs Firestore offline
  if (error.message && error.message.includes('offline')) {
    return 'Firestore n\'est pas accessible. Vérifiez votre connexion Internet et que Firestore est créé dans Firebase Console.';
  }
  
  return errorMessages[errorCode] || error.message || 'Une erreur est survenue';
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Créer une notification de bienvenue
    try {
      const userName = result.user.displayName || result.user.email?.split('@')[0] || 'Utilisateur';
      await notifyAccountCreated(result.user.uid, userName);
    } catch (notificationError) {
      console.error('Erreur lors de la création de la notification:', notificationError);
      // Ne pas bloquer l'inscription si la notification échoue
    }
    
    return result.user;
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error);
    const message = getErrorMessage(error);
    const err = new Error(message);
    (err as any).code = error.code;
    throw err;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error);
    const message = getErrorMessage(error);
    const err = new Error(message);
    (err as any).code = error.code;
    throw err;
  }
};

// Créer un profil utilisateur
export const createUserProfile = async (user: User, profileData: Partial<UserProfile>) => {
  try {
    const userProfile: UserProfile = {
      id: user.uid,
      phone: profileData.phone || user.phoneNumber || '',
      email: profileData.email || user.email || '',
      firstName: profileData.firstName || '',
      lastName: profileData.lastName || '',
      role: profileData.role || 'worker',
      avatar: profileData.avatar,
      bio: profileData.bio,
      category: profileData.category,
      location: profileData.location,
      verified: false,
      premium: false,
      createdAt: new Date(),
      rating: 0,
      totalJobs: 0,
      totalJobsPosted: 0,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    return userProfile;
  } catch (error) {
    console.error('Erreur lors de la création du profil:', error);
    throw error;
  }
};

// Récupérer le profil utilisateur
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    console.log('Récupération du profil pour userId:', userId);
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      console.log('Profil trouvé:', userSnap.data());
      return userSnap.data() as UserProfile;
    } else {
      console.log('Aucun profil trouvé pour cet utilisateur');
      return null;
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error);
    
    // Gérer l'erreur offline
    if (error.message && error.message.includes('offline')) {
      console.error('Firestore est offline. Vérifiez que Firestore est créé dans Firebase Console.');
      const err = new Error('Firestore n\'est pas accessible. Vérifiez votre connexion Internet et que Firestore est créé dans Firebase Console.');
      throw err;
    }
    
    throw error;
  }
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: string, updates: Partial<any>) => {
  try {
    console.log('Mise à jour du profil pour userId:', userId);
    
    // Nettoyer les champs undefined
    const cleanedUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    console.log('Données à sauvegarder (nettoyées):', cleanedUpdates);
    
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, cleanedUpdates, { merge: true });
    
    // Si un rôle est ajouté, créer une notification de profil complété
    if (cleanedUpdates.role) {
      try {
        await notifyProfileCompleted(userId);
        console.log('Notification de profil complété créée');
      } catch (notificationError) {
        console.error('Erreur lors de la création de la notification:', notificationError);
        // Ne pas bloquer la mise à jour si la notification échoue
      }
    }
    
    console.log('Profil mis à jour avec succès');
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    const message = getErrorMessage(error);
    const err = new Error(message);
    (err as any).code = error.code;
    throw err;
  }
};

// Connexion avec Google
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    // Forcer la sélection du compte Google
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    
    // Sauvegarder la photo de profil Google si elle existe
    if (result.user.photoURL) {
      try {
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);
        
        // Seulement mettre à jour si l'utilisateur n'a pas déjà un avatar personnalisé
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (!userData.avatar) {
            await setDoc(userRef, {
              photoURL: result.user.photoURL,
              avatar: result.user.photoURL
            }, { merge: true });
            console.log('Photo de profil Google sauvegardée:', result.user.photoURL);
          }
        } else {
          // Nouvel utilisateur Google - créer le profil avec la photo
          await setDoc(userRef, {
            email: result.user.email,
            firstName: result.user.displayName?.split(' ')[0] || 'Utilisateur',
            lastName: result.user.displayName?.split(' ').slice(1).join(' ') || '',
            photoURL: result.user.photoURL,
            avatar: result.user.photoURL,
            createdAt: new Date(),
            verified: result.user.emailVerified,
            premium: false
          }, { merge: true });
          console.log('Nouveau profil Google créé avec photo:', result.user.photoURL);
        }
      } catch (firestoreError) {
        console.error('Erreur lors de la sauvegarde de la photo Google:', firestoreError);
      }
    }
    
    return result.user;
  } catch (error: any) {
    console.error('Erreur lors de la connexion Google:', error);
    
    // Ne pas afficher d'erreur si l'utilisateur ferme le popup
    if (error.code === 'auth/popup-closed-by-user') {
      console.log('Popup fermé par l\'utilisateur');
      throw error;
    }
    
    const message = getErrorMessage(error);
    const err = new Error(message);
    (err as any).code = error.code;
    throw err;
  }
};

// Récupérer tous les travailleurs
export const getAllWorkers = async () => {
  try {
    console.log('Récupération de tous les travailleurs...');
    
    const usersRef = collection(db, 'users');
    const workersQuery = query(usersRef, where('role', '==', 'worker'));
    const querySnapshot = await getDocs(workersQuery);
    
    const workers = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      
      // Récupérer la photo de profil Google si pas d'avatar personnalisé
      let avatar = data.avatar;
      if (!avatar) {
        try {
          // Si l'utilisateur a un photoURL dans ses données (connexion Google)
          if (data.photoURL) {
            avatar = data.photoURL;
            console.log('Photo Google trouvée pour:', data.email, avatar);
          }
          // Sinon, essayer Gravatar avec l'email
          else if (data.email) {
            // Créer un hash MD5 de l'email pour Gravatar
            const emailLower = data.email.toLowerCase().trim();
            // Pour simplifier, on utilise un service d'avatar par initiales
            const initials = `${data.firstName?.[0] || 'U'}${data.lastName?.[0] || ''}`.toUpperCase();
            avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=22c55e&color=ffffff&size=200&bold=true&rounded=true`;
            
            // Essayer aussi Gravatar en parallèle
            const gravatarUrl = `https://www.gravatar.com/avatar/${await createEmailHash(emailLower)}?s=200&d=404`;
            
            // Vérifier si Gravatar existe
            try {
              const response = await fetch(gravatarUrl, { method: 'HEAD' });
              if (response.ok) {
                avatar = gravatarUrl;
                console.log('Photo Gravatar trouvée pour:', data.email);
              }
            } catch (gravatarError) {
              console.log('Pas de Gravatar pour:', data.email);
            }
          }
        } catch (error) {
          console.log('Impossible de récupérer la photo de profil pour:', data.email, error);
          // Avatar par défaut avec initiales
          const initials = `${data.firstName?.[0] || 'U'}${data.lastName?.[0] || ''}`.toUpperCase();
          avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=22c55e&color=ffffff&size=200&bold=true&rounded=true`;
        }
      }
      
      return {
        id: doc.id,
        firstName: data.firstName || 'Utilisateur',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role,
        category: data.category || '',
        bio: data.bio || '',
        location: data.location || { city: '', district: '' },
        avatar: avatar,
        rating: data.rating || 0,
        verified: data.verified || false,
        premium: data.premium || false,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        skills: data.skills || [],
        portfolio: data.portfolio || [],
        completedJobs: data.completedJobs || 0,
        objective: data.objective || '',
        // Ajouter un champ pour indiquer si c'est un avatar généré
        avatarGenerated: !data.avatar
      };
    }));
    
    console.log(`${workers.length} travailleurs trouvés:`, workers);
    return workers;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des travailleurs:', error);
    const message = getErrorMessage(error);
    throw new Error(message);
  }
};

// Récupérer tous les employeurs
export const getAllEmployers = async () => {
  try {
    console.log('Récupération de tous les employeurs...');
    
    const usersRef = collection(db, 'users');
    const employersQuery = query(usersRef, where('role', '==', 'employer'));
    const querySnapshot = await getDocs(employersQuery);
    
    const employers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName || 'Utilisateur',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role,
        companyName: data.companyName || '',
        companyDescription: data.companyDescription || '',
        website: data.website || '',
        location: data.location || { city: '', district: '' },
        avatar: data.avatar,
        verified: data.verified || false,
        premium: data.premium || false,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        cniNumber: data.cniNumber || '',
        cniImages: data.cniImages || []
      };
    });
    
    console.log(`${employers.length} employeurs trouvés:`, employers);
    return employers;
  } catch (error: any) {
    console.error('Erreur lors de la récupération des employeurs:', error);
    const message = getErrorMessage(error);
    throw new Error(message);
  }
};

// Déconnexion
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    throw error;
  }
};
