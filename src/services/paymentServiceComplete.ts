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

// Interface pour un paiement
export interface Payment {
  id: string;
  jobId: string;
  employerId: string;
  workerId: string;
  amount: number;
  currency: string; // 'XAF' pour FCFA
  status: 'pending' | 'escrowed' | 'released' | 'refunded' | 'disputed' | 'cancelled';
  paymentMethod: 'mobile_money' | 'bank_transfer' | 'card' | 'crypto';
  
  // Détails du paiement
  description: string;
  reference: string; // Référence unique du paiement
  
  // Dates importantes
  createdAt: Date;
  escrowedAt?: Date; // Quand l'argent est mis en séquestre
  releasedAt?: Date; // Quand l'argent est libéré au travailleur
  refundedAt?: Date; // Quand l'argent est remboursé à l'employeur
  
  // Détails de la transaction
  transactionId?: string; // ID de la transaction externe (Mobile Money, etc.)
  fees: {
    platformFee: number; // Commission de la plateforme (%)
    paymentFee: number; // Frais de paiement (montant fixe)
    totalFees: number; // Total des frais
  };
  
  // Montants
  grossAmount: number; // Montant brut (ce que paie l'employeur)
  netAmount: number; // Montant net (ce que reçoit le travailleur)
  
  // Métadonnées
  metadata: {
    jobTitle: string;
    employerName: string;
    workerName: string;
    milestones?: PaymentMilestone[];
  };
}

// Interface pour les jalons de paiement
export interface PaymentMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  percentage: number; // Pourcentage du montant total
  status: 'pending' | 'completed' | 'approved' | 'paid';
  dueDate?: Date;
  completedAt?: Date;
  approvedAt?: Date;
  paidAt?: Date;
}

// Interface pour les statistiques de paiement
export interface PaymentStats {
  totalEarnings: number;
  totalSpent: number;
  pendingPayments: number;
  completedPayments: number;
  averageJobValue: number;
}

// Configuration des frais de la plateforme
const PLATFORM_CONFIG = {
  PLATFORM_FEE_PERCENTAGE: 5, // 5% de commission
  PAYMENT_FEE_MOBILE_MONEY: 500, // 500 FCFA pour Mobile Money
  PAYMENT_FEE_BANK_TRANSFER: 1000, // 1000 FCFA pour virement bancaire
  PAYMENT_FEE_CARD: 2.5, // 2.5% pour carte bancaire
  MIN_PAYMENT_AMOUNT: 1000, // Montant minimum 1000 FCFA
  MAX_PAYMENT_AMOUNT: 10000000, // Montant maximum 10M FCFA
};

// ==================== CRÉATION DE PAIEMENTS ====================

/**
 * Créer un nouveau paiement (mise en séquestre)
 */
export const createPayment = async (
  jobId: string,
  employerId: string,
  workerId: string,
  amount: number,
  paymentMethod: Payment['paymentMethod'],
  description: string,
  jobTitle: string,
  employerName: string,
  workerName: string,
  milestones?: PaymentMilestone[]
): Promise<string> => {
  try {
    console.log('📝 Création d\'un paiement pour le job:', jobId);
    
    // Validation des données
    if (!jobId || !employerId || !workerId || !amount || !paymentMethod) {
      throw new Error('Données manquantes pour créer le paiement');
    }

    if (amount < PLATFORM_CONFIG.MIN_PAYMENT_AMOUNT) {
      throw new Error(`Le montant minimum est de ${PLATFORM_CONFIG.MIN_PAYMENT_AMOUNT} FCFA`);
    }

    if (amount > PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT) {
      throw new Error(`Le montant maximum est de ${PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT} FCFA`);
    }

    // Calculer les frais
    const fees = calculateFees(amount, paymentMethod);
    const grossAmount = amount + fees.totalFees;
    const netAmount = amount - (amount * PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE / 100);

    // Générer une référence unique
    const reference = generatePaymentReference();

    // Préparer les données du paiement
    const paymentData = {
      jobId,
      employerId,
      workerId,
      amount,
      currency: 'XAF',
      status: 'pending' as const,
      paymentMethod,
      description: description.trim(),
      reference,
      fees,
      grossAmount,
      netAmount,
      metadata: {
        jobTitle,
        employerName,
        workerName,
        milestones: milestones || [],
      },
      createdAt: new Date(),
    };

    console.log('📝 Données de paiement préparées:', { reference, grossAmount, netAmount });

    // Créer le paiement dans Firestore
    const docRef = await addDoc(collection(db, 'payments'), paymentData);
    
    console.log('✅ Paiement créé avec succès:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Erreur lors de la création du paiement:', error);
    throw new Error(`Impossible de créer le paiement: ${error.message}`);
  }
};

/**
 * Traiter le paiement (mise en séquestre)
 */
export const processPayment = async (
  paymentId: string,
  transactionId: string
): Promise<void> => {
  try {
    console.log('📝 Traitement du paiement:', paymentId);
    
    // Simuler le traitement du paiement
    // Dans un vrai système, ici on appellerait l'API de Mobile Money, Stripe, etc.
    
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'escrowed',
      transactionId,
      escrowedAt: new Date(),
    });
    
    console.log('✅ Paiement mis en séquestre avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du traitement du paiement:', error);
    throw new Error('Impossible de traiter le paiement');
  }
};

// ==================== LIBÉRATION DE PAIEMENTS ====================

/**
 * Libérer le paiement au travailleur (quand le travail est terminé)
 */
export const releasePayment = async (
  paymentId: string,
  employerId: string
): Promise<void> => {
  try {
    console.log('📝 Libération du paiement:', paymentId);
    
    // Vérifier que le paiement existe et appartient à l'employeur
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }
    
    if (payment.employerId !== employerId) {
      throw new Error('Vous n\'êtes pas autorisé à libérer ce paiement');
    }
    
    if (payment.status !== 'escrowed') {
      throw new Error('Le paiement doit être en séquestre pour être libéré');
    }

    // Libérer le paiement
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'released',
      releasedAt: new Date(),
    });
    
    // Créer une notification pour le travailleur
    const { createPaymentReceivedNotification } = await import('./notificationServiceComplete');
    await createPaymentReceivedNotification(
      payment.workerId,
      payment.jobId,
      payment.metadata.jobTitle,
      payment.netAmount
    );
    
    console.log('✅ Paiement libéré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la libération du paiement:', error);
    throw new Error('Impossible de libérer le paiement');
  }
};

/**
 * Rembourser le paiement à l'employeur (en cas de problème)
 */
export const refundPayment = async (
  paymentId: string,
  reason: string
): Promise<void> => {
  try {
    console.log('📝 Remboursement du paiement:', paymentId);
    
    const payment = await getPaymentById(paymentId);
    if (!payment) {
      throw new Error('Paiement non trouvé');
    }
    
    if (payment.status !== 'escrowed') {
      throw new Error('Le paiement doit être en séquestre pour être remboursé');
    }

    // Rembourser le paiement
    await updateDoc(doc(db, 'payments', paymentId), {
      status: 'refunded',
      refundedAt: new Date(),
      metadata: {
        ...payment.metadata,
        refundReason: reason,
      },
    });
    
    console.log('✅ Paiement remboursé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors du remboursement:', error);
    throw new Error('Impossible de rembourser le paiement');
  }
};

// ==================== LECTURE DES PAIEMENTS ====================

/**
 * Récupérer un paiement par son ID
 */
export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  try {
    console.log('📝 Récupération du paiement:', paymentId);
    
    if (!paymentId) {
      throw new Error('ID du paiement manquant');
    }

    const docSnap = await getDoc(doc(db, 'payments', paymentId));
    
    if (!docSnap.exists()) {
      console.log('⚠️ Paiement non trouvé:', paymentId);
      return null;
    }

    const payment = convertFirestorePayment(docSnap);
    console.log('✅ Paiement récupéré');
    
    return payment;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du paiement:', error);
    throw new Error('Impossible de récupérer le paiement');
  }
};

/**
 * Récupérer les paiements d'un employeur
 */
export const getPaymentsByEmployer = async (employerId: string): Promise<Payment[]> => {
  try {
    console.log('📝 Récupération des paiements de l\'employeur:', employerId);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'payments'),
        where('employerId', '==', employerId),
        orderBy('createdAt', 'desc')
      )
    );

    const payments = querySnapshot.docs.map(doc => convertFirestorePayment(doc));
    console.log('✅ Paiements de l\'employeur récupérés:', payments.length);
    
    return payments;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paiements de l\'employeur:', error);
    throw new Error('Impossible de récupérer les paiements de l\'employeur');
  }
};

/**
 * Récupérer les paiements d'un travailleur
 */
export const getPaymentsByWorker = async (workerId: string): Promise<Payment[]> => {
  try {
    console.log('📝 Récupération des paiements du travailleur:', workerId);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'payments'),
        where('workerId', '==', workerId),
        orderBy('createdAt', 'desc')
      )
    );

    const payments = querySnapshot.docs.map(doc => convertFirestorePayment(doc));
    console.log('✅ Paiements du travailleur récupérés:', payments.length);
    
    return payments;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des paiements du travailleur:', error);
    throw new Error('Impossible de récupérer les paiements du travailleur');
  }
};

/**
 * Récupérer le paiement d'une offre
 */
export const getPaymentByJob = async (jobId: string): Promise<Payment | null> => {
  try {
    console.log('📝 Récupération du paiement pour l\'offre:', jobId);
    
    const querySnapshot = await getDocs(
      query(
        collection(db, 'payments'),
        where('jobId', '==', jobId)
      )
    );

    if (querySnapshot.docs.length === 0) {
      return null;
    }

    const payment = convertFirestorePayment(querySnapshot.docs[0]);
    console.log('✅ Paiement de l\'offre récupéré');
    
    return payment;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du paiement de l\'offre:', error);
    throw new Error('Impossible de récupérer le paiement de l\'offre');
  }
};

// ==================== STATISTIQUES ====================

/**
 * Récupérer les statistiques de paiement d'un employeur
 */
export const getEmployerPaymentStats = async (employerId: string): Promise<PaymentStats> => {
  try {
    console.log('📝 Calcul des statistiques de paiement pour l\'employeur:', employerId);
    
    const payments = await getPaymentsByEmployer(employerId);
    
    const stats: PaymentStats = {
      totalSpent: payments
        .filter(p => p.status === 'released')
        .reduce((sum, p) => sum + p.grossAmount, 0),
      totalEarnings: 0, // Les employeurs ne gagnent pas d'argent
      pendingPayments: payments.filter(p => p.status === 'pending' || p.status === 'escrowed').length,
      completedPayments: payments.filter(p => p.status === 'released').length,
      averageJobValue: payments.length > 0 
        ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length 
        : 0,
    };
    
    console.log('✅ Statistiques calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques de paiement');
  }
};

/**
 * Récupérer les statistiques de paiement d'un travailleur
 */
export const getWorkerPaymentStats = async (workerId: string): Promise<PaymentStats> => {
  try {
    console.log('📝 Calcul des statistiques de paiement pour le travailleur:', workerId);
    
    const payments = await getPaymentsByWorker(workerId);
    
    const stats: PaymentStats = {
      totalEarnings: payments
        .filter(p => p.status === 'released')
        .reduce((sum, p) => sum + p.netAmount, 0),
      totalSpent: 0, // Les travailleurs ne dépensent pas d'argent
      pendingPayments: payments.filter(p => p.status === 'pending' || p.status === 'escrowed').length,
      completedPayments: payments.filter(p => p.status === 'released').length,
      averageJobValue: payments.length > 0 
        ? payments.reduce((sum, p) => sum + p.netAmount, 0) / payments.length 
        : 0,
    };
    
    console.log('✅ Statistiques calculées:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors du calcul des statistiques:', error);
    throw new Error('Impossible de calculer les statistiques de paiement');
  }
};

// ==================== UTILITAIRES ====================

/**
 * Calculer les frais de paiement
 */
function calculateFees(amount: number, paymentMethod: Payment['paymentMethod']): Payment['fees'] {
  const platformFee = amount * PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE / 100;
  
  let paymentFee = 0;
  switch (paymentMethod) {
    case 'mobile_money':
      paymentFee = PLATFORM_CONFIG.PAYMENT_FEE_MOBILE_MONEY;
      break;
    case 'bank_transfer':
      paymentFee = PLATFORM_CONFIG.PAYMENT_FEE_BANK_TRANSFER;
      break;
    case 'card':
      paymentFee = amount * PLATFORM_CONFIG.PAYMENT_FEE_CARD / 100;
      break;
    case 'crypto':
      paymentFee = 0; // Pas de frais pour crypto
      break;
  }
  
  return {
    platformFee: PLATFORM_CONFIG.PLATFORM_FEE_PERCENTAGE,
    paymentFee,
    totalFees: platformFee + paymentFee,
  };
}

/**
 * Générer une référence unique de paiement
 */
function generatePaymentReference(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

/**
 * Convertir un document Firestore en objet Payment
 */
function convertFirestorePayment(docSnap: any): Payment {
  const data = docSnap.data();
  
  return {
    id: docSnap.id,
    jobId: data.jobId,
    employerId: data.employerId,
    workerId: data.workerId,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    paymentMethod: data.paymentMethod,
    description: data.description,
    reference: data.reference,
    transactionId: data.transactionId,
    fees: data.fees,
    grossAmount: data.grossAmount,
    netAmount: data.netAmount,
    metadata: data.metadata,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
    escrowedAt: data.escrowedAt?.toDate ? data.escrowedAt.toDate() : undefined,
    releasedAt: data.releasedAt?.toDate ? data.releasedAt.toDate() : undefined,
    refundedAt: data.refundedAt?.toDate ? data.refundedAt.toDate() : undefined,
  };
}

/**
 * Formater un montant pour l'affichage
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formater le statut d'un paiement pour l'affichage
 */
export function formatPaymentStatus(status: Payment['status']): string {
  const statusMap = {
    pending: 'En attente',
    escrowed: 'En séquestre',
    released: 'Libéré',
    refunded: 'Remboursé',
    disputed: 'En litige',
    cancelled: 'Annulé',
  };
  
  return statusMap[status] || status;
}

/**
 * Obtenir la couleur du statut pour l'affichage
 */
export function getPaymentStatusColor(status: Payment['status']): string {
  const colorMap = {
    pending: 'text-yellow-600 bg-yellow-100',
    escrowed: 'text-blue-600 bg-blue-100',
    released: 'text-green-600 bg-green-100',
    refunded: 'text-red-600 bg-red-100',
    disputed: 'text-orange-600 bg-orange-100',
    cancelled: 'text-gray-600 bg-gray-100',
  };
  
  return colorMap[status] || 'text-gray-600 bg-gray-100';
}

/**
 * Valider les données d'un paiement
 */
export function validatePaymentData(data: Partial<Payment>): string[] {
  const errors: string[] = [];
  
  if (!data.jobId) {
    errors.push('ID de l\'offre manquant');
  }
  
  if (!data.employerId) {
    errors.push('ID de l\'employeur manquant');
  }
  
  if (!data.workerId) {
    errors.push('ID du travailleur manquant');
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Le montant doit être supérieur à 0');
  }
  
  if (data.amount && data.amount < PLATFORM_CONFIG.MIN_PAYMENT_AMOUNT) {
    errors.push(`Le montant minimum est de ${PLATFORM_CONFIG.MIN_PAYMENT_AMOUNT} FCFA`);
  }
  
  if (data.amount && data.amount > PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT) {
    errors.push(`Le montant maximum est de ${PLATFORM_CONFIG.MAX_PAYMENT_AMOUNT} FCFA`);
  }
  
  if (!data.paymentMethod) {
    errors.push('Méthode de paiement manquante');
  }
  
  return errors;
}
