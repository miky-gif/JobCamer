# Explication des Logs Console

## Ce que tu Vois Actuellement

```
Login.tsx:57 Utilisateur connecté avec Google: ZjyNMAGIKGY5Gst2B1WfX7PeCTu1
authService.ts:144  Erreur lors de la récupération du profil: FirebaseError: Failed to get document because the client is offline.
Login.tsx:79  Erreur connexion Google: FirebaseError: Failed to get document because the client is offline.
```

### Explication

1. **"Utilisateur connecté avec Google: ZjyNMAGIKGY5Gst2B1WfX7PeCTu1"** ✅
   - L'authentification Google **fonctionne**
   - L'utilisateur est créé dans Firebase Auth
   - L'ID de l'utilisateur est `ZjyNMAGIKGY5Gst2B1WfX7PeCTu1`

2. **"Erreur lors de la récupération du profil: FirebaseError: Failed to get document because the client is offline."** ❌
   - Firestore **n'est pas accessible**
   - L'application essaie de lire le profil utilisateur
   - Mais Firestore répond "offline"

3. **"Erreur connexion Google: FirebaseError: Failed to get document because the client is offline."** ❌
   - L'erreur Firestore est propagée jusqu'à Login.tsx
   - L'utilisateur voit un message d'erreur

### Pourquoi ?

**Firestore n'est pas créé ou pas accessible** dans Firebase Console.

---

## Ce que tu Devrais Voir Après la Correction

### Après l'Inscription Google

```
Register.tsx:81 Inscription Google en cours...
Register.tsx:83 Utilisateur créé avec Google: EkUYA09HrQWPNoWhr8SjOjGyBum1
Onboarding.tsx:127 Sauvegarde du profil pour: EkUYA09HrQWPNoWhr8SjOjGyBum1
Onboarding.tsx:162 Données à sauvegarder: Object
authService.ts:152 Mise à jour du profil pour userId: EkUYA09HrQWPNoWhr8SjOjGyBum1
authService.ts:159 Données à sauvegarder (nettoyées): Object
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

**Explication** :
1. L'inscription Google démarre
2. L'utilisateur est créé
3. L'application redirige vers le stepper d'onboarding
4. L'utilisateur sélectionne son rôle
5. Le profil est sauvegardé dans Firestore ✅
6. L'utilisateur est redirigé selon son rôle

### Après la Connexion Google

```
Login.tsx:57 Utilisateur connecté avec Google: ZjyNMAGIKGY5Gst2B1WfX7PeCTu1
Login.tsx:63 Profil trouvé avec rôle: worker
Login.tsx:68 Redirection worker vers /search
```

**Explication** :
1. L'authentification Google fonctionne
2. L'application lit le profil depuis Firestore ✅
3. Le profil a un rôle (worker)
4. L'utilisateur est redirigé vers `/search`

---

## Logs Détaillés par Étape

### 1. Inscription Email

```
Register.tsx:49 Inscription en cours avec: { email: '...', firstName: '...', ... }
Register.tsx:54 Utilisateur créé avec succès: user123
Onboarding.tsx:127 Sauvegarde du profil pour: user123
Onboarding.tsx:162 Données à sauvegarder: Object
authService.ts:152 Mise à jour du profil pour userId: user123
authService.ts:159 Données à sauvegarder (nettoyées): Object
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

### 2. Inscription Google

```
Register.tsx:81 Inscription Google en cours...
Register.tsx:83 Utilisateur créé avec Google: user123
Onboarding.tsx:127 Sauvegarde du profil pour: user123
Onboarding.tsx:162 Données à sauvegarder: Object
authService.ts:152 Mise à jour du profil pour userId: user123
authService.ts:159 Données à sauvegarder (nettoyées): Object
✅ Profil sauvegardé avec succès
✅ Redirection selon le rôle: worker
```

### 3. Connexion Email

```
Login.tsx:25 Utilisateur connecté: user123
authService.ts:147 Récupération du profil pour userId: user123
authService.ts:152 Profil trouvé: { id: 'user123', role: 'worker', ... }
Login.tsx:30 Profil trouvé avec rôle: worker
Login.tsx:34 Redirection worker vers /search
```

### 4. Connexion Google

```
Login.tsx:57 Utilisateur connecté avec Google: user123
Login.tsx:60 Attendre 1s pour synchronisation Firestore
authService.ts:147 Récupération du profil pour userId: user123
authService.ts:152 Profil trouvé: { id: 'user123', role: 'worker', ... }
Login.tsx:65 Profil trouvé avec rôle: worker
Login.tsx:68 Redirection worker vers /search
```

---

## Erreurs Courantes et Leurs Significations

### ❌ "Failed to get document because the client is offline"

**Signification** : Firestore n'est pas accessible

**Causes** :
- Firestore n'est pas créé
- Firestore n'est pas activé
- Pas de connexion Internet
- Règles de sécurité trop restrictives

**Solution** : Voir `QUICK_FIX.md`

### ❌ "Unsupported field value: undefined"

**Signification** : Tu envoies un champ avec la valeur `undefined` à Firestore

**Exemple** :
```
{ role: 'worker', category: undefined }  // ❌ Mauvais
```

**Solution** : Nettoyer les champs `undefined` avant d'envoyer

### ❌ "Permission denied"

**Signification** : Les règles de sécurité bloquent l'accès

**Solution** : Vérifier les règles Firestore

### ❌ "User not found"

**Signification** : L'utilisateur n'existe pas dans Firebase Auth

**Solution** : Vérifier que l'utilisateur est créé

---

## Comment Lire les Logs

### Format

```
[Fichier]:[Ligne] [Message]
```

### Exemple

```
Login.tsx:57 Utilisateur connecté avec Google: user123
```

- **Fichier** : `Login.tsx`
- **Ligne** : `57`
- **Message** : `Utilisateur connecté avec Google: user123`

### Couleurs

- 🔵 **Bleu** : Logs normaux (console.log)
- 🟡 **Jaune** : Avertissements (console.warn)
- 🔴 **Rouge** : Erreurs (console.error)

---

## Checklist de Vérification

- [ ] Firestore est créé dans Firebase Console
- [ ] Les règles de sécurité permettent les lectures/écritures
- [ ] Internet fonctionne
- [ ] La page se charge correctement
- [ ] Les logs dans la Console sont clairs
- [ ] Pas d'erreur "offline"
- [ ] Pas d'erreur "undefined"

---

## Prochaines Étapes

1. Ouvre la Console (F12)
2. Cherche les logs
3. Compare avec les logs attendus
4. Si erreur, consulte `QUICK_FIX.md`
5. Si toujours erreur, consulte `FIRESTORE_DIAGNOSTIC.md`
