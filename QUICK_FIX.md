# Quick Fix - Erreur "Offline"

## Le Problème

Tu reçois cette erreur :
```
FirebaseError: Failed to get document because the client is offline.
```

## La Solution (3 étapes)

### Étape 1 : Vérifier que Firestore est Créé

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne le projet **JobCamer**
3. Dans le menu de gauche, clique sur **Firestore Database**

**Si tu vois un bouton "Create database"** :
- Clique sur **"Create database"**
- Sélectionne **"Start in test mode"**
- Sélectionne la région (Europe)
- Clique sur **"Create"**

**Si tu vois une base de données** :
- Continue à l'étape 2

### Étape 2 : Vérifier les Règles de Sécurité

1. Dans Firestore Database, clique sur l'onglet **"Rules"**
2. Remplace tout par :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /jobs/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /conversations/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /messages/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /notifications/{userId}/items/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /reviews/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Clique sur **"Publish"**

### Étape 3 : Tester

1. Recharge ta page (F5)
2. Essaie de te connecter avec Google
3. Ouvre la Console (F12)
4. Tu devrais voir :
   ```
   ✅ Utilisateur connecté avec Google: user123
   ✅ Profil trouvé avec rôle: worker
   ✅ Redirection worker vers /search
   ```

## Si Ça Ne Fonctionne Pas

1. Ouvre la Console (F12)
2. Cherche les erreurs
3. Consulte `FIRESTORE_DIAGNOSTIC.md`

## Logs Attendus

### Avant
```
❌ Erreur lors de la récupération du profil: FirebaseError: Failed to get document because the client is offline.
```

### Après
```
✅ Utilisateur connecté avec Google: user123
✅ Profil trouvé avec rôle: worker
✅ Redirection worker vers /search
```

## Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
