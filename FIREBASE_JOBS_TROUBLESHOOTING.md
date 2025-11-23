# Dépannage - Erreur de Publication d'Offres

## 🔴 Problème

Quand tu publies une offre, tu reçois l'erreur :
```
❌ Erreur lors de la publication de l'offre
⚠️ Aucun job dans Firebase, utilisation des données mock
```

---

## 🔍 Diagnostic

### Étape 1 : Vérifier les Logs Console

Ouvre la console du navigateur (F12) et cherche les logs détaillés :

```
📝 Tentative de création d'offre avec les données: {...}
❌ Erreur lors de la création de l'offre: ...
Code d'erreur: permission-denied
Message d'erreur: Missing or insufficient permissions.
```

### Étape 2 : Identifier le Type d'Erreur

#### 🔒 Erreur : `permission-denied`
```
🔒 Erreur de permission - Vérifiez les règles de sécurité Firestore
```

**Cause** : Les règles de sécurité Firestore ne permettent pas l'écriture

**Solution** : Voir section "Configurer les Règles de Sécurité"

#### 🔐 Erreur : `unauthenticated`
```
🔐 Utilisateur non authentifié
```

**Cause** : L'utilisateur n'est pas connecté

**Solution** : 
1. Vérifie que tu es connecté
2. Vérifie que le token d'authentification est valide

#### ⚠️ Erreur : `unavailable`
```
⚠️ Firestore est indisponible - Vérifiez votre connexion Internet
```

**Cause** : Firestore n'est pas accessible

**Solution** :
1. Vérifie ta connexion Internet
2. Vérifie que Firestore est créé dans Firebase Console
3. Vérifie que le projet Firebase est actif

---

## ✅ Solution Complète

### Étape 1 : Vérifier que Firestore Existe

1. Va à **Firebase Console** : https://console.firebase.google.com
2. Sélectionne le projet **jobcamer-65a6d**
3. Clique sur **Firestore Database** (dans le menu de gauche)
4. Tu devrais voir une base de données

**Si tu ne vois pas Firestore** :
- Clique sur **"Create database"**
- Sélectionne **"Start in test mode"**
- Sélectionne la région **"Europe"** (ou proche de toi)
- Clique **"Create"**

### Étape 2 : Configurer les Règles de Sécurité

1. Dans **Firestore Database**, clique sur l'onglet **"Rules"**
2. Remplace le contenu par :

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre à chacun de lire les offres
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null && 
                       request.resource.data.employerId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.employerId == request.auth.uid;
    }
    
    // Permettre à chacun de lire/écrire ses propres données
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

3. Clique **"Publish"**

### Étape 3 : Vérifier l'Authentification

1. Ouvre la console (F12)
2. Cherche le log :
```
✅ Utilisateur connecté avec Google: user123
```

3. Si tu vois ce log, l'authentification fonctionne ✅

### Étape 4 : Tester la Publication

1. Connecte-toi en tant qu'employeur
2. Va à `/post-job`
3. Remplis le formulaire
4. Clique **"Publier l'offre"**
5. Ouvre la console (F12)
6. Tu devrais voir :

```
📝 Tentative de création d'offre avec les données: {...}
✅ Offre créée avec succès dans Firebase: abc123def456
✅ Offre publiée avec succès
```

---

## 🐛 Erreurs Courantes

### Erreur 1 : `permission-denied`

**Symptôme** :
```
🔒 Erreur de permission - Vérifiez les règles de sécurité Firestore
```

**Cause** : Les règles de sécurité ne permettent pas l'écriture

**Solution** :
1. Va à Firebase Console → Firestore → Rules
2. Remplace par les règles ci-dessus
3. Clique "Publish"
4. Attends 1-2 minutes
5. Réessaie

### Erreur 2 : `unauthenticated`

**Symptôme** :
```
🔐 Utilisateur non authentifié
```

**Cause** : L'utilisateur n'est pas connecté

**Solution** :
1. Vérifie que tu es connecté
2. Ouvre la console (F12)
3. Cherche le log :
```
✅ Utilisateur connecté avec Google: user123
```

4. Si tu ne vois pas ce log, reconnecte-toi

### Erreur 3 : `unavailable`

**Symptôme** :
```
⚠️ Firestore est indisponible - Vérifiez votre connexion Internet
```

**Cause** : Firestore n'est pas accessible

**Solution** :
1. Vérifie ta connexion Internet
2. Va à Firebase Console
3. Vérifie que Firestore est créé
4. Si Firestore n'existe pas, crée-le (voir Étape 1)

---

## 📊 Vérifier les Données dans Firebase

### Après la Publication

1. Va à **Firebase Console**
2. Clique sur **Firestore Database**
3. Tu devrais voir une collection **"jobs"**
4. Clique sur **"jobs"**
5. Tu devrais voir tes offres publiées

### Exemple de Document

```json
{
  "id": "auto-generated",
  "employerId": "S0MmC2xulxbtYZp55lTEkfXi2i02",
  "title": "Maçon pour construction villa",
  "description": "Nous cherchons un maçon expérimenté...",
  "category": "construction",
  "location": {
    "city": "Yaoundé",
    "district": "Bastos"
  },
  "budget": 500000,
  "duration": 30,
  "startDate": "2024-11-20T00:00:00Z",
  "urgent": true,
  "requirements": ["Expérience 5+ ans"],
  "applicants": [],
  "status": "open",
  "createdAt": "2024-11-12T01:28:00Z",
  "updatedAt": "2024-11-12T01:28:00Z"
}
```

---

## 🧪 Checklist de Dépannage

- [ ] Firestore est créé dans Firebase Console
- [ ] Les règles de sécurité sont configurées
- [ ] Les règles sont publiées
- [ ] L'utilisateur est connecté
- [ ] La console affiche les logs détaillés
- [ ] Aucune erreur `permission-denied`
- [ ] Aucune erreur `unauthenticated`
- [ ] Aucune erreur `unavailable`
- [ ] L'offre apparaît dans Firebase Console
- [ ] L'offre persiste après actualisation

---

## 📝 Logs Attendus

### Succès
```
📝 Tentative de création d'offre avec les données: {...}
✅ Offre créée avec succès dans Firebase: abc123def456
✅ Offre publiée avec succès
✅ Offres de l'employeur chargées: 1
```

### Erreur Permission
```
📝 Tentative de création d'offre avec les données: {...}
❌ Erreur lors de la création de l'offre: FirebaseError: ...
Code d'erreur: permission-denied
Message d'erreur: Missing or insufficient permissions.
🔒 Erreur de permission - Vérifiez les règles de sécurité Firestore
```

### Erreur Authentification
```
📝 Tentative de création d'offre avec les données: {...}
❌ Erreur lors de la création de l'offre: FirebaseError: ...
Code d'erreur: unauthenticated
Message d'erreur: Missing or insufficient permissions.
🔐 Utilisateur non authentifié
```

---

## 🚀 Prochaines Étapes

1. Ouvre la console (F12)
2. Essaie de publier une offre
3. Regarde les logs
4. Identifie le type d'erreur
5. Applique la solution correspondante
6. Réessaie

---

## 💡 Conseils

### Pour Déboguer
1. Ouvre la console (F12)
2. Cherche les logs avec `📝`, `✅`, `❌`
3. Note le code d'erreur
4. Cherche la solution correspondante

### Pour Vérifier Firebase
1. Va à Firebase Console
2. Clique sur **Firestore Database**
3. Cherche la collection **"jobs"**
4. Vérifie que tes offres y sont

### Pour Vérifier l'Authentification
1. Ouvre la console (F12)
2. Cherche le log :
```
✅ Utilisateur connecté avec Google: user123
```

3. Si tu ne vois pas ce log, tu n'es pas connecté

---

## 📞 Support

Si tu as toujours des problèmes :

1. Copie les logs complets de la console (F12)
2. Copie le code d'erreur
3. Copie le message d'erreur
4. Partage-les pour obtenir de l'aide

---

## ✨ Résumé

| Étape | Action |
|-------|--------|
| 1 | Vérifier que Firestore existe |
| 2 | Configurer les règles de sécurité |
| 3 | Vérifier l'authentification |
| 4 | Tester la publication |
| 5 | Vérifier les données dans Firebase |

**Tout est prêt ! Suis les étapes ci-dessus ! 🚀**
