# Guide - Employer Dashboard (Tableau de Bord Employeur)

## 🎯 Vue d'Ensemble

Le **Employer Dashboard** est une interface complète de gestion des offres d'emploi inspirée de **Meta Business Suite**. Elle permet aux employeurs de :

- ✅ Voir toutes leurs offres d'emploi
- ✅ Gérer les candidatures
- ✅ Communiquer avec les candidats
- ✅ Valider ou rejeter les candidats
- ✅ Suivre les statistiques

---

## 📍 Accès

**Route** : `/employer-dashboard`

**Navigation** :
1. Connecte-toi en tant qu'employeur
2. Va dans le menu
3. Clique sur "Tableau de Bord" ou "Mes Offres"

---

## 🎨 Interface - 4 Vues Principales

### 1. **Vue Liste des Offres** (Accueil du Dashboard)

#### Affichage
- **Barre de recherche** : Rechercher une offre par titre
- **Filtres** : Tous, Actives, Fermées, Complétées
- **Statistiques** : 
  - Offres Actives
  - Nombre de Candidatures
  - Vues Totales
  - Offres Complétées

#### Chaque Offre Affiche
- **Titre** avec badge URGENT (si applicable)
- **Statut** : Actif, Fermé, Complété
- **Description** (aperçu)
- **Localisation** : Ville, Quartier
- **Budget** : Montant en FCFA
- **Durée** : Nombre de jours
- **Vues** : Nombre de personnes qui ont vu l'offre
- **Boutons d'action** :
  - "X Candidats" : Voir les candidatures
  - "Détails" : Voir les détails complets
  - Menu (⋮) : Modifier, Supprimer

#### Exemple
```
┌─────────────────────────────────────────────────────────────┐
│ Maçon pour construction villa                    [URGENT]   │
│ [Actif]                                                     │
│ Nous cherchons un maçon expérimenté pour...                │
│ 📍 Yaoundé, Bastos | 💰 500,000 FCFA | ⏱️ 30 jours | 👁️ 245 │
│ [2 Candidats] [Détails] [⋮]                                │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. **Vue Détails de l'Offre**

#### Affichage
- **Titre** de l'offre
- **Statut** (Actif/Fermé/Complété)
- **Budget** total
- **Durée** en jours
- **Nombre de candidatures**
- **Description complète**
- **Localisation** détaillée
- **Boutons** :
  - "Retour" : Revenir à la liste
  - "Voir les Candidatures (X)" : Aller à la vue candidatures

#### Exemple
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour                                                    │
│                                                             │
│ Maçon pour construction villa                    [Actif]   │
│ Publié le 10/11/2024                                       │
│                                                             │
│ Budget: 500,000 FCFA | Durée: 30 jours | Candidatures: 2 │
│                                                             │
│ Description                                                 │
│ Nous cherchons un maçon expérimenté pour construire une   │
│ villa de 3 chambres...                                     │
│                                                             │
│ Localisation                                                │
│ Yaoundé, Bastos                                            │
│                                                             │
│ [Retour] [Voir les Candidatures (2)]                      │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. **Vue Candidatures**

#### Affichage
- **Titre** : "Candidatures pour [Titre de l'offre]"
- **Nombre de candidats**
- **Liste des candidats** avec :
  - **Avatar** : Photo du candidat
  - **Nom** : Prénom et Nom
  - **Évaluation** : ⭐⭐⭐⭐⭐ (4.8/5)
  - **Expérience** : Nombre de missions complétées
  - **Bio** : Courte description
  - **Date de candidature** : Quand il a postulé
  - **Statut** : En attente, Accepté, Rejeté
  - **Boutons d'action** :
    - "Message" : Envoyer un message
    - "Accepter" : Accepter la candidature (si en attente)
    - "Rejeter" : Rejeter la candidature (si en attente)

#### Exemple
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour                                                    │
│                                                             │
│ Candidatures pour "Maçon pour construction villa"          │
│ 2 candidats                                                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Jean Kamga                      [En attente]   │ │
│ │ ⭐⭐⭐⭐⭐ 4.8 (12 missions)                                │ │
│ │ Maçon expérimenté avec 10 ans d'expérience             │ │
│ │ Candidature du 15/11/2024                              │ │
│ │ [Message] [Accepter] [Rejeter]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Pierre Nkomo                    [En attente]   │ │
│ │ ⭐⭐⭐⭐ 4.5 (8 missions)                                  │ │
│ │ Spécialisé en construction résidentielle               │ │
│ │ Candidature du 14/11/2024                              │ │
│ │ [Message] [Accepter] [Rejeter]                         │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. **Vue Chat avec Candidat**

#### Affichage
- **En-tête** :
  - Avatar du candidat
  - Nom du candidat
  - Offre pour laquelle il a postulé
- **Historique des messages** :
  - Messages du candidat (à gauche, gris)
  - Tes messages (à droite, bleu)
  - Heure de chaque message
- **Zone de saisie** :
  - Input pour écrire un message
  - Bouton "Envoyer" (icône avion)

#### Exemple
```
┌─────────────────────────────────────────────────────────────┐
│ ← Retour                                                    │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Jean Kamga                                     │ │
│ │ Pour: Maçon pour construction villa                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Historique des messages                                 │ │
│ │                                                         │ │
│ │ [Candidat] Bonjour, je suis intéressé par cette offre  │ │
│ │           14:30                                         │ │
│ │                                                         │ │
│ │                  [Toi] Merci pour votre intérêt. Pouvez│ │
│ │                        vous me parler de votre expérien│ │
│ │                        15:45                            │ │
│ │                                                         │ │
│ │ [Candidat] Bien sûr! J'ai 10 ans d'expérience...      │ │
│ │           16:00                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Écrivez votre message...] [Envoyer]                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Fonctionnalités Détaillées

### Recherche et Filtrage

#### Recherche
- Recherche par **titre de l'offre**
- Recherche en **temps réel**
- Insensible à la casse

#### Filtres
- **Tous** : Affiche toutes les offres
- **Actives** : Offres ouvertes aux candidatures
- **Fermées** : Offres fermées
- **Complétées** : Offres terminées

### Gestion des Candidatures

#### Statuts
- **En attente** : Candidature reçue, pas encore traitée
- **Accepté** : Candidature acceptée, travailleur engagé
- **Rejeté** : Candidature refusée

#### Actions
- **Message** : Envoyer un message au candidat
- **Accepter** : Accepter la candidature
- **Rejeter** : Rejeter la candidature

### Statistiques

#### Affichées
- **Offres Actives** : Nombre d'offres ouvertes
- **Candidatures** : Nombre total de candidatures reçues
- **Vues Totales** : Nombre de personnes qui ont vu tes offres
- **Complétées** : Nombre d'offres terminées

---

## 💬 Système de Messagerie

### Fonctionnalités
- ✅ Envoyer des messages aux candidats
- ✅ Recevoir des messages des candidats
- ✅ Historique des conversations
- ✅ Heure de chaque message
- ✅ Distinction visuelle (toi vs candidat)

### Utilisation
1. Va à la vue "Candidatures"
2. Clique sur "Message" pour un candidat
3. Écris ton message
4. Clique "Envoyer" ou appuie sur Entrée

---

## 🚀 Flux d'Utilisation Complet

### Scénario 1 : Publier une Offre et Gérer les Candidatures

```
1. Clique "Nouvelle Offre"
   ↓
2. Remplis le formulaire (titre, description, budget, etc.)
   ↓
3. Clique "Publier l'offre"
   ↓
4. Retour au Dashboard
   ↓
5. Ton offre apparaît dans la liste
   ↓
6. Les candidats postulent
   ↓
7. Tu vois les candidatures dans "X Candidats"
   ↓
8. Tu peux :
   - Voir le profil du candidat
   - Envoyer un message
   - Accepter ou rejeter
```

### Scénario 2 : Communiquer avec un Candidat

```
1. Va au Dashboard
   ↓
2. Clique sur une offre → "X Candidats"
   ↓
3. Clique "Message" pour un candidat
   ↓
4. Écris et envoie des messages
   ↓
5. Discute des détails du travail
   ↓
6. Accepte la candidature si intéressé
```

---

## 📊 Statistiques et Métriques

### Affichées
- **Offres Actives** : Combien d'offres sont actuellement ouvertes
- **Candidatures** : Nombre total de candidats
- **Vues** : Combien de personnes ont vu tes offres
- **Complétées** : Offres terminées avec succès

### Utilité
- Voir la performance de tes offres
- Identifier les offres populaires
- Suivre le nombre de candidatures

---

## 🎨 Design et UX

### Couleurs
- **Vert** : Offres actives, candidatures acceptées
- **Jaune** : Candidatures en attente
- **Rouge** : Urgent, candidatures rejetées
- **Bleu** : Tes messages

### Icônes
- 👤 Candidats
- 👁️ Vues
- 💬 Messages
- ✅ Accepté
- ❌ Rejeté
- ⏳ En attente

### Responsive
- ✅ Mobile (1 colonne)
- ✅ Tablet (2 colonnes)
- ✅ Desktop (3+ colonnes)

---

## 🔧 Fonctionnalités Futures

- [ ] Éditer une offre
- [ ] Supprimer une offre
- [ ] Voir le profil complet du candidat
- [ ] Télécharger les CV des candidats
- [ ] Planifier des entretiens
- [ ] Envoyer des notifications
- [ ] Exporter les statistiques
- [ ] Offres sponsorisées
- [ ] Boost d'offre

---

## 📝 Exemple de Données

### Offre
```json
{
  "id": "1",
  "title": "Maçon pour construction villa",
  "description": "Nous cherchons un maçon expérimenté...",
  "category": "construction",
  "location": { "city": "Yaoundé", "district": "Bastos" },
  "budget": 500000,
  "duration": 30,
  "startDate": "2024-11-20",
  "status": "open",
  "views": 245,
  "urgent": true,
  "applicants": [...]
}
```

### Candidat
```json
{
  "id": "a1",
  "workerId": "w1",
  "name": "Jean Kamga",
  "avatar": "https://...",
  "rating": 4.8,
  "totalJobs": 12,
  "bio": "Maçon expérimenté avec 10 ans d'expérience",
  "status": "pending",
  "appliedAt": "2024-11-15"
}
```

---

## ✨ Résumé

Le **Employer Dashboard** offre une interface complète et intuitive pour :
- ✅ Publier et gérer les offres
- ✅ Voir et gérer les candidatures
- ✅ Communiquer avec les candidats
- ✅ Suivre les statistiques
- ✅ Prendre des décisions rapidement

**Inspiré de Meta Business Suite**, il combine la simplicité avec la puissance pour une meilleure gestion des offres d'emploi.

**Tout est prêt ! Teste maintenant ! 🚀**
