# Correction des Règles Firestore - Candidatures

## 🚨 Problème Identifié

**Erreur** : `Missing or insufficient permissions`
**Cause** : Les règles Firestore ne permettent pas d'écrire dans la collection `applications`

---

## 🔧 Solution : Mettre à Jour les Règles Firestore

### Étape 1 : Aller dans Firebase Console

1. Ouvrez [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet JobCamer
3. Allez dans **Firestore Database**
4. Cliquez sur l'onglet **Règles** (Rules)

### Étape 2 : Remplacer les Règles

Remplacez le contenu actuel par ces règles complètes :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ==================== UTILISATEURS ====================
    match /users/{userId} {
      // Chacun peut lire/écrire son propre profil
      allow read, write: if request.auth.uid == userId;
      // Tout le monde peut lire les profils (pour afficher les candidats)
      allow read: if request.auth != null;
    }
    
    // ==================== OFFRES D'EMPLOI ====================
    match /jobs/{jobId} {
      // Tout le monde peut lire les offres
      allow read: if true;
      // Seuls les utilisateurs connectés peuvent créer des offres
      allow create: if request.auth != null;
      // Seul le créateur peut modifier/supprimer son offre
      allow update, delete: if request.auth.uid == resource.data.employerId;
    }
    
    // ==================== CANDIDATURES ====================
    match /applications/{applicationId} {
      // Tout utilisateur connecté peut créer une candidature
      allow create: if request.auth != null;
      
      // Le travailleur peut lire ses propres candidatures
      allow read: if request.auth.uid == resource.data.workerId;
      
      // L'employeur peut lire les candidatures pour ses offres
      allow read: if request.auth.uid == resource.data.employerId;
      
      // L'employeur peut modifier le statut des candidatures
      allow update: if request.auth.uid == resource.data.employerId;
      
      // Le travailleur peut retirer sa candidature
      allow update: if request.auth.uid == resource.data.workerId 
                    && request.resource.data.status == 'withdrawn';
    }
    
    // ==================== CONVERSATIONS ====================
    match /conversations/{conversationId} {
      // Les participants peuvent lire/écrire dans leurs conversations
      allow read, write: if request.auth.uid in resource.data.participants;
      // Créer une conversation si l'utilisateur est un participant
      allow create: if request.auth.uid in request.resource.data.participants;
    }
    
    // ==================== MESSAGES ====================
    match /messages/{messageId} {
      // Seuls les utilisateurs connectés peuvent créer des messages
      allow create: if request.auth != null;
      // Tout le monde peut lire les messages (filtrage côté client)
      allow read: if request.auth != null;
    }
    
    // ==================== NOTIFICATIONS ====================
    match /notifications/{notificationId} {
      // Chacun peut lire ses propres notifications
      allow read: if request.auth.uid == resource.data.userId;
      // Tout utilisateur connecté peut créer des notifications
      allow create: if request.auth != null;
      // Chacun peut modifier ses propres notifications (marquer comme lu)
      allow update: if request.auth.uid == resource.data.userId;
      // Chacun peut supprimer ses propres notifications
      allow delete: if request.auth.uid == resource.data.userId;
    }
    
    // ==================== AVIS/ÉVALUATIONS ====================
    match /reviews/{reviewId} {
      // Tout le monde peut lire les avis
      allow read: if true;
      // Seuls les utilisateurs connectés peuvent créer des avis
      allow create: if request.auth != null;
      // Seul le créateur peut modifier son avis
      allow update: if request.auth.uid == resource.data.reviewerId;
    }
  }
}
```

### Étape 3 : Publier les Règles

1. Cliquez sur **Publier** (Publish)
2. Confirmez la publication

---

## 🧪 Test des Règles

### Test 1 : Vérifier les Règles

1. Dans Firebase Console → Firestore → Règles
2. Cliquez sur **Simulateur de règles** (Rules Playground)
3. Testez cette configuration :
   ```
   Collection: applications
   Document: test123
   Opération: create
   Authentifié: Oui
   UID: user123
   ```
4. ✅ Doit afficher "Autorisé"

### Test 2 : Tester la Candidature

1. Rechargez votre application (F5)
2. Connectez-vous en tant que travailleur
3. Allez sur une offre d'emploi
4. Cliquez "Postuler"
5. Remplissez le formulaire
6. Cliquez "Envoyer"
7. ✅ Doit afficher "Candidature envoyée avec succès"

---

## 🔍 Vérification des Logs

Après avoir mis à jour les règles, vous devriez voir dans la console :

```
📝 Création d'une candidature pour l'offre: job123
📝 Données de candidature préparées
✅ Candidature créée avec ID: app456
✅ Notification envoyée à l'employeur
✅ Candidature créée avec succès: app456
✅ Candidature envoyée avec succès
```

Au lieu de :
```
❌ Erreur lors de la création de la candidature: Missing or insufficient permissions
```

---

## 📋 Checklist de Vérification

- [ ] Règles Firestore mises à jour
- [ ] Règles publiées dans Firebase Console
- [ ] Application rechargée (F5)
- [ ] Test de candidature effectué
- [ ] Logs de succès dans la console
- [ ] Candidature visible dans le dashboard employeur

---

## 🚨 Si le Problème Persiste

### Vérification 1 : Authentification

Vérifiez que l'utilisateur est bien connecté :
```javascript
// Dans la console du navigateur (F12)
console.log('User:', firebase.auth().currentUser);
```

### Vérification 2 : Structure des Données

Vérifiez que les données envoyées sont correctes :
```javascript
// Les logs devraient montrer :
console.log('📝 Données de candidature préparées');
```

### Vérification 3 : Collection Firestore

Vérifiez que la collection `applications` existe dans Firestore :
1. Firebase Console → Firestore → Données
2. Cherchez la collection `applications`
3. Si elle n'existe pas, elle sera créée automatiquement

---

## 📞 Support

Si le problème persiste après ces étapes :

1. **Vérifiez les logs** dans la console (F12)
2. **Vérifiez l'authentification** (utilisateur connecté ?)
3. **Vérifiez les règles** (bien publiées ?)
4. **Rechargez la page** (F5)

---

**Cette correction devrait résoudre complètement le problème de permissions !** ✅
