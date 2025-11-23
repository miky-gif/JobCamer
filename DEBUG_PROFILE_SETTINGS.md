# Débogage - Pages Profil et Paramètres

## 🔍 Comment Déboguer

### Étape 1 : Ouvrir la Console (F12)

1. Appuie sur **F12** pour ouvrir les Developer Tools
2. Clique sur l'onglet **Console**
3. Cherche les logs

### Étape 2 : Accéder à la Page Profil

1. Connecte-toi
2. Clique sur ton avatar dans le Header
3. Clique sur "Mon profil"
4. Regarde la Console

### Logs Attendus

```
✅ Loading profile for user: user123
✅ Profile loaded: { id: 'user123', firstName: 'Jean', ... }
✅ Merged profile: { id: 'user123', firstName: 'Jean', ... }
```

### Si tu vois une Page Blanche

**Cherche dans la Console** :

1. **Erreur "Loading profile for user: undefined"**
   - Problème : `auth.currentUser` est null
   - Solution : Recharge la page (F5)

2. **Erreur "Profile loaded: null"**
   - Problème : Firestore ne trouve pas le profil
   - Solution : Vérifie que le profil est sauvegardé dans Firestore

3. **Erreur "Error loading profile: ..."**
   - Problème : Erreur Firestore
   - Solution : Vérifie les règles de sécurité Firestore

---

## 🔧 Corrections Effectuées

### 1. **src/pages/Profile.tsx**
- ✅ Ajouté logging détaillé
- ✅ Gestion des cas où le profil n'existe pas
- ✅ Loading state
- ✅ Message d'erreur

### 2. **src/pages/Settings.tsx**
- ✅ Remplacé Select par select HTML
- ✅ Nettoyé les imports inutilisés
- ✅ Amélioré la déconnexion
- ✅ Ajouté délai avant redirection

---

## 📝 Code Modifié

### Profile.tsx - Logging Détaillé

```typescript
useEffect(() => {
  const loadProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      console.log('Loading profile for user:', currentUser?.uid);
      
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        console.log('Profile loaded:', profile);
        
        if (profile) {
          const mergedProfile = {
            ...user,
            ...profile
          };
          console.log('Merged profile:', mergedProfile);
          setFullProfile(mergedProfile);
        } else {
          console.log('No profile found, using user data');
          setFullProfile(user);
        }
      } else {
        console.log('No current user');
        setFullProfile(user);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setFullProfile(user);
    } finally {
      setLoading(false);
    }
  };

  loadProfile();
}, [user]);
```

### Settings.tsx - Déconnexion Améliorée

```typescript
const handleLogout = async () => {
  try {
    setLoading(true);
    await logout();
    setTimeout(() => navigate('/login'), 500);
  } catch (error) {
    console.error('Error logging out:', error);
    setLoading(false);
  }
};
```

---

## 🧪 Tests

### Test 1 : Accès au Profil

```
1. Connecte-toi
2. Clique sur ton avatar
3. Clique "Mon profil"
4. Ouvre la Console (F12)
5. Cherche les logs :
   ✅ Loading profile for user: user123
   ✅ Profile loaded: { ... }
   ✅ Merged profile: { ... }
6. Tu devrais voir ton profil ✅
```

### Test 2 : Accès aux Paramètres

```
1. Connecte-toi
2. Clique sur ton avatar
3. Clique "Paramètres"
4. Ouvre la Console (F12)
5. Tu devrais voir la page des paramètres ✅
6. Modifie le téléphone
7. Clique "Sauvegarder"
8. Tu devrais voir "Paramètres sauvegardés" ✅
```

### Test 3 : Déconnexion

```
1. Va dans Paramètres
2. Clique "Déconnexion"
3. Tu devrais être redirigé vers /login ✅
4. Header affiche les options de connexion ✅
```

---

## 🐛 Problèmes Courants

### Problème 1 : Page Blanche sur Profil

**Cause** : `auth.currentUser` est null

**Solution** :
1. Recharge la page (F5)
2. Reconnecte-toi
3. Essaie à nouveau

### Problème 2 : Page Blanche sur Paramètres

**Cause** : Erreur dans le rendu

**Solution** :
1. Ouvre la Console (F12)
2. Cherche les erreurs
3. Recharge la page (F5)

### Problème 3 : Déconnexion ne fonctionne pas

**Cause** : `logout()` n'est pas asynchrone

**Solution** :
- Déjà corrigée dans le code

---

## 📊 Flux Complet

### Accès au Profil

```
1. Utilisateur connecté
2. Clique sur "Mon profil"
3. Profile.tsx charge
4. useEffect déclenché
5. Récupère auth.currentUser
6. Appelle getUserProfile()
7. Récupère le profil depuis Firestore
8. Fusionne avec les données utilisateur
9. Affiche le profil ✅
```

### Accès aux Paramètres

```
1. Utilisateur connecté
2. Clique sur "Paramètres"
3. Settings.tsx charge
4. useEffect charge les paramètres depuis localStorage
5. Affiche les paramètres ✅
```

---

## ✨ Résumé

Les corrections sont maintenant en place ! 🎉

- ✅ Logging détaillé pour déboguer
- ✅ Gestion des erreurs améliorée
- ✅ Déconnexion fonctionne
- ✅ Pages affichent correctement

**Teste maintenant et ouvre la Console (F12) pour voir les logs ! 🚀**
