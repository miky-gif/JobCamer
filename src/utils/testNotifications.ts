import { 
  createNotification, 
  notifyAccountCreated,
  getUserNotifications 
} from '../services/notificationService';

// Fonction de test pour diagnostiquer les problèmes de notifications
export const testNotificationSystem = async (userId: string) => {
  console.log('🔍 Test du système de notifications pour userId:', userId);
  
  try {
    // Test 1: Créer une notification simple
    console.log('📝 Test 1: Création d\'une notification simple...');
    await createNotification(
      userId,
      'account_created',
      'Test de notification',
      'Ceci est un test du système de notifications',
      '/profile'
    );
    console.log('✅ Test 1: Notification simple créée avec succès');
    
    // Test 2: Utiliser la fonction spécialisée
    console.log('📝 Test 2: Utilisation de notifyAccountCreated...');
    await notifyAccountCreated(userId, 'Utilisateur Test');
    console.log('✅ Test 2: notifyAccountCreated exécutée avec succès');
    
    // Test 3: Récupérer les notifications
    console.log('📝 Test 3: Récupération des notifications...');
    const notifications = await getUserNotifications(userId);
    console.log('✅ Test 3: Notifications récupérées:', notifications.length);
    console.log('📋 Notifications:', notifications);
    
    return {
      success: true,
      notificationCount: notifications.length,
      notifications
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test des notifications:', error);
    return {
      success: false,
      error: (error as any).message || 'Erreur inconnue',
      details: error
    };
  }
};

// Test spécifique pour Firebase
export const testFirebaseConnection = async () => {
  console.log('🔍 Test de la connexion Firebase...');
  
  try {
    // Importer Firebase pour tester la connexion
    const { db } = await import('../config/firebase');
    const { collection, addDoc } = await import('firebase/firestore');
    
    console.log('📝 Test d\'écriture dans Firestore...');
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Test de connexion',
      timestamp: new Date()
    });
    
    console.log('✅ Test Firebase réussi, doc ID:', testDoc.id);
    return { success: true, docId: testDoc.id };
    
  } catch (error) {
    console.error('❌ Erreur de connexion Firebase:', error);
    return { success: false, error: (error as any).message || 'Erreur inconnue' };
  }
};

// Fonction pour diagnostiquer les règles Firestore
export const diagnoseFirestoreRules = () => {
  console.log('🔍 Diagnostic des règles Firestore...');
  console.log(`
📋 Règles Firestore recommandées pour les notifications:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règle pour les notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Règle pour les utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Collection de test
    match /test/{document} {
      allow read, write: if request.auth != null;
    }
  }
}

🔧 Pour appliquer ces règles:
1. Allez dans Firebase Console
2. Firestore Database > Règles
3. Copiez-collez les règles ci-dessus
4. Cliquez sur "Publier"
  `);
};
