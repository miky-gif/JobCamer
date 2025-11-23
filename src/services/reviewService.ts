import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

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

// Créer un avis
export const createReview = async (
  jobId: string,
  reviewerId: string,
  reviewerName: string,
  revieweeId: string,
  rating: number,
  comment: string,
  reviewerAvatar?: string
) => {
  try {
    const docRef = await addDoc(collection(db, 'reviews'), {
      jobId,
      reviewerId,
      reviewerName,
      reviewerAvatar,
      revieweeId,
      rating,
      comment,
      createdAt: new Date(),
    });

    // Mettre à jour la note moyenne de l'utilisateur
    await updateUserRating(revieweeId);

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    throw error;
  }
};

// Récupérer les avis d'un utilisateur
export const getUserReviews = async (userId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('revieweeId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Review[];
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    throw error;
  }
};

// Récupérer les avis d'une offre
export const getJobReviews = async (jobId: string): Promise<Review[]> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('jobId', '==', jobId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Review[];
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    throw error;
  }
};

// Mettre à jour la note moyenne d'un utilisateur
const updateUserRating = async (userId: string) => {
  try {
    const reviews = await getUserReviews(userId);
    
    if (reviews.length === 0) {
      return;
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await updateDoc(doc(db, 'users', userId), {
      rating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la note:', error);
    throw error;
  }
};

// Vérifier si un avis existe déjà
export const reviewExists = async (jobId: string, reviewerId: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, 'reviews'),
      where('jobId', '==', jobId),
      where('reviewerId', '==', reviewerId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size > 0;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'avis:', error);
    throw error;
  }
};
