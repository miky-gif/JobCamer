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
  limit,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour une notification
export interface Notification {
  id: string;
  userId: string; // Destinataire de la notification
  type: 'job_application' | 'application_accepted' | 'application_rejected' | 'job_completed' | 'payment_received' | 'message_received';
  title: string;
  message: string;
  data: {
    jobId?: string;
    applicationId?: string;
    workerId?: string;
    employerId?: string;
    amount?: number;
    conversationId?: string;
  };
  read: boolean;
  actionUrl?: string; // URL vers laquelle rediriger quand on clique
  createdAt: Date;
  expiresAt?: Date; // Optionnel : date d'expiration
}

// Types de notifications
export type NotificationType = Notification['type'];

// ==================== CRÉATION DE NOTIFICATIONS ====================

/**
 * Créer une nouvelle notification
 */
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data: Notification['data'] = {},
  actionUrl?: string,
  expiresAt?: Date
): Promise<string> => {
  try {
    console.log('📝 Création d\'une notification pour l\'utilisateur:', userId);
    
    if (!userId || !type || !title || !message) {
      throw new Error('Données manquantes pour créer la notification');
    }

    const notificationData = {
      userId,
      type,
      title: title.trim(),
      message: message.trim(),
      data: data || {},
      read: false,
      actionUrl,
      expiresAt,
      createdAt: new Date(),
    };

    console.log('📝 Données de notification préparées');

    const docRef = await addDoc(collection(db, 'notifications'), notificationData);
    
    console.log('✅ Notification créée avec succès:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la notification:', error);
    throw new Error(`Impossible de créer la notification: ${error.message}`);
  }
};

/**
 * Créer une notification de nouvelle candidature
 */
export const createJobApplicationNotification = async (
  employerId: string,
  jobId: string,
  jobTitle: string,
  applicationId: string,
  workerName: string
): Promise<string> => {
  return createNotification(
    employerId,
    'job_application',
    'Nouvelle candidature',
    `${workerName} a postulé pour votre offre "${jobTitle}"`,
    { jobId, applicationId },
    `/employer-dashboard?job=${jobId}&tab=applications`
  );
};

/**
 * Créer une notification d'acceptation de candidature
 */
export const createApplicationAcceptedNotification = async (
  workerId: string,
  jobId: string,
  jobTitle: string,
  applicationId: string,
  employerName: string
): Promise<string> => {
  return createNotification(
    workerId,
    'application_accepted',
    'Candidature acceptée !',
    `${employerName} a accepté votre candidature pour "${jobTitle}"`,
    { jobId, applicationId },
    `/job/${jobId}`
  );
};

/**
 * Créer une notification de rejet de candidature
 */
export const createApplicationRejectedNotification = async (
  workerId: string,
  jobId: string,
  jobTitle: string,
  applicationId: string,
  employerName: string,
  reason?: string
): Promise<string> => {
  const message = reason 
    ? `${employerName} a rejeté votre candidature pour "${jobTitle}". Raison: ${reason}`
    : `${employerName} a rejeté votre candidature pour "${jobTitle}"`;
    
  return createNotification(
    workerId,
    'application_rejected',
    'Candidature rejetée',
    message,
    { jobId, applicationId },
    `/job/${jobId}`
  );
};

/**
 * Créer une notification de travail terminé
 */
export const createJobCompletedNotification = async (
  employerId: string,
  workerId: string,
  jobId: string,
  jobTitle: string,
  workerName: string
): Promise<void> => {
  // Notification pour l'employeur
  await createNotification(
    employerId,
    'job_completed',
    'Travail terminé',
    `${workerName} a marqué le travail "${jobTitle}" comme terminé`,
    { jobId, workerId },
    `/employer-dashboard?job=${jobId}`
  );
  
  // Notification pour le travailleur
  await createNotification(
    workerId,
    'job_completed',
    'Travail terminé',
    `Vous avez marqué le travail "${jobTitle}" comme terminé`,
    { jobId },
    `/job/${jobId}`
  );
};

/**
 * Créer une notification de paiement reçu
 */
export const createPaymentReceivedNotification = async (
  workerId: string,
  jobId: string,
  jobTitle: string,
  amount: number
): Promise<string> => {
  return createNotification(
    workerId,
    'payment_received',
    'Paiement reçu',
    `Vous avez reçu ${formatAmount(amount)} FCFA pour le travail "${jobTitle}"`,
    { jobId, amount },
    `/profile?tab=payments`
  );
};

/**
 * Créer une notification de nouveau message
 */
export const createMessageNotification = async (
  userId: string,
  senderName: string,
  conversationId: string,
  messagePreview: string
): Promise<string> => {
  return createNotification(
    userId,
    'message_received',
    'Nouveau message',
    `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`,
    { conversationId },
    `/chat?conversation=${conversationId}`
  );
};

// ==================== LECTURE DES NOTIFICATIONS ====================

/**
 * Récupérer toutes les notifications d'un utilisateur
 */
export const getUserNotifications = async (userId: string, limitCount: number = 50): Promise<Notification[]> => {
  try {
    console.log('📝 Récupération des notifications pour l\'utilisateur:', userId);
    
    if (!userId) {
      throw new Error('ID de l\'utilisateur manquant');
    }

    // Nettoyer d'abord les notifications expirées
    await cleanExpiredNotifications(userId);

    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
    );

    const notifications = querySnapshot.docs.map(doc => convertFirestoreNotification(doc));
    console.log('✅ Notifications récupérées:', notifications.length);
    
    return notifications;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications:', error);
    throw new Error('Impossible de récupérer les notifications');
  }
};

/**
 * Récupérer les notifications non lues d'un utilisateur
 */
export const getUnreadNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    console.log('📝 Récupération des notifications non lues pour l\'utilisateur:', userId);
    
    if (!userId) {
      throw new Error('ID de l\'utilisateur manquant');
    }

    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      )
    );

    const notifications = querySnapshot.docs.map(doc => convertFirestoreNotification(doc));
    console.log('✅ Notifications non lues récupérées:', notifications.length);
    
    return notifications;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des notifications non lues:', error);
    throw new Error('Impossible de récupérer les notifications non lues');
  }
};

/**
 * Compter les notifications non lues d'un utilisateur
 */
export const countUnreadNotifications = async (userId: string): Promise<number> => {
  try {
    const unreadNotifications = await getUnreadNotifications(userId);
    return unreadNotifications.length;
  } catch (error) {
    console.error('❌ Erreur lors du comptage des notifications non lues:', error);
    return 0;
  }
};

/**
 * Récupérer une notification par son ID
 */
export const getNotificationById = async (notificationId: string): Promise<Notification | null> => {
  try {
    console.log('📝 Récupération de la notification:', notificationId);
    
    if (!notificationId) {
      throw new Error('ID de la notification manquant');
    }

    const docSnap = await getDoc(doc(db, 'notifications', notificationId));
    
    if (!docSnap.exists()) {
      console.log('⚠️ Notification non trouvée:', notificationId);
      return null;
    }

    const notification = convertFirestoreNotification(docSnap);
    console.log('✅ Notification récupérée');
    
    return notification;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de la notification:', error);
    throw new Error('Impossible de récupérer la notification');
  }
};

// ==================== MODIFICATION DES NOTIFICATIONS ====================

/**
 * Marquer une notification comme lue
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    console.log('📝 Marquage de la notification comme lue:', notificationId);
    
    if (!notificationId) {
      throw new Error('ID de la notification manquant');
    }

    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
    
    console.log('✅ Notification marquée comme lue');
  } catch (error) {
    console.error('❌ Erreur lors du marquage de la notification:', error);
    throw new Error('Impossible de marquer la notification comme lue');
  }
};

/**
 * Marquer toutes les notifications d'un utilisateur comme lues
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    console.log('📝 Marquage de toutes les notifications comme lues pour l\'utilisateur:', userId);
    
    const unreadNotifications = await getUnreadNotifications(userId);
    
    const updatePromises = unreadNotifications.map(notification =>
      markNotificationAsRead(notification.id)
    );
    
    await Promise.all(updatePromises);
    
    console.log('✅ Toutes les notifications marquées comme lues');
  } catch (error) {
    console.error('❌ Erreur lors du marquage de toutes les notifications:', error);
    throw new Error('Impossible de marquer toutes les notifications comme lues');
  }
};

// ==================== SUPPRESSION DES NOTIFICATIONS ====================

/**
 * Supprimer une notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    console.log('📝 Suppression de la notification:', notificationId);
    
    if (!notificationId) {
      throw new Error('ID de la notification manquant');
    }

    await deleteDoc(doc(db, 'notifications', notificationId));
    
    console.log('✅ Notification supprimée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la notification:', error);
    throw new Error('Impossible de supprimer la notification');
  }
};

/**
 * Supprimer toutes les notifications lues d'un utilisateur
 */
export const deleteReadNotifications = async (userId: string): Promise<void> => {
  try {
    console.log('📝 Suppression des notifications lues pour l\'utilisateur:', userId);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', true)
      )
    );

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ Notifications lues supprimées:', querySnapshot.docs.length);
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des notifications lues:', error);
    throw new Error('Impossible de supprimer les notifications lues');
  }
};

/**
 * Nettoyer les notifications expirées
 */
export const cleanExpiredNotifications = async (userId: string): Promise<void> => {
  try {
    const now = new Date();
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('expiresAt', '<=', now)
      )
    );

    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    if (querySnapshot.docs.length > 0) {
      console.log('✅ Notifications expirées nettoyées:', querySnapshot.docs.length);
    }
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage des notifications expirées:', error);
    // Ne pas faire échouer l'opération principale
  }
};

// ==================== UTILITAIRES ====================

/**
 * Convertir un document Firestore en objet Notification
 */
function convertFirestoreNotification(docSnap: any): Notification {
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    read: data.read || false,
    actionUrl: data.actionUrl,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : undefined,
  };
}

/**
 * Formater un montant pour l'affichage
 */
function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

/**
 * Obtenir l'icône d'une notification selon son type
 */
export function getNotificationIcon(type: NotificationType): string {
  const iconMap = {
    job_application: '👤',
    application_accepted: '✅',
    application_rejected: '❌',
    job_completed: '🎉',
    payment_received: '💰',
    message_received: '💬',
  };
  
  return iconMap[type] || '📢';
}

/**
 * Obtenir la couleur d'une notification selon son type
 */
export function getNotificationColor(type: NotificationType): string {
  const colorMap = {
    job_application: 'text-blue-600 bg-blue-100',
    application_accepted: 'text-green-600 bg-green-100',
    application_rejected: 'text-red-600 bg-red-100',
    job_completed: 'text-purple-600 bg-purple-100',
    payment_received: 'text-yellow-600 bg-yellow-100',
    message_received: 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[type] || 'text-gray-600 bg-gray-100';
}

/**
 * Formater le temps écoulé depuis la création d'une notification
 */
export function getNotificationTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'À l\'instant';
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  } else if (diffInMinutes < 1440) { // 24 heures
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `Il y a ${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInMinutes / 1440);
    if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  }
}

/**
 * Grouper les notifications par date
 */
export function groupNotificationsByDate(notifications: Notification[]): { [date: string]: Notification[] } {
  const groups: { [date: string]: Notification[] } = {};
  
  notifications.forEach(notification => {
    const date = notification.createdAt.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });
  
  return groups;
}
