# Enrichissement des Profils Utilisateurs

## 📋 Vue d'ensemble

La plateforme permet maintenant aux utilisateurs de compléter leurs profils avec des informations détaillées et des documents.

---

## 👷 **Profil Travailleur (Worker)**

### Informations Complètes

1. **Photo de Profil**
   - Upload d'une image professionnelle
   - Formats : JPG, PNG
   - Taille max : 5MB
   - Stockage : Firebase Storage

2. **Informations de Base**
   - Téléphone (requis)
   - Ville (sélection)
   - Quartier

3. **Informations Professionnelles**
   - Catégorie de travail (construction, plomberie, électricité, etc.)
   - Bio / Description (expérience, qualifications)
   - Objectif professionnel (type de travail recherché)

4. **Compétences**
   - Ajouter/retirer des compétences
   - Affichage en tags
   - Exemple : "Maçonnerie", "Carrelage", "Peinture"

### Flux d'Enrichissement

```
1. Utilisateur connecté
2. Va dans Profil
3. Clique "Compléter le profil"
4. CompleteProfile.tsx s'affiche
5. Upload photo de profil
6. Remplit les informations
7. Ajoute des compétences
8. Clique "Sauvegarder"
9. Profil mis à jour dans Firestore
10. Redirection vers Profil
```

### Données Firestore

```json
{
  "id": "user123",
  "firstName": "Jean",
  "lastName": "Kamga",
  "email": "jean@example.com",
  "role": "worker",
  "avatar": "https://storage.googleapis.com/...",
  "phone": "+237 6 98 17 89 25",
  "location": {
    "city": "Yaoundé",
    "district": "Bastos"
  },
  "category": "construction",
  "bio": "Je suis un maçon expérimenté avec 10 ans d'expérience",
  "objective": "Chercher des missions de construction et rénovation",
  "skills": ["Maçonnerie", "Carrelage", "Peinture"],
  "portfolio": [],
  "verified": false,
  "premium": false,
  "createdAt": "2024-11-11T20:00:00Z",
  "rating": 4.5,
  "totalJobs": 15
}
```

---

## 💼 **Profil Employeur (Employer)**

### Informations Complètes

1. **Photo de Profil**
   - Logo ou photo de l'entreprise
   - Formats : JPG, PNG
   - Taille max : 5MB

2. **Informations de Base**
   - Téléphone (requis)
   - Ville (sélection)
   - Quartier

3. **Informations de l'Entreprise**
   - Nom de l'entreprise (requis)
   - Description de l'entreprise
   - Site web (optionnel)

4. **Vérification d'Identité** ⭐
   - Numéro de CNI
   - Image CNI - Avant
   - Image CNI - Arrière
   - Statut de vérification

### Flux d'Enrichissement

```
1. Employeur connecté
2. Va dans Profil
3. Clique "Compléter le profil"
4. CompleteProfile.tsx s'affiche
5. Upload logo/photo de profil
6. Remplit les informations de l'entreprise
7. Upload images CNI (avant/arrière)
8. Entre le numéro de CNI
9. Clique "Sauvegarder"
10. Profil mis à jour dans Firestore
11. Demande de vérification envoyée à l'admin
12. Redirection vers Profil
```

### Données Firestore

```json
{
  "id": "employer123",
  "firstName": "Steve",
  "lastName": "Wawo",
  "email": "stevewawo24@gmail.com",
  "role": "employer",
  "avatar": "https://storage.googleapis.com/...",
  "phone": "+33 6 98 17 89 25",
  "location": {
    "city": "Yaoundé",
    "district": "Bastos"
  },
  "companyName": "Ma Société SARL",
  "companyDescription": "Nous sommes une entreprise spécialisée dans les travaux de construction...",
  "website": "https://www.masociete.cm",
  "verified": false,
  "cniNumber": "123456789",
  "cniImages": [
    "https://storage.googleapis.com/.../cni-front.jpg",
    "https://storage.googleapis.com/.../cni-back.jpg"
  ],
  "premium": false,
  "createdAt": "2024-11-11T20:00:00Z",
  "totalJobsPosted": 5
}
```

---

## 🔧 **Implémentation Technique**

### Fichiers Créés

1. **src/pages/CompleteProfile.tsx**
   - Page de complétion de profil
   - Upload de fichiers
   - Gestion des compétences
   - Validation du formulaire

### Fichiers Modifiés

1. **src/App.tsx**
   - Ajout de la route `/complete-profile`
   - Import de `CompleteProfile`

2. **src/pages/Profile.tsx**
   - Ajout du bouton "Compléter le profil"
   - Lien vers `/complete-profile`

### Technologies Utilisées

- **Firebase Storage** : Stockage des images
- **Firestore** : Stockage des données
- **React** : Interface utilisateur
- **TailwindCSS** : Styling

---

## 📤 **Upload de Fichiers**

### Processus

```typescript
1. Utilisateur sélectionne un fichier
2. handleFileSelect() déclenché
3. Fichier uploadé vers Firebase Storage
4. Chemin : profiles/{userId}/{fieldName}-{timestamp}
5. URL de téléchargement retournée
6. URL sauvegardée dans le formulaire
7. Affichage de la progression
8. Prévisualisation de l'image
```

### Progression d'Upload

- Barre de progression visible
- Pourcentage affiché
- Validation de la taille (max 5MB)
- Formats acceptés : JPG, PNG

### Gestion des Erreurs

- Message d'erreur si l'upload échoue
- Retry possible
- Validation côté client

---

## ✅ **Validation du Formulaire**

### Champs Requis

**Pour tous les utilisateurs :**
- Téléphone ✓

**Pour les travailleurs :**
- Catégorie ✓

**Pour les employeurs :**
- Nom de l'entreprise ✓

### Validation

```typescript
if (!profileData.phone) {
  setError('Le téléphone est requis');
  return;
}

if (user?.role === 'employer' && !profileData.companyName) {
  setError('Le nom de l\'entreprise est requis');
  return;
}
```

---

## 🎨 **Interface Utilisateur**

### CompleteProfile.tsx

**Sections :**

1. **Header**
   - Titre : "Compléter votre profil"
   - Sous-titre selon le rôle

2. **Photo de Profil**
   - Aperçu de l'image
   - Bouton d'upload
   - Barre de progression

3. **Informations de Base**
   - Téléphone (Input)
   - Ville (Select)
   - Quartier (Input)

4. **Profil Travailleur**
   - Catégorie (Select)
   - Bio (TextArea)
   - Objectif (TextArea)
   - Compétences (Tags)

5. **Profil Employeur**
   - Nom entreprise (Input)
   - Description (TextArea)
   - Site web (Input)
   - CNI - Avant (Upload)
   - CNI - Arrière (Upload)

6. **Boutons**
   - Annuler
   - Sauvegarder

---

## 🧪 **Tests**

### Test 1 : Upload Photo Travailleur

```
1. Connecte-toi en tant que travailleur
2. Va dans Profil
3. Clique "Compléter le profil"
4. Upload une photo
5. Remplis les informations
6. Ajoute des compétences
7. Clique "Sauvegarder"
8. Profil mis à jour ✅
9. Photo affichée dans le profil ✅
```

### Test 2 : Vérification Employeur

```
1. Connecte-toi en tant qu'employeur
2. Va dans Profil
3. Clique "Compléter le profil"
4. Upload logo
5. Remplis les informations
6. Upload images CNI
7. Clique "Sauvegarder"
8. Profil mis à jour ✅
9. Images CNI sauvegardées ✅
```

### Test 3 : Validation

```
1. Va dans Compléter le profil
2. Essaie de sauvegarder sans téléphone
3. Message d'erreur affiché ✅
4. Remplis le téléphone
5. Clique "Sauvegarder"
6. Profil mis à jour ✅
```

---

## 📊 **Flux Complet**

### Travailleur

```
Inscription
  ↓
Onboarding (rôle + infos de base)
  ↓
Profil (affichage)
  ↓
Compléter le profil
  ├── Photo de profil
  ├── Bio
  ├── Catégorie
  ├── Compétences
  └── Localisation
  ↓
Profil Complet ✅
```

### Employeur

```
Inscription
  ↓
Onboarding (rôle + infos de base)
  ↓
Profil (affichage)
  ↓
Compléter le profil
  ├── Logo/Photo
  ├── Infos entreprise
  ├── Vérification CNI
  │   ├── Numéro CNI
  │   ├── Image avant
  │   └── Image arrière
  └── Localisation
  ↓
Profil Complet + Vérification en attente ✅
```

---

## 🔐 **Sécurité**

### Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 📝 **Prochaines Étapes**

1. **Admin Panel**
   - Vérification des CNI
   - Approbation des profils
   - Gestion des utilisateurs

2. **Portfolio**
   - Upload de plusieurs images
   - Galerie de travaux
   - Descriptions des projets

3. **Certifications**
   - Upload de certificats
   - Vérification des qualifications
   - Badges de certification

4. **Avis et Évaluations**
   - Système de notation
   - Commentaires des clients
   - Historique des projets

---

## ✨ **Résumé**

La plateforme offre maintenant une expérience complète d'enrichissement de profil :

- ✅ Upload de photos
- ✅ Informations détaillées
- ✅ Compétences (travailleurs)
- ✅ Vérification d'identité (employeurs)
- ✅ Validation du formulaire
- ✅ Gestion des erreurs
- ✅ Progression d'upload

**Tout est prêt ! 🚀**
