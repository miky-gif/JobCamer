# 🔧 Guide de Dépannage des Notifications

## Problème : Les notifications ne sont pas créées lors de la création de compte

### ✅ Étapes de Diagnostic

1. **Ouvrir la Console du Navigateur (F12)**
   - Onglet "Console" pour voir les logs
   - Onglet "Network" pour voir les requêtes Firebase

2. **Utiliser le Bouton de Test**
   - Aller sur la page Profil
   - Cliquer sur le bouton "Tester" dans la section jaune
   - Vérifier les résultats dans la console

3. **Vérifier les Logs**
   - Rechercher les messages commençant par 🔍, ✅, ❌
   - Noter les erreurs spécifiques

### 🔍 Causes Possibles

#### 1. **Règles Firestore Incorrectes**
**Symptôme** : Erreur "Missing or insufficient permissions"

**Solution** :
1. Aller dans Firebase Console
2. Firestore Database > Règles
3. Copier-coller le contenu de `firestore.rules`
4. Cliquer sur "Publier"

#### 2. **Collection Firestore Inexistante**
**Symptôme** : Erreur "Collection does not exist"

**Solution** :
1. Aller dans Firebase Console
2. Firestore Database > Données
3. Créer manuellement la collection "notifications"
4. Ajouter un document test

#### 3. **Problème d'Authentification**
**Symptôme** : `request.auth` est null

**Solution** :
1. Vérifier que l'utilisateur est bien connecté
2. Vérifier le token d'authentification dans les outils de développement
3. Redémarrer l'application si nécessaire

#### 4. **Configuration Firebase Incorrecte**
**Symptôme** : Erreur de connexion Firebase

**Solution** :
1. Vérifier le fichier `.env.local`
2. Vérifier que toutes les clés Firebase sont correctes
3. Vérifier que Firestore est activé dans Firebase Console

### 📋 Checklist de Vérification

- [ ] Firebase Console : Firestore Database est créé et activé
- [ ] Firebase Console : Authentication est activé (Email/Password + Google)
- [ ] Firebase Console : Règles Firestore sont configurées correctement
- [ ] Projet : Fichier `.env.local` existe avec les bonnes clés
- [ ] Projet : Collection "notifications" existe dans Firestore
- [ ] Navigateur : Utilisateur est authentifié (vérifier dans F12 > Application > Local Storage)

### 🧪 Tests Manuels

#### Test 1 : Créer une Notification Simple
```javascript
// Dans la console du navigateur
import { createNotification } from './src/services/notificationService';
await createNotification('USER_ID', 'account_created', 'Test', 'Message de test');
```

#### Test 2 : Vérifier l'Authentification
```javascript
// Dans la console du navigateur
import { auth } from './src/config/firebase';
console.log('Utilisateur connecté:', auth.currentUser);
```

#### Test 3 : Tester Firestore
```javascript
// Dans la console du navigateur
import { db } from './src/config/firebase';
import { collection, addDoc } from 'firebase/firestore';
await addDoc(collection(db, 'test'), { message: 'test' });
```

### 🔧 Solutions Rapides

#### Solution 1 : Réinitialiser les Règles Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Solution 2 : Créer une Notification Manuellement
1. Firebase Console > Firestore > Ajouter une collection
2. ID de collection : `notifications`
3. Ajouter un document avec :
   ```json
   {
     "userId": "VOTRE_USER_ID",
     "type": "account_created",
     "title": "Test",
     "message": "Test manuel",
     "read": false,
     "createdAt": "2024-11-18T15:00:00Z"
   }
   ```

### 📞 Support

Si le problème persiste :

1. **Copier les logs de la console** (F12)
2. **Faire une capture d'écran** des règles Firestore
3. **Vérifier la configuration** Firebase dans `.env.local`
4. **Tester avec un nouveau compte** utilisateur

### 🎯 Résultat Attendu

Après correction, vous devriez voir :
- ✅ Notification de bienvenue lors de l'inscription
- ✅ Notification de profil complété lors de l'onboarding
- ✅ Notifications de messages lors des conversations
- ✅ Compteur de notifications non lues dans l'interface
