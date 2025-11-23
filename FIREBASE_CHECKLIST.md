# Firebase Configuration Checklist

## ✅ Avant de Tester

### 1. Configuration Firebase Console

- [ ] Projet **JobCamer** créé
- [ ] **Authentication** activé
- [ ] **Email/Password** activé dans Sign-in method
- [ ] **Google** activé dans Sign-in method
- [ ] **Firestore** créé
- [ ] **Storage** créé

### 2. URLs Autorisées

- [ ] Va dans **Authentication** → **Settings**
- [ ] Scroll vers **Authorized domains**
- [ ] Ajoute `localhost` si absent
- [ ] Ajoute `127.0.0.1` si absent

### 3. Google Cloud Console

- [ ] Va sur [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Sélectionne le projet **jobcamer-65a6d**
- [ ] Va dans **APIs & Services** → **Credentials**
- [ ] Clique sur le **OAuth 2.0 Client ID** (Web)
- [ ] Dans **Authorized JavaScript origins**, ajoute :
  - [ ] `http://localhost:5173`
  - [ ] `http://127.0.0.1:5173`
- [ ] Dans **Authorized redirect URIs**, ajoute :
  - [ ] `http://localhost:5173`
  - [ ] `http://127.0.0.1:5173`
- [ ] Clique sur **Save**

### 4. Code Source

- [ ] `src/config/firebase.ts` - Credentials correctes
- [ ] `src/services/authService.ts` - Fonctions d'authentification
- [ ] `src/pages/Auth/Login.tsx` - Bouton Google + Email/Password
- [ ] `src/pages/Auth/Register.tsx` - Bouton Google + Email/Password
- [ ] `src/pages/Onboarding.tsx` - Stepper après inscription

---

## 🧪 Tests d'Authentification

### Test 1 : Inscription par Email

- [ ] Va sur `http://localhost:5173/register`
- [ ] Remplis le formulaire :
  - Prénom : Jean
  - Nom : Kamga
  - Email : jean@example.com
  - Mot de passe : Test123456
  - Confirmer mot de passe : Test123456
- [ ] Clique sur "S'inscrire"
- [ ] Vérifie que tu es redirigé vers `/onboarding`
- [ ] Complète le stepper d'onboarding
- [ ] Vérifie que tu es redirigé vers l'accueil

### Test 2 : Connexion par Email

- [ ] Va sur `http://localhost:5173/login`
- [ ] Remplis le formulaire :
  - Email : jean@example.com
  - Mot de passe : Test123456
- [ ] Clique sur "Se connecter"
- [ ] Vérifie que tu es redirigé vers l'accueil

### Test 3 : Inscription par Google

- [ ] Va sur `http://localhost:5173/register`
- [ ] Clique sur "S'inscrire avec Google"
- [ ] Sélectionne un compte Google
- [ ] Vérifie que tu es redirigé vers `/onboarding`
- [ ] Complète le stepper d'onboarding
- [ ] Vérifie que tu es redirigé vers l'accueil

### Test 4 : Connexion par Google

- [ ] Va sur `http://localhost:5173/login`
- [ ] Clique sur "Continuer avec Google"
- [ ] Sélectionne un compte Google
- [ ] Vérifie que tu es redirigé vers l'accueil

### Test 5 : Erreurs d'Authentification

#### Email déjà utilisé
- [ ] Va sur `/register`
- [ ] Utilise un email déjà inscrit
- [ ] Vérifie le message : "Cet email est déjà utilisé"

#### Mot de passe incorrect
- [ ] Va sur `/login`
- [ ] Utilise un email valide avec un mauvais mot de passe
- [ ] Vérifie le message : "Mot de passe incorrect"

#### Email invalide
- [ ] Va sur `/register`
- [ ] Utilise un email sans @
- [ ] Vérifie le message : "Email invalide"

#### Mot de passe trop court
- [ ] Va sur `/register`
- [ ] Utilise un mot de passe de moins de 6 caractères
- [ ] Vérifie le message : "Le mot de passe doit contenir au moins 6 caractères"

---

## 🔍 Vérifications dans Firebase Console

### Utilisateurs Créés

- [ ] Va dans **Authentication** → **Users**
- [ ] Vérifie que les utilisateurs créés sont listés
- [ ] Clique sur un utilisateur pour voir ses détails

### Données Firestore

- [ ] Va dans **Firestore Database**
- [ ] Vérifie que la collection **users** existe
- [ ] Clique sur **users** pour voir les documents
- [ ] Vérifie que les profils utilisateurs sont créés

---

## 🛠️ Dépannage

Si quelque chose ne fonctionne pas :

1. **Ouvre la Console du Navigateur** (F12)
2. **Cherche les erreurs** dans l'onglet Console
3. **Consulte** `FIREBASE_TROUBLESHOOTING.md`
4. **Vérifie** les URLs autorisées dans Firebase
5. **Redémarre** le serveur de développement

### Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| ERR_CONNECTION_REFUSED | URLs non autorisées | Ajoute localhost dans Firebase Console |
| Cet email est déjà utilisé | Email existe | Utilise un autre email |
| Mot de passe incorrect | Mauvais mot de passe | Vérifie le mot de passe |
| Erreur réseau | Pas de connexion Internet | Vérifie ta connexion |

---

## 📋 Checklist Finale

- [ ] Tous les tests d'authentification passent
- [ ] Les messages d'erreur s'affichent correctement
- [ ] Les utilisateurs sont créés dans Firebase
- [ ] Les profils sont sauvegardés dans Firestore
- [ ] Le stepper d'onboarding fonctionne
- [ ] La redirection après authentification fonctionne
- [ ] Google Sign-In fonctionne
- [ ] Email/Password fonctionne

---

## 🚀 Prochaines Étapes

Une fois que tout fonctionne :

1. Ajouter les traductions pour Onboarding
2. Tester avec d'autres navigateurs
3. Tester sur mobile
4. Configurer la production
5. Ajouter la réinitialisation de mot de passe
6. Ajouter la vérification d'email

---

## 📞 Support

Si tu as des problèmes :

1. Consulte `FIREBASE_TROUBLESHOOTING.md`
2. Consulte `GOOGLE_OAUTH_SETUP.md`
3. Ouvre la Console du Navigateur (F12)
4. Vérifie les logs Firebase
