# Résolution de l'Erreur "Failed to get document because the client is offline"

## Problème

Quand tu essaies de lire un document Firestore juste après l'authentification, tu reçois :
```
Failed to get document because the client is offline
```

## Causes

1. **Firestore n'est pas initialisé correctement**
2. **Pas de délai entre l'authentification et la lecture**
3. **Problème de connectivité réseau**
4. **Firestore Emulator activé en développement**

## Solutions

### Solution 1 : Vérifier que Firestore est Activé

1. Va dans Firebase Console
2. Sélectionne le projet **JobCamer**
3. Va dans **Firestore Database**
4. Vérifie que la base de données existe
5. Si elle n'existe pas, crée-la en mode test

### Solution 2 : Ajouter un Délai

J'ai ajouté un délai de 1 seconde dans `Login.tsx` pour laisser Firestore se synchroniser :

```typescript
// Attendre un peu pour que Firestore soit synchronisé
await new Promise(resolve => setTimeout(resolve, 1000));

// Vérifier si le profil existe
const profile = await getUserProfile(user.uid);
```

### Solution 3 : Vérifier la Connectivité Réseau

1. Ouvre la Console du Navigateur (F12)
2. Va dans l'onglet **Network**
3. Cherche les requêtes vers Firestore
4. Vérifie qu'elles ne sont pas en erreur

### Solution 4 : Désactiver les Émulateurs

Les émulateurs Firestore peuvent causer des problèmes. Vérifie que `src/config/firebase.ts` a les émulateurs désactivés :

```typescript
// Connecter aux émulateurs en développement (optionnel)
// Désactivé par défaut - Activer seulement si vous utilisez Firebase Emulator Suite
// if (import.meta.env.DEV && window.location.hostname === 'localhost') {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//   } catch (error) {
//     // Les émulateurs sont déjà connectés
//   }
// }
```

### Solution 5 : Vérifier les Règles de Sécurité

Les règles Firestore doivent permettre les lectures :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre à chacun de lire/écrire son propre profil
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Vérifier que Tout Fonctionne

### Test 1 : Inscription Google

1. Va sur `/register`
2. Clique sur "S'inscrire avec Google"
3. Sélectionne un compte Google
4. Ouvre la Console (F12)
5. Tu devrais voir :
   ```
   ✅ Utilisateur créé avec Google: user123
   ✅ Redirection vers onboarding
   ```
6. Complète le stepper
7. Tu devrais voir :
   ```
   ✅ Profil sauvegardé avec succès
   ✅ Redirection selon le rôle
   ```

### Test 2 : Connexion Google

1. Va sur `/login`
2. Clique sur "Continuer avec Google"
3. Sélectionne un compte Google
4. Ouvre la Console (F12)
5. Tu devrais voir :
   ```
   ✅ Utilisateur connecté avec Google: user123
   ✅ Profil trouvé avec rôle: worker
   ✅ Redirection worker vers /search
   ```

### Test 3 : Inscription Email

1. Va sur `/register`
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Ouvre la Console (F12)
5. Tu devrais voir :
   ```
   ✅ Inscription en cours avec: { email: '...', firstName: '...', ... }
   ✅ Utilisateur créé avec succès: user123
   ✅ Redirection vers onboarding
   ```

## Logs Importants

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

### Inscription Email
```
✅ Inscription en cours avec: { email: '...', firstName: '...', ... }
✅ Utilisateur créé avec succès: user123
✅ Redirection vers onboarding
✅ Sauvegarde du profil pour: user123
✅ Données à sauvegarder (nettoyées): { id: '...', role: 'worker', ... }
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

## Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Failed to get document because the client is offline" | Firestore n'est pas accessible | Vérifier Firestore est créé et activé |
| "Unsupported field value: undefined" | Champs undefined envoyés à Firestore | Nettoyer les données avant d'envoyer |
| "Permission denied" | Règles de sécurité trop restrictives | Vérifier les règles Firestore |

## Checklist

- [ ] Firestore est créé dans Firebase Console
- [ ] Les règles de sécurité permettent les lectures/écritures
- [ ] Les émulateurs sont désactivés
- [ ] La connexion Internet fonctionne
- [ ] Les logs dans la Console (F12) sont clairs
- [ ] Les données sont nettoyées avant d'être envoyées à Firestore

## Ressources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Offline Persistence](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firebase Console](https://console.firebase.google.com/)
