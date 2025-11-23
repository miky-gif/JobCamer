# Guide de Dépannage Firebase

## Problèmes Courants et Solutions

### 1. Erreur : "Cet email est déjà utilisé"

**Cause** : L'email est déjà enregistré dans Firebase

**Solution** :
- Utilise un autre email
- Ou réinitialise le mot de passe si tu as oublié

### 2. Erreur : "Email invalide"

**Cause** : Le format de l'email n'est pas valide

**Solution** :
- Vérifie que l'email a le format : `utilisateur@domaine.com`
- Pas d'espaces avant ou après

### 3. Erreur : "Le mot de passe doit contenir au moins 6 caractères"

**Cause** : Le mot de passe est trop court

**Solution** :
- Utilise un mot de passe d'au moins 6 caractères
- Exemple : `MonMotDePasse123`

### 4. Erreur : "Utilisateur non trouvé" (à la connexion)

**Cause** : L'email n'existe pas dans Firebase

**Solution** :
- Vérifie que tu as bien écrit l'email
- Crée un compte si tu n'en as pas

### 5. Erreur : "Mot de passe incorrect"

**Cause** : Le mot de passe saisi ne correspond pas

**Solution** :
- Vérifie que tu as bien écrit le mot de passe
- Attention à la casse (majuscules/minuscules)
- Utilise "Mot de passe oublié ?" si tu ne t'en souviens pas

### 6. Erreur : "Trop de tentatives. Réessayez plus tard"

**Cause** : Trop d'essais de connexion échoués

**Solution** :
- Attends quelques minutes
- Réessaie après

### 7. Erreur : "Erreur réseau. Vérifiez votre connexion"

**Cause** : Problème de connexion Internet

**Solution** :
- Vérifie ta connexion Internet
- Redémarre le navigateur
- Vide le cache (Ctrl+Shift+Delete)

### 8. Erreur Google : "ERR_CONNECTION_REFUSED"

**Cause** : Les URLs autorisées ne sont pas configurées dans Firebase

**Solution** : Voir `GOOGLE_OAUTH_SETUP.md`

### 9. Erreur Google : "popup-closed-by-user"

**Cause** : L'utilisateur a fermé le popup de connexion Google

**Solution** :
- C'est normal, pas d'erreur à afficher
- L'utilisateur peut réessayer

### 10. Erreur : "Opération non autorisée"

**Cause** : La méthode d'authentification n'est pas activée dans Firebase

**Solution** :
1. Va dans Firebase Console
2. Authentication → Sign-in method
3. Active "Email/Password" et "Google"

---

## Vérifier la Configuration Firebase

### Étape 1 : Vérifier les Credentials

1. Ouvre `src/config/firebase.ts`
2. Vérifie que les credentials sont correctes :
   ```typescript
   apiKey: 'AIzaSyDMcHjBsHmAO6gduKaNTpaeH7nZTnynCnY',
   authDomain: 'jobcamer-65a6d.firebaseapp.com',
   projectId: 'jobcamer-65a6d',
   ```

### Étape 2 : Vérifier Firebase Console

1. Va sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne le projet **JobCamer**
3. Vérifie que **Authentication** est activé
4. Vérifie que les méthodes d'authentification sont activées :
   - Email/Password ✅
   - Google ✅

### Étape 3 : Vérifier les URLs Autorisées

1. Firebase Console → Authentication → Settings
2. Scroll vers le bas → "Authorized domains"
3. Vérifie que `localhost` est dans la liste

### Étape 4 : Vérifier Google Cloud Console

1. Va sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionne le projet **jobcamer-65a6d**
3. APIs & Services → Credentials
4. Clique sur le **OAuth 2.0 Client ID** (Web)
5. Vérifie les **Authorized JavaScript origins** :
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   ```

---

## Tester l'Authentification

### Test 1 : Inscription par Email

1. Va sur `/register`
2. Remplis le formulaire :
   - Prénom : Jean
   - Nom : Kamga
   - Email : jean@example.com
   - Mot de passe : Test123456
3. Clique sur "S'inscrire"
4. Vérifie que tu es redirigé vers `/onboarding`

### Test 2 : Connexion par Email

1. Va sur `/login`
2. Remplis le formulaire :
   - Email : jean@example.com
   - Mot de passe : Test123456
3. Clique sur "Se connecter"
4. Vérifie que tu es redirigé vers l'accueil

### Test 3 : Inscription par Google

1. Va sur `/register`
2. Clique sur "S'inscrire avec Google"
3. Sélectionne un compte Google
4. Vérifie que tu es redirigé vers `/onboarding`

### Test 4 : Connexion par Google

1. Va sur `/login`
2. Clique sur "Continuer avec Google"
3. Sélectionne un compte Google
4. Vérifie que tu es redirigé vers l'accueil

---

## Activer le Mode Débogage

### Dans la Console du Navigateur

1. Ouvre les DevTools (F12)
2. Va dans l'onglet **Console**
3. Tu verras les logs Firebase :
   ```
   Utilisateur créé: User { uid: '...', email: '...', ... }
   Erreur lors de l'inscription: FirebaseError: ...
   ```

### Vérifier les Utilisateurs dans Firebase

1. Firebase Console → Authentication → Users
2. Tu devrais voir les utilisateurs créés
3. Clique sur un utilisateur pour voir ses détails

---

## Réinitialiser Firebase

Si tu veux recommencer de zéro :

1. Firebase Console → Authentication → Users
2. Sélectionne tous les utilisateurs
3. Clique sur "Delete"
4. Confirme

Attention : Cette action est irréversible !

---

## Ressources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Error Codes](https://firebase.google.com/docs/auth/admin/errors)
