# Configuration Firestore pour JobCamer

## ✅ Vérifier que Firestore est Créé

### Étape 1 : Ouvrir Firebase Console

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne le projet **JobCamer**
3. Dans le menu de gauche, cherche **Firestore Database**
4. Clique sur **Firestore Database**

### Étape 2 : Créer Firestore (si nécessaire)

Si tu vois un bouton **"Create database"** :

1. Clique sur **"Create database"**
2. Sélectionne **"Start in test mode"** (pour développement)
3. Sélectionne la région la plus proche (ex: Europe)
4. Clique sur **"Create"**

⚠️ **Important** : En test mode, n'importe qui peut lire/écrire. À la production, utilise les règles de sécurité !

### Étape 3 : Vérifier que Firestore est Créé

Tu devrais voir une interface avec :
- Un bouton **"Start collection"**
- Un message "No documents"

---

## 🔐 Configurer les Règles de Sécurité

### Étape 1 : Ouvrir les Règles

1. Dans Firestore Database, clique sur l'onglet **"Rules"**
2. Tu verras le code des règles actuelles

### Étape 2 : Remplacer les Règles

Remplace le contenu par :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre à chacun de lire/écrire son propre profil
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Permettre à tout le monde de lire les offres d'emploi
    match /jobs/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permettre à chacun de lire ses notifications
    match /notifications/{userId}/items/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Permettre les conversations
    match /conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permettre les messages
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permettre les avis
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Étape 3 : Publier les Règles

1. Clique sur le bouton **"Publish"** en bas à droite
2. Confirme en cliquant sur **"Publish"**
3. Tu devrais voir un message "Rules updated successfully"

---

## 📋 Vérifier la Structure des Collections

### Collection "users"

Chaque document dans "users" doit avoir cette structure :

```json
{
  "id": "user123",
  "email": "jean@example.com",
  "firstName": "Jean",
  "lastName": "Kamga",
  "role": "worker",
  "phone": "6XXXXXXXX",
  "category": "construction",
  "bio": "Je suis un maçon expérimenté",
  "location": {
    "city": "Yaoundé",
    "district": ""
  },
  "verified": false,
  "premium": false,
  "createdAt": "2024-11-11T20:00:00Z",
  "rating": 0,
  "totalJobs": 0,
  "totalJobsPosted": 0
}
```

### Vérifier les Documents

1. Va dans Firestore Database
2. Clique sur la collection **"users"**
3. Tu devrais voir les utilisateurs créés
4. Clique sur un utilisateur pour voir ses détails

---

## 🧪 Tester Firestore

### Test 1 : Créer un Utilisateur

1. Va sur `/register`
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Complète le stepper d'onboarding
5. Va dans Firestore Database
6. Clique sur la collection **"users"**
7. Tu devrais voir un nouveau document avec l'ID de l'utilisateur

### Test 2 : Lire un Utilisateur

1. Va sur `/login`
2. Connecte-toi avec un email existant
3. Ouvre la Console (F12)
4. Tu devrais voir "Profil trouvé, redirection vers accueil"

### Test 3 : Mettre à Jour un Utilisateur

1. Va sur `/profile` (si implémenté)
2. Modifie les informations
3. Clique sur "Enregistrer"
4. Va dans Firestore Database
5. Vérifie que les données sont mises à jour

---

## ⚠️ Problèmes Courants

### Erreur : "Permission denied"

**Cause** : Les règles de sécurité ne permettent pas l'accès

**Solution** :
1. Vérifie que tu es connecté à Firebase
2. Vérifie que l'utilisateur est authentifié
3. Vérifie que les règles permettent l'accès

### Erreur : "Document not found"

**Cause** : Le document n'existe pas dans Firestore

**Solution** :
1. Vérifie que l'utilisateur a complété le stepper d'onboarding
2. Vérifie que le profil a été créé dans Firestore
3. Ouvre la Console (F12) pour voir les erreurs

### Erreur : "Collection not found"

**Cause** : La collection "users" n'existe pas

**Solution** :
1. Crée la collection manuellement :
   - Va dans Firestore Database
   - Clique sur **"Start collection"**
   - Nomme-la "users"
   - Ajoute un document avec l'ID "temp"
   - Supprime le document "temp"
2. Ou crée un utilisateur via l'application (la collection sera créée automatiquement)

---

## 📊 Vérifier les Données

### Voir Tous les Utilisateurs

1. Va dans Firestore Database
2. Clique sur la collection **"users"**
3. Tu verras tous les documents avec leurs données

### Voir un Utilisateur Spécifique

1. Va dans Firestore Database
2. Clique sur la collection **"users"**
3. Clique sur un document
4. Tu verras tous les champs et leurs valeurs

### Supprimer un Utilisateur

1. Va dans Firestore Database
2. Clique sur la collection **"users"**
3. Clique sur un document
4. Clique sur le bouton **"Delete"** en haut à droite
5. Confirme en cliquant sur **"Delete"**

---

## 🚀 Prochaines Étapes

1. ✅ Crée Firestore
2. ✅ Configure les règles de sécurité
3. ✅ Teste la création d'utilisateurs
4. ✅ Teste la lecture d'utilisateurs
5. ✅ Teste la mise à jour d'utilisateurs

---

## 📞 Support

Si tu as des problèmes :

1. Consulte `DEBUG_GUIDE.md`
2. Consulte `FIREBASE_TROUBLESHOOTING.md`
3. Ouvre la Console du Navigateur (F12)
4. Vérifie les logs Firebase
5. Consulte la [documentation Firestore](https://firebase.google.com/docs/firestore)
