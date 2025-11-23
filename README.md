# JobCamer - Plateforme d'Emploi Informel au Cameroun 🇨🇲

## 📱 À propos

JobCamer est une Progressive Web App (PWA) moderne qui connecte les travailleurs qualifiés avec les employeurs au Cameroun. La plateforme facilite la mise en relation pour l'emploi informel dans divers secteurs : construction, agriculture, services domestiques, restauration, livraison, événementiel et artisanat.

## ✨ Fonctionnalités principales

### Pour les Travailleurs
- ✅ Création de profil professionnel avec photo et portfolio
- 🔍 Recherche d'offres par catégorie, localisation et budget
- 💬 Messagerie intégrée pour négociation
- ⭐ Système d'évaluations et avis
- 📅 Gestion de disponibilité
- 🏆 Certifications et badges vérifiés
- 📱 Notifications de nouvelles offres

### Pour les Employeurs
- 📝 Publication d'offres d'emploi
- 👥 Recherche de travailleurs qualifiés
- 💰 Paiements sécurisés (Mobile Money)
- ⭐ Évaluation des travailleurs
- 💬 Chat direct avec les candidats
- 📊 Gestion des candidatures

### Fonctionnalités Techniques
- 🌐 Progressive Web App (installable sur mobile)
- 🌙 Mode sombre
- 📱 Design responsive (mobile-first)
- 🗺️ Géolocalisation et cartes interactives
- 💳 Intégration Mobile Money (Orange Money, MTN MoMo)
- 🔒 Authentification sécurisée
- 💾 Mode hors-ligne pour profils sauvegardés

## 🛠️ Stack Technique

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API + useReducer
- **PWA**: Vite PWA Plugin + Workbox
- **Maps**: React Leaflet
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+ et npm

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

L'application sera accessible sur `http://localhost:3000`

## 📂 Structure du Projet

```
jobcamer/
├── public/
│   ├── icons/              # Icônes PWA
│   └── manifest.json       # Manifeste PWA
├── src/
│   ├── assets/            # Images et ressources
│   ├── components/        # Composants réutilisables
│   │   ├── common/       # Boutons, inputs, cartes
│   │   └── layout/       # Header, navigation
│   ├── context/          # Context API (Auth, Jobs, Chat)
│   ├── data/             # Données mock pour démo
│   ├── pages/            # Pages de l'application
│   ├── types/            # Types TypeScript
│   ├── utils/            # Helpers et constantes
│   ├── App.tsx           # Composant principal
│   ├── main.tsx          # Point d'entrée
│   └── index.css         # Styles globaux
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 Design System

### Palette de couleurs
- **Primaire**: Vert émeraude (#10B981) - Croissance, opportunité
- **Secondaire**: Jaune/Orange (#F59E0B) - Énergie, chaleur
- **Accent**: Rouge (#EF4444) - Urgence, importance

### Catégories de métiers
1. 🏗️ Construction & Chantiers
2. 🌾 Agriculture & Jardinage
3. 🏠 Services Domestiques
4. 🍽️ Restauration & Hôtellerie
5. 🚚 Livraison & Transport
6. 🎉 Événementiel
7. ✂️ Artisanat

## 👤 Comptes de Démonstration

### Travailleur
- **Téléphone**: 677123456
- **Nom**: Jean Kamga
- **Catégorie**: Construction
- **Mot de passe**: n'importe lequel

### Employeur
- **Téléphone**: 677888999
- **Nom**: Robert Mbarga
- **Entreprise**: Mbarga Construction
- **Mot de passe**: n'importe lequel

## 💳 Paiements

L'application simule l'intégration avec :
- **Orange Money** - Paiement mobile Orange
- **MTN Mobile Money** - Paiement mobile MTN
- **Espèces** - Paiement en main propre

Commission plateforme : **8%** par transaction

## 🌍 Localisation

- **Langue principale**: Français
- **Villes supportées**: Yaoundé, Douala, Garoua, Bamenda, Bafoussam, etc.
- **Géolocalisation**: Recherche par proximité avec rayon configurable

## 📱 Installation PWA

### Sur Android
1. Ouvrir l'application dans Chrome
2. Cliquer sur le menu (⋮)
3. Sélectionner "Ajouter à l'écran d'accueil"
4. L'icône apparaîtra sur votre écran d'accueil

### Sur iOS
1. Ouvrir l'application dans Safari
2. Cliquer sur le bouton Partager
3. Sélectionner "Sur l'écran d'accueil"
4. Confirmer l'ajout

## 🔐 Sécurité

- Authentification par numéro de téléphone
- Vérification d'identité (CNI, attestation)
- Système de signalement d'utilisateurs
- Paiements sécurisés via Mobile Money
- Données cryptées

## 🚧 Fonctionnalités à venir

- [ ] Notifications push en temps réel
- [ ] Intégration API Mobile Money réelle
- [ ] Système de géolocalisation en temps réel
- [ ] Support multilingue (Anglais, Pidgin)
- [ ] Backend avec Node.js + Express
- [ ] Base de données PostgreSQL
- [ ] Application mobile React Native

## 📄 Licence

Ce projet est une démonstration pour le marché camerounais.

## 👥 Contact

Pour toute question ou suggestion, contactez l'équipe JobCamer.

---

**Fait avec ❤️ pour le Cameroun** 🇨🇲
