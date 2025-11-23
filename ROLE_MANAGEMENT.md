# Gestion des Rôles (Worker vs Employer)

## Vue d'Ensemble

Après l'authentification, les utilisateurs sont redirigés selon leur rôle :

- **Worker** (Travailleur) → `/search` (Chercher du travail)
- **Employer** (Employeur) → `/` (Accueil - Publier des offres)

## Flux d'Authentification par Rôle

### 1. Inscription Email

```
Register.tsx (Email/Password)
    ↓
Onboarding.tsx (Sélectionner le rôle)
    ↓
Sauvegarder le profil avec le rôle
    ↓
Redirection selon le rôle :
    ├── Worker → /search
    └── Employer → /
```

### 2. Inscription Google

```
Register.tsx (Bouton Google)
    ↓
Onboarding.tsx (Sélectionner le rôle)
    ↓
Sauvegarder le profil avec le rôle
    ↓
Redirection selon le rôle :
    ├── Worker → /search
    └── Employer → /
```

### 3. Connexion Email

```
Login.tsx (Email/Password)
    ↓
Vérifier le profil
    ↓
Si profil complet :
    ├── Worker → /search
    └── Employer → /
    ↓
Si profil incomplet → /onboarding
```

### 4. Connexion Google

```
Login.tsx (Bouton Google)
    ↓
Vérifier le profil (avec délai de 1s)
    ↓
Si profil complet :
    ├── Worker → /search
    └── Employer → /
    ↓
Si profil incomplet → /onboarding
```

## Implémentation

### Onboarding.tsx - Redirection selon le Rôle

```typescript
const handleSuccessRedirect = () => {
  console.log('Redirection selon le rôle:', formData.role);
  // Rediriger selon le rôle
  if (formData.role === 'worker') {
    navigate('/search'); // Les workers vont chercher du travail
  } else {
    navigate('/'); // Les employers vont à l'accueil
  }
};
```

### Login.tsx - Redirection selon le Rôle

```typescript
const profile = await getUserProfile(user.uid);
if (profile && profile.role) {
  console.log('Profil trouvé avec rôle:', profile.role);
  // Rediriger selon le rôle
  if (profile.role === 'worker') {
    console.log('Redirection worker vers /search');
    navigate('/search');
  } else {
    console.log('Redirection employer vers /');
    navigate('/');
  }
}
```

## Structure du Profil Utilisateur

Chaque utilisateur a un profil avec cette structure :

```json
{
  "id": "user123",
  "email": "jean@example.com",
  "firstName": "Jean",
  "lastName": "Kamga",
  "role": "worker",  // ← Rôle de l'utilisateur
  "phone": "6XXXXXXXX",
  "category": "construction",  // Pour les workers
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
  "totalJobsPosted": 0,
  "objective": "Chercher des missions en construction"
}
```

## Données Spécifiques par Rôle

### Worker (Travailleur)

Champs supplémentaires :
- `category` : Catégorie de compétence (construction, plomberie, etc.)
- `bio` : Biographie/Expérience (optionnel)
- `objective` : Objectif principal
- `skills` : Compétences (optionnel)

### Employer (Employeur)

Champs supplémentaires :
- `companyName` : Nom de l'entreprise
- `objective` : Type de travail recherché

## Vérifier le Rôle dans la Console

### Test 1 : Voir le Rôle dans Firestore

1. Firebase Console → Firestore Database
2. Clique sur la collection **"users"**
3. Clique sur un utilisateur
4. Cherche le champ **"role"**
5. Tu devrais voir : `"worker"` ou `"employer"`

### Test 2 : Voir le Rôle dans la Console du Navigateur

1. Ouvre la Console (F12)
2. Cherche les logs :
   ```
   ✅ Profil trouvé avec rôle: worker
   ✅ Redirection worker vers /search
   ```

## Logs Importants

### Après Inscription

```
✅ Sauvegarde du profil pour: user123
✅ Données à sauvegarder (nettoyées): {
  id: 'user123',
  firstName: 'Jean',
  lastName: 'Kamga',
  email: 'jean@example.com',
  role: 'worker',  // ← Rôle sélectionné
  phone: '6XXXXXXXX',
  category: 'construction',
  ...
}
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

### Après Connexion

```
✅ Utilisateur connecté: user123
✅ Profil trouvé avec rôle: worker  // ← Rôle récupéré
✅ Redirection worker vers /search
```

## Tester la Gestion des Rôles

### Test 1 : Inscription Worker

1. Va sur `/register`
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Sélectionne **"Je suis Travailleur"**
5. Remplis les détails
6. Clique sur "Terminer"
7. Tu devrais être redirigé vers `/search`

### Test 2 : Inscription Employer

1. Va sur `/register`
2. Remplis le formulaire
3. Clique sur "S'inscrire"
4. Sélectionne **"Je suis Employeur"**
5. Remplis les détails
6. Clique sur "Terminer"
7. Tu devrais être redirigé vers `/`

### Test 3 : Connexion Worker

1. Va sur `/login`
2. Connecte-toi avec un compte worker
3. Tu devrais être redirigé vers `/search`

### Test 4 : Connexion Employer

1. Va sur `/login`
2. Connecte-toi avec un compte employer
3. Tu devrais être redirigé vers `/`

## Erreurs Courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| Pas de redirection après inscription | Profil non sauvegardé | Vérifier les logs Firestore |
| Redirection vers mauvaise page | Rôle non défini | Vérifier que le rôle est sélectionné |
| Profil incomplet | Données manquantes | Remplir tous les champs obligatoires |

## Prochaines Étapes

1. Tester l'inscription avec les deux rôles
2. Vérifier les redirections
3. Vérifier les données dans Firestore
4. Tester la connexion avec les deux rôles

## Ressources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
