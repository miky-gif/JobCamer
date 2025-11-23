import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Notification, NotificationType } from '../types';

// Créer une notification
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  actionUrl?: string,
  data?: Record<string, any>
) => {
  try {
    console.log('Création notification:', { userId, type, title });
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      actionUrl,
      data: data || {},
      createdAt: new Date(),
    });
    console.log('Notification créée avec succès');
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    throw error;
  }
};

// Récupérer les notifications d'un utilisateur
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    throw error;
  }
};

// Récupérer les notifications non lues
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[];
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications non lues:', error);
    throw error;
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    throw error;
  }
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { read: true });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des notifications:', error);
    throw error;
  }
};

// Supprimer une notification
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error);
    throw error;
  }
};

// Supprimer toutes les notifications d'un utilisateur
export const deleteAllNotifications = async (userId: string) => {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des notifications:', error);
    throw error;
  }
};

// Écouter les notifications en temps réel
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Notification[];
    callback(notifications);
  });
};

// Compter les notifications non lues
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Erreur lors du comptage des notifications:', error);
    return 0;
  }
};

// ============ FONCTIONS SPÉCIALISÉES POUR CHAQUE TYPE DE NOTIFICATION ============

// Notification de création de compte
export const notifyAccountCreated = async (userId: string, userName: string) => {
  await createNotification(
    userId,
    'account_created',
    '🎉 Bienvenue sur JobCamer !',
    `Bonjour ${userName}, votre compte a été créé avec succès. Complétez votre profil pour commencer.`,
    '/profile'
  );
};

// Notification de profil complété
export const notifyProfileCompleted = async (userId: string) => {
  await createNotification(
    userId,
    'profile_completed',
    '✅ Profil complété !',
    'Félicitations ! Votre profil est maintenant complet. Vous pouvez commencer à rechercher des opportunités.',
    '/search'
  );
};

// Notification de nouvelle offre correspondante (pour travailleurs)
export const notifyNewMatchingJob = async (
  workerId: string,
  jobTitle: string,
  jobLocation: string,
  jobId: string
) => {
  await createNotification(
    workerId,
    'new_job',
    '🔥 Nouvelle offre correspondante !',
    `Une nouvelle offre "${jobTitle}" à ${jobLocation} correspond à votre profil.`,
    `/jobs/${jobId}`,
    { jobId, jobTitle, jobLocation }
  );
};

// Notification d'offre publiée (pour employeurs)
export const notifyJobPosted = async (
  employerId: string,
  jobTitle: string,
  jobId: string
) => {
  await createNotification(
    employerId,
    'job_posted',
    '📝 Offre publiée avec succès !',
    `Votre offre "${jobTitle}" a été publiée et est maintenant visible par les travailleurs.`,
    `/jobs/${jobId}`,
    { jobId, jobTitle }
  );
};

// Notification de candidature reçue (pour employeurs)
export const notifyApplicationReceived = async (
  employerId: string,
  workerName: string,
  jobTitle: string,
  jobId: string,
  applicationId: string
) => {
  await createNotification(
    employerId,
    'application_received',
    '👤 Nouvelle candidature !',
    `${workerName} a postulé pour votre offre "${jobTitle}".`,
    `/jobs/${jobId}`,
    { jobId, jobTitle, workerName, applicationId }
  );
};

// Notification de candidature acceptée (pour travailleurs)
export const notifyApplicationAccepted = async (
  workerId: string,
  jobTitle: string,
  employerName: string,
  jobId: string
) => {
  await createNotification(
    workerId,
    'application_accepted',
    '🎉 Candidature acceptée !',
    `Félicitations ! ${employerName} a accepté votre candidature pour "${jobTitle}".`,
    `/jobs/${jobId}`,
    { jobId, jobTitle, employerName }
  );
};

// Notification de candidature rejetée (pour travailleurs)
export const notifyApplicationRejected = async (
  workerId: string,
  jobTitle: string,
  jobId: string
) => {
  await createNotification(
    workerId,
    'application_rejected',
    '❌ Candidature non retenue',
    `Votre candidature pour "${jobTitle}" n'a pas été retenue cette fois-ci.`,
    '/search',
    { jobId, jobTitle }
  );
};

// Notification de travail commencé
export const notifyJobStarted = async (
  userId: string,
  jobTitle: string,
  jobId: string,
  isWorker: boolean
) => {
  const message = isWorker 
    ? `Vous avez commencé le travail "${jobTitle}". Bon courage !`
    : `Le travail "${jobTitle}" a commencé. Suivez l'avancement.`;
    
  await createNotification(
    userId,
    'job_started',
    '🚀 Travail commencé !',
    message,
    `/jobs/${jobId}`,
    { jobId, jobTitle }
  );
};

// Notification de travail terminé
export const notifyJobCompleted = async (
  userId: string,
  jobTitle: string,
  jobId: string,
  isWorker: boolean
) => {
  const message = isWorker 
    ? `Félicitations ! Vous avez terminé le travail "${jobTitle}".`
    : `Le travail "${jobTitle}" a été terminé avec succès.`;
    
  await createNotification(
    userId,
    'job_completed',
    '✅ Travail terminé !',
    message,
    `/jobs/${jobId}`,
    { jobId, jobTitle }
  );
};

// Notification de paiement envoyé (pour employeurs)
export const notifyPaymentSent = async (
  employerId: string,
  amount: number,
  workerName: string,
  jobTitle: string
) => {
  await createNotification(
    employerId,
    'payment_sent',
    '💸 Paiement envoyé',
    `Vous avez envoyé ${amount.toLocaleString()} FCFA à ${workerName} pour "${jobTitle}".`,
    '/profile',
    { amount, workerName, jobTitle }
  );
};

// Notification de paiement reçu (pour travailleurs)
export const notifyPaymentReceived = async (
  workerId: string,
  amount: number,
  employerName: string,
  jobTitle: string
) => {
  await createNotification(
    workerId,
    'payment_received',
    '💰 Paiement reçu !',
    `Vous avez reçu ${amount.toLocaleString()} FCFA de ${employerName} pour "${jobTitle}".`,
    '/profile',
    { amount, employerName, jobTitle }
  );
};

// Notification de paiement échoué
export const notifyPaymentFailed = async (
  userId: string,
  amount: number,
  reason: string
) => {
  await createNotification(
    userId,
    'payment_failed',
    '❌ Paiement échoué',
    `Le paiement de ${amount.toLocaleString()} FCFA a échoué. Raison: ${reason}`,
    '/profile',
    { amount, reason }
  );
};

// Notification d'avis reçu
export const notifyReviewReceived = async (
  userId: string,
  rating: number,
  reviewerName: string,
  jobTitle: string
) => {
  const stars = '⭐'.repeat(rating);
  await createNotification(
    userId,
    'review_received',
    '⭐ Nouvel avis reçu !',
    `${reviewerName} vous a donné ${stars} (${rating}/5) pour "${jobTitle}".`,
    '/profile',
    { rating, reviewerName, jobTitle }
  );
};

// Notification de nouveau message
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  conversationId: string
) => {
  await createNotification(
    userId,
    'message',
    '💬 Nouveau message',
    `${senderName} vous a envoyé un message.`,
    `/chat?conversation=${conversationId}`,
    { senderName, conversationId }
  );
};

// Notification de profil vérifié
export const notifyProfileVerified = async (userId: string) => {
  await createNotification(
    userId,
    'profile_verified',
    '✅ Profil vérifié !',
    'Félicitations ! Votre profil a été vérifié. Vous avez maintenant accès à plus d\'opportunités.',
    '/profile'
  );
};

// Notification de premium activé
export const notifyPremiumActivated = async (userId: string) => {
  await createNotification(
    userId,
    'premium_activated',
    '⭐ Premium activé !',
    'Votre abonnement Premium est maintenant actif. Profitez de tous les avantages !',
    '/profile'
  );
};

// Notification de premium expiré
export const notifyPremiumExpired = async (userId: string) => {
  await createNotification(
    userId,
    'premium_expired',
    '⏰ Premium expiré',
    'Votre abonnement Premium a expiré. Renouvelez pour continuer à profiter des avantages.',
    '/profile'
  );
};
