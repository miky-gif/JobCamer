# Diagnostic Firestore - Erreur "Offline"

## Problème Observé

```
Erreur: FirebaseError: Failed to get document because the client is offline.
```

Cela signifie que **Firestore n'est pas accessible** depuis ton application.

## Causes Possibles

### 1. ❌ Firestore n'est pas créé

**Vérification** :
1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne le projet **JobCamer**
3. Va dans le menu de gauche → **Firestore Database**
4. Si tu vois un bouton **"Create database"**, c'est le problème !

**Solution** :
1. Clique sur **"Create database"**
2. Sélectionne **"Start in test mode"**
3. Sélectionne la région (Europe)
4. Clique sur **"Create"**

### 2. ❌ Les règles de sécurité bloquent l'accès

**Vérification** :
1. Va dans Firestore Database → **Rules**
2. Cherche les règles actuelles

**Solution** :
Remplace les règles par :

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
    
    // Permettre les conversations
    match /conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permettre les messages
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Permettre les notifications
    match /notifications/{userId}/items/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Permettre les avis
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Puis clique sur **"Publish"**.

### 3. ❌ Problème de connectivité réseau

**Vérification** :
1. Ouvre la Console (F12)
2. Va dans l'onglet **Network**
3. Cherche les requêtes vers `firestore.googleapis.com`
4. Vérifie qu'elles ne sont pas en erreur

**Solution** :
- Vérifie ta connexion Internet
- Essaie de recharger la page (F5)
- Essaie dans un autre navigateur

### 4. ❌ Configuration Firebase incorrecte

**Vérification** :
1. Va dans Firebase Console → Paramètres du projet
2. Copie les credentials
3. Vérifie que `src/config/firebase.ts` a les bonnes valeurs

**Solution** :
Crée un fichier `.env.local` :

```
VITE_FIREBASE_API_KEY=AIzaSyDMcHjBsHmAO6gduKaNTpaeH7nZTnynCnY
VITE_FIREBASE_AUTH_DOMAIN=jobcamer-65a6d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jobcamer-65a6d
VITE_FIREBASE_STORAGE_BUCKET=jobcamer-65a6d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=900433308527
VITE_FIREBASE_APP_ID=1:900433308527:web:343b7cae9fa3b3ef50969a
```

## Checklist de Diagnostic

### Étape 1 : Vérifier Firestore

- [ ] Firestore est créé dans Firebase Console
- [ ] Firestore est en mode test (ou règles correctes)
- [ ] La région est correcte (Europe)

### Étape 2 : Vérifier les Règles

- [ ] Les règles permettent les lectures
- [ ] Les règles permettent les écritures
- [ ] Les règles sont publiées

### Étape 3 : Vérifier la Configuration

- [ ] `src/config/firebase.ts` a les bonnes credentials
- [ ] `.env.local` a les bonnes variables (optionnel)
- [ ] Les émulateurs sont désactivés

### Étape 4 : Vérifier la Connectivité

- [ ] Internet fonctionne
- [ ] La page se charge correctement
- [ ] Les requêtes Firebase vont vers `firebaseapp.com`

## Logs à Chercher

### Avant la Correction

```
❌ Erreur lors de la récupération du profil: FirebaseError: Failed to get document because the client is offline.
```

### Après la Correction

```
✅ Utilisateur connecté avec Google: user123
✅ Profil trouvé avec rôle: worker
✅ Redirection worker vers /search
```

## Tests

### Test 1 : Vérifier que Firestore Fonctionne

1. Va sur `/register`
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Complète le stepper
5. Ouvre la Console (F12)
6. Tu devrais voir :
   ```
   ✅ Profil sauvegardé avec succès
   ```

### Test 2 : Vérifier que la Lecture Fonctionne

1. Va sur `/login`
2. Connecte-toi avec un email existant
3. Ouvre la Console (F12)
4. Tu devrais voir :
   ```
   ✅ Profil trouvé avec rôle: worker
   ```

### Test 3 : Vérifier dans Firestore

1. Firebase Console → Firestore Database
2. Clique sur la collection **"users"**
3. Tu devrais voir les utilisateurs créés

## Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/start)

## Prochaines Étapes

1. **Vérifier que Firestore est créé** (voir Étape 1)
2. **Vérifier les règles de sécurité** (voir Étape 2)
3. **Vérifier la configuration Firebase** (voir Étape 3)
4. **Tester l'inscription** (voir Test 1)
5. **Tester la connexion** (voir Test 2)
6. **Vérifier dans Firestore** (voir Test 3)

Si tu as toujours l'erreur après ces étapes, ouvre la Console (F12) et partage les logs.
