# Plan d'Action - Résolution de l'Erreur Firestore Offline

## Situation Actuelle

### ✅ Ce qui Fonctionne
- Authentification Google ✅
- Inscription email ✅
- Inscription Google ✅
- Sauvegarde du profil dans Firestore ✅
- Onboarding stepper ✅
- Redirection selon le rôle ✅

### ❌ Ce qui Ne Fonctionne Pas
- Connexion Google ❌ (Erreur: "offline")
- Lecture du profil depuis Firestore ❌

### 🔴 Cause Racine
**Firestore n'est pas créé ou pas accessible** dans Firebase Console

---

## Actions à Prendre (3 Étapes)

### 🔵 ÉTAPE 1 : Créer Firestore (5 minutes)

1. Ouvre [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne le projet **JobCamer**
3. Dans le menu de gauche, clique sur **Firestore Database**

**Si tu vois un bouton "Create database"** :
- Clique sur **"Create database"**
- Sélectionne **"Start in test mode"**
- Sélectionne la région **"Europe"**
- Clique sur **"Create"**

**Si tu vois une base de données** :
- Continue à l'étape 2

### 🟢 ÉTAPE 2 : Configurer les Règles (5 minutes)

1. Dans Firestore Database, clique sur l'onglet **"Rules"**
2. Supprime tout le contenu
3. Copie-colle ceci :

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

4. Clique sur **"Publish"**
5. Attends le message "Rules updated successfully"

### 🟡 ÉTAPE 3 : Tester (5 minutes)

1. Reviens à ton application
2. Recharge la page (F5)
3. Ouvre la Console (F12)
4. Essaie de te connecter avec Google
5. Cherche dans la Console :

**Tu devrais voir** :
```
✅ Utilisateur connecté avec Google: user123
✅ Profil trouvé avec rôle: worker
✅ Redirection worker vers /search
```

**Si tu vois toujours l'erreur** :
```
❌ Erreur lors de la récupération du profil: FirebaseError: Failed to get document because the client is offline.
```

Alors consulte `FIRESTORE_DIAGNOSTIC.md`

---

## Vérification Rapide

### Avant de Commencer

- [ ] Tu as accès à Firebase Console
- [ ] Tu es connecté au bon projet (JobCamer)
- [ ] Tu as une connexion Internet stable

### Après Étape 1

- [ ] Firestore Database est créé
- [ ] Tu vois une interface avec "Start collection"

### Après Étape 2

- [ ] Les règles sont remplacées
- [ ] Les règles sont publiées
- [ ] Tu vois "Rules updated successfully"

### Après Étape 3

- [ ] La page se recharge sans erreur
- [ ] La connexion Google fonctionne
- [ ] Tu vois les logs corrects dans la Console

---

## Logs Attendus Après la Correction

### Inscription Google

```
✅ Inscription Google en cours...
✅ Utilisateur créé avec Google: user123
✅ Redirection vers onboarding
✅ Sauvegarde du profil pour: user123
✅ Données à sauvegarder (nettoyées): { id: '...', role: 'worker', ... }
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

### Connexion Google

```
✅ Utilisateur connecté avec Google: user123
✅ Profil trouvé avec rôle: worker
✅ Redirection worker vers /search
```

### Connexion Email

```
✅ Utilisateur connecté: user123
✅ Profil trouvé avec rôle: worker
✅ Redirection worker vers /search
```

---

## Dépannage Rapide

### Erreur : "Rules updated successfully" n'apparaît pas

**Solution** :
- Attends 30 secondes
- Recharge la page (F5)
- Réessaie

### Erreur : Toujours "offline" après les étapes

**Solution** :
1. Ouvre la Console (F12)
2. Cherche l'erreur exacte
3. Consulte `FIRESTORE_DIAGNOSTIC.md`
4. Vérifie que Firestore est bien créé

### Erreur : "Permission denied"

**Solution** :
- Vérifie que les règles sont correctes
- Vérifie que les règles sont publiées
- Recharge la page (F5)

---

## Documents de Référence

- **QUICK_FIX.md** - Solution rapide en 3 étapes
- **FIRESTORE_DIAGNOSTIC.md** - Diagnostic complet
- **CONSOLE_LOGS_EXPLAINED.md** - Explication des logs
- **ROLE_MANAGEMENT.md** - Gestion des rôles
- **FIRESTORE_OFFLINE_FIX.md** - Résolution offline

---

## Résumé

| Étape | Action | Durée | Statut |
|-------|--------|-------|--------|
| 1 | Créer Firestore | 5 min | ⏳ À faire |
| 2 | Configurer les règles | 5 min | ⏳ À faire |
| 3 | Tester | 5 min | ⏳ À faire |

**Temps total** : ~15 minutes

---

## Après la Correction

Une fois que tout fonctionne :

1. ✅ Inscription email → Onboarding → Redirection selon rôle
2. ✅ Inscription Google → Onboarding → Redirection selon rôle
3. ✅ Connexion email → Redirection selon rôle
4. ✅ Connexion Google → Redirection selon rôle
5. ✅ Profils créés dans Firestore
6. ✅ Rôles gérés correctement

---

## Support

Si tu as des problèmes :

1. Ouvre la Console (F12)
2. Cherche les erreurs
3. Consulte les documents de référence
4. Vérifie la checklist

**Bonne chance ! 🚀**
