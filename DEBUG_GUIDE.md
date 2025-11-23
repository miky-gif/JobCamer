# Guide de Débogage - Authentification Firebase

## Problème 1 : Inscription tourne indéfiniment

### Symptômes
- Clic sur "Terminer" dans le stepper d'onboarding
- Le bouton tourne mais rien ne se passe
- Pas de message d'erreur

### Causes Possibles

1. **Firestore n'est pas configuré**
   - Vérifier que Firestore est créé dans Firebase Console
   - Vérifier que les règles de sécurité permettent les écritures

2. **Erreur Firestore silencieuse**
   - Ouvrir la Console du Navigateur (F12)
   - Chercher les erreurs dans l'onglet Console
   - Chercher les erreurs dans l'onglet Network

3. **Profil utilisateur incomplet**
   - Vérifier que tous les champs requis sont remplis
   - Vérifier que le rôle est sélectionné

### Solutions

#### Étape 1 : Vérifier Firestore

1. Va dans Firebase Console
2. Sélectionne le projet **JobCamer**
3. Va dans **Firestore Database**
4. Vérifie que la base de données existe
5. Si elle n'existe pas, crée-la en mode test

#### Étape 2 : Vérifier les Règles de Sécurité

1. Va dans **Firestore Database** → **Rules**
2. Remplace les règles par :

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
  }
}
```

3. Clique sur **Publish**

#### Étape 3 : Vérifier la Console du Navigateur

1. Ouvre les DevTools (F12)
2. Va dans l'onglet **Console**
3. Cherche les messages de log :
   ```
   Sauvegarde du profil pour: user123
   Données: { role: 'worker', phone: '6XXXXXXXX', ... }
   Profil sauvegardé avec succès
   ```

4. Si tu vois une erreur, note-la et cherche dans `FIREBASE_TROUBLESHOOTING.md`

---

## Problème 2 : Google Auth ne gère pas les rôles

### Symptômes
- Connexion Google fonctionne
- Mais l'utilisateur n'a pas de rôle défini
- Redirection vers onboarding même après connexion

### Causes
- Le profil n'est pas créé automatiquement avec Google
- L'utilisateur doit compléter le stepper d'onboarding

### Solution
C'est le comportement attendu ! Après Google Sign-In :
1. L'utilisateur est redirigé vers `/onboarding`
2. Il sélectionne son rôle (Worker/Employer)
3. Il remplit les détails
4. Son profil est créé dans Firestore

---

## Problème 3 : Erreur lors de la sauvegarde du profil

### Symptômes
- Message d'erreur dans le stepper
- Exemple : "Erreur lors de la sauvegarde du profil"

### Causes Possibles

1. **Firestore n'est pas accessible**
   - Vérifier la connexion Internet
   - Vérifier que Firestore est activé

2. **Règles de sécurité trop restrictives**
   - Vérifier les règles Firestore (voir Étape 2 ci-dessus)

3. **Données invalides**
   - Vérifier que tous les champs requis sont remplis
   - Vérifier que le rôle est sélectionné

### Solution

1. Ouvre la Console (F12)
2. Cherche le message d'erreur exact
3. Consulte `FIREBASE_TROUBLESHOOTING.md`
4. Vérifie les règles Firestore

---

## Vérifier que Tout Fonctionne

### Test 1 : Inscription Email

```
1. Va sur /register
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Ouvre la Console (F12)
5. Tu devrais voir :
   - "Inscription en cours avec: { email: '...', firstName: '...', ... }"
   - "Utilisateur créé avec succès: user123"
6. Tu es redirigé vers /onboarding
7. Complète le stepper
8. Tu devrais voir :
   - "Sauvegarde du profil pour: user123"
   - "Profil sauvegardé avec succès"
9. Tu es redirigé vers l'accueil
```

### Test 2 : Inscription Google

```
1. Va sur /register
2. Clique sur "S'inscrire avec Google"
3. Sélectionne un compte Google
4. Ouvre la Console (F12)
5. Tu devrais voir :
   - "Inscription Google en cours..."
   - "Utilisateur créé avec Google: user123"
6. Tu es redirigé vers /onboarding
7. Complète le stepper
8. Tu devrais voir :
   - "Sauvegarde du profil pour: user123"
   - "Profil sauvegardé avec succès"
9. Tu es redirigé vers l'accueil
```

### Test 3 : Connexion Email

```
1. Va sur /login
2. Remplis le formulaire avec un email existant
3. Clique sur "Se connecter"
4. Ouvre la Console (F12)
5. Tu devrais voir :
   - "Utilisateur connecté: user123"
   - "Profil trouvé, redirection vers accueil"
6. Tu es redirigé vers l'accueil
```

### Test 4 : Connexion Google

```
1. Va sur /login
2. Clique sur "Continuer avec Google"
3. Sélectionne un compte Google
4. Ouvre la Console (F12)
5. Tu devrais voir :
   - "Utilisateur connecté avec Google: user123"
   - "Profil incomplet, redirection vers onboarding" (première fois)
   - ou "Profil trouvé, redirection vers accueil" (si profil existe)
6. Tu es redirigé vers onboarding ou l'accueil
```

---

## Logs Importants à Chercher

### Inscription Email
```
✅ Inscription en cours avec: { email: '...', firstName: '...', ... }
✅ Utilisateur créé avec succès: user123
✅ Sauvegarde du profil pour: user123
✅ Profil sauvegardé avec succès
```

### Inscription Google
```
✅ Inscription Google en cours...
✅ Utilisateur créé avec Google: user123
✅ Sauvegarde du profil pour: user123
✅ Profil sauvegardé avec succès
```

### Connexion Email
```
✅ Utilisateur connecté: user123
✅ Profil trouvé, redirection vers accueil
```

### Connexion Google
```
✅ Utilisateur connecté avec Google: user123
✅ Profil incomplet, redirection vers onboarding
```

---

## Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Cet email est déjà utilisé" | Email existe | Utilise un autre email |
| "Erreur lors de la sauvegarde du profil" | Firestore inaccessible | Vérifier Firestore et les règles |
| "Utilisateur non authentifié" | Session expirée | Réessayer de te connecter |
| "Erreur réseau" | Pas de connexion Internet | Vérifier la connexion |

---

## Ressources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [DevTools Console](https://developer.chrome.com/docs/devtools/console/)
