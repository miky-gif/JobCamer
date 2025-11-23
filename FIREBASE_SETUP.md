# Configuration Firebase pour JobCamer

## 📋 Prérequis

- Compte Firebase créé
- Projet Firebase configuré
- Node.js et npm installés

## 🚀 Installation

### 1. Installer Firebase SDK

```bash
npm install firebase
```

### 2. Configurer les variables d'environnement

1. Copier le fichier `.env.example` en `.env.local`
2. Remplir avec vos credentials Firebase

```bash
cp .env.example .env.local
```

### 3. Obtenir vos credentials Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet JobCamer
3. Aller dans **Paramètres du projet** (⚙️)
4. Aller dans l'onglet **Vos applications**
5. Cliquer sur **Ajouter une application** → **Web**
6. Copier la configuration Firebase
7. Remplir le fichier `.env.local` avec ces valeurs

## 🗄️ Structure Firestore

### Collections

#### 1. **users**
```
{
  id: string (UID Firebase)
  phone: string
  email: string
  firstName: string
  lastName: string
  role: 'worker' | 'employer'
  avatar: string (URL)
  bio: string
  category: string (pour workers)
  location: {
    city: string
    district: string
  }
  verified: boolean
  premium: boolean
  rating: number (0-5)
  totalJobs: number
  totalJobsPosted: number
  createdAt: timestamp
}
```

#### 2. **jobs**
```
{
  id: string
  employerId: string
  title: string
  description: string
  category: string
  location: {
    city: string
    district: string
    latitude: number
    longitude: number
  }
  budget: number
  duration: number (jours)
  startDate: timestamp
  urgent: boolean
  sponsored: boolean
  requirements: string[]
  applicants: string[] (IDs des workers)
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 3. **conversations**
```
{
  id: string
  participants: string[] (2 IDs)
  participantNames: string[]
  participantAvatars: string[]
  lastMessage: string
  lastMessageTime: timestamp
  unreadCount: number
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### 4. **messages**
```
{
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  createdAt: timestamp
  read: boolean
}
```

#### 5. **notifications**
```
{
  id: string
  userId: string
  type: 'new_job' | 'application' | 'message' | 'payment' | 'review' | 'system'
  title: string
  message: string
  read: boolean
  actionUrl: string
  createdAt: timestamp
}
```

#### 6. **reviews**
```
{
  id: string
  jobId: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar: string
  revieweeId: string
  rating: number (1-5)
  comment: string
  createdAt: timestamp
}
```

## 🔐 Règles de Sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users - Chacun peut lire/écrire son propre profil
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Jobs - Tout le monde peut lire, employeur peut créer/modifier
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.employerId;
    }

    // Conversations - Participants peuvent lire/écrire
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }

    // Messages - Participants peuvent lire/écrire
    match /messages/{messageId} {
      allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
      allow create: if request.auth.uid == request.resource.data.senderId;
    }

    // Notifications - Chacun peut lire ses propres notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }

    // Reviews - Tout le monde peut lire, créateur peut écrire
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.reviewerId;
    }
  }
}
```

## 📱 Configuration Authentication

### Activer les méthodes d'authentification

1. Aller dans **Authentication** → **Sign-in method**
2. Activer:
   - **Phone** (pour connexion par téléphone)
   - **Email/Password** (pour email)
   - **Google** (optionnel)

### Configuration du téléphone

Pour la vérification par téléphone, ajouter reCAPTCHA:
1. Aller dans **Authentication** → **Settings**
2. Configurer **reCAPTCHA** pour le web

## 💾 Cloud Storage

Pour stocker les images (avatars, portfolio):

1. Aller dans **Storage** → **Commencer**
2. Créer les dossiers:
   - `avatars/` - Images de profil
   - `portfolio/` - Portfolios des workers
   - `jobs/` - Images des offres

## 🔧 Services Disponibles

### authService.ts
- `signInWithPhone()` - Connexion par téléphone
- `verifyOTP()` - Vérifier le code OTP
- `signUpWithEmail()` - Inscription par email
- `signInWithEmail()` - Connexion par email
- `createUserProfile()` - Créer un profil
- `getUserProfile()` - Récupérer un profil
- `updateUserProfile()` - Mettre à jour un profil
- `logout()` - Déconnexion

### jobService.ts
- `createJob()` - Créer une offre
- `getAllJobs()` - Récupérer toutes les offres
- `getJobById()` - Récupérer une offre
- `getJobsByEmployer()` - Offres d'un employeur
- `getJobsByCategory()` - Offres par catégorie
- `updateJob()` - Mettre à jour une offre
- `applyToJob()` - Postuler à une offre
- `deleteJob()` - Supprimer une offre

### chatService.ts
- `getOrCreateConversation()` - Créer/récupérer une conversation
- `sendMessage()` - Envoyer un message
- `getMessages()` - Récupérer les messages
- `subscribeToMessages()` - Écouter les messages en temps réel
- `getUserConversations()` - Conversations d'un utilisateur
- `markMessagesAsRead()` - Marquer comme lus

### notificationService.ts
- `createNotification()` - Créer une notification
- `getUserNotifications()` - Récupérer les notifications
- `getUnreadNotifications()` - Notifications non lues
- `markNotificationAsRead()` - Marquer comme lue
- `markAllNotificationsAsRead()` - Marquer toutes comme lues
- `deleteNotification()` - Supprimer une notification

### reviewService.ts
- `createReview()` - Créer un avis
- `getUserReviews()` - Avis d'un utilisateur
- `getJobReviews()` - Avis d'une offre
- `reviewExists()` - Vérifier si un avis existe

## 🧪 Tester avec les Émulateurs (Optionnel)

Pour développer localement sans utiliser Firebase:

```bash
npm install -g firebase-tools
firebase emulators:start
```

## 📚 Ressources

- [Documentation Firebase](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Storage](https://firebase.google.com/docs/storage)

## ⚠️ Notes Importantes

1. **Sécurité**: Ne jamais commiter `.env.local` avec les vraies credentials
2. **Quotas**: Vérifier les quotas Firebase (lecture/écriture)
3. **Indexation**: Firestore crée automatiquement les index nécessaires
4. **Coûts**: Surveiller les coûts Firebase (stockage, lectures, écritures)
