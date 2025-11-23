# Comment Accéder au Employer Dashboard

## 🎯 Accès Rapide

### Via le Menu Utilisateur
1. Connecte-toi en tant qu'**employeur**
2. Clique sur ton **avatar** en haut à droite
3. Clique sur **"Tableau de bord"** 📊

### Via la Navigation Principale
1. Connecte-toi en tant qu'**employeur**
2. Clique sur **"Mes Offres"** dans le menu principal
3. Tu arrives au **Employer Dashboard**

### Via l'URL Directe
```
http://localhost:3000/employer-dashboard
```

---

## 📍 Où Trouver les Liens

### Desktop
```
┌─────────────────────────────────────────────────────────┐
│ JobCamer  [Rechercher] [Mes Offres] [Publier une offre] │
│                                              [Avatar] ▼  │
│                                              ┌──────────┐ │
│                                              │ Profil   │ │
│                                              │ Tableau  │ │
│                                              │ Paramètres│ │
│                                              │ Déconnexion│
│                                              └──────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────────────────────────────────┐
│ JobCamer                                    [Menu] [Avatar]│
│                                                             │
│ Après clic sur Menu:                                       │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ Rechercher                                          │   │
│ │ Mes Offres                                          │   │
│ │ Publier une offre                                   │   │
│ │ Connexion / Inscription                             │   │
│ └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités du Dashboard

### Vue Liste des Offres
- ✅ Voir toutes tes offres
- ✅ Filtrer par statut (Actives, Fermées, Complétées)
- ✅ Rechercher une offre
- ✅ Voir les statistiques

### Vue Candidatures
- ✅ Voir tous les candidats pour une offre
- ✅ Voir le profil du candidat
- ✅ Voir l'évaluation et l'expérience
- ✅ Accepter ou rejeter une candidature
- ✅ Envoyer un message

### Vue Chat
- ✅ Communiquer avec les candidats
- ✅ Historique des messages
- ✅ Heure de chaque message

---

## 🚀 Flux d'Utilisation

### Scénario 1 : Voir tes Offres
```
1. Clique "Mes Offres" (dans le menu)
2. Tu vois la liste de tes offres
3. Clique sur une offre pour voir les détails
4. Clique "X Candidats" pour voir les candidatures
```

### Scénario 2 : Gérer une Candidature
```
1. Va au Dashboard
2. Clique "X Candidats" sur une offre
3. Clique "Message" pour discuter
4. Clique "Accepter" ou "Rejeter"
```

### Scénario 3 : Publier une Nouvelle Offre
```
1. Clique "Publier une offre" (dans le menu)
2. Remplis le formulaire
3. Clique "Publier l'offre"
4. Retour au Dashboard
5. Ton offre apparaît dans la liste
```

---

## 📊 Statistiques Affichées

Le Dashboard affiche en haut :
- **Offres Actives** : Nombre d'offres ouvertes
- **Candidatures** : Nombre total de candidats
- **Vues Totales** : Nombre de personnes qui ont vu tes offres
- **Complétées** : Nombre d'offres terminées

---

## 🔍 Recherche et Filtres

### Recherche
- Tape le titre de l'offre
- Recherche en temps réel

### Filtres
- **Tous** : Affiche toutes les offres
- **Actives** : Offres ouvertes aux candidatures
- **Fermées** : Offres fermées
- **Complétées** : Offres terminées

---

## 💬 Système de Messagerie

### Comment Envoyer un Message
1. Va aux candidatures d'une offre
2. Clique "Message" pour un candidat
3. Écris ton message
4. Clique "Envoyer" ou appuie sur Entrée

### Historique
- Tous les messages sont conservés
- Tu peux voir l'historique complet
- Les messages affichent l'heure

---

## 🎨 Design Responsive

Le Dashboard fonctionne sur :
- ✅ **Desktop** (1920px+)
- ✅ **Tablet** (768px - 1024px)
- ✅ **Mobile** (< 768px)

---

## ⚠️ Important

### Accès Réservé aux Employeurs
- ⚠️ Seuls les employeurs peuvent accéder au Dashboard
- ⚠️ Les travailleurs verront une erreur
- ⚠️ Connecte-toi avec un compte employeur

### Données Mock
- 📌 Le Dashboard utilise des données mock pour tester
- 📌 Les données ne sont pas sauvegardées
- 📌 À l'avenir, les données viendront de Firestore

---

## 🆘 Dépannage

### Je ne vois pas "Mes Offres"
- ✅ Vérifie que tu es connecté en tant qu'**employeur**
- ✅ Recharge la page (F5)
- ✅ Vérification du rôle dans le profil

### Je ne vois pas le Dashboard
- ✅ Vérifie l'URL : `http://localhost:3000/employer-dashboard`
- ✅ Vérifie que tu es connecté
- ✅ Vérifie que tu es employeur

### Les liens ne fonctionnent pas
- ✅ Recharge la page (F5)
- ✅ Vide le cache du navigateur (Ctrl+Shift+Delete)
- ✅ Redémarre le serveur

---

## 📚 Documentation Complète

Voir **EMPLOYER_DASHBOARD_GUIDE.md** pour :
- Vue d'ensemble complète
- 4 vues détaillées
- Fonctionnalités complètes
- Flux d'utilisation
- Exemples de données

---

## ✅ Résumé

| Élément | Accès |
|---------|-------|
| **Menu Utilisateur** | Avatar → Tableau de bord |
| **Navigation Principale** | Mes Offres |
| **URL Directe** | `/employer-dashboard` |
| **Rôle Requis** | Employeur |
| **Responsive** | Oui (Mobile/Tablet/Desktop) |

**Tout est prêt ! Teste maintenant ! 🚀**
