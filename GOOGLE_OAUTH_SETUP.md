# Configuration Google OAuth pour Firebase

## Problème : ERR_CONNECTION_REFUSED

Quand tu cliques sur "Continuer avec Google", tu reçois l'erreur :
```
Désolé, impossible d'accéder à cette page.
localhost a refusé de se connecter.
ERR_CONNECTION_REFUSED
```

**Cause** : Firebase n'a pas les URLs autorisées pour localhost.

## Solution : Configurer les URLs Autorisées

### Étape 1 : Aller dans Firebase Console

1. Ouvre [Firebase Console](https://console.firebase.google.com/)
2. Sélectionne ton projet **JobCamer**
3. Clique sur **⚙️ Paramètres du projet** (en bas à gauche)

### Étape 2 : Configurer les URLs Autorisées

1. Va dans l'onglet **Authentication** (ou **Authentification**)
2. Clique sur **Sign-in method** (ou **Méthode de connexion**)
3. Clique sur **Google**
4. Assure-toi que Google est **Activé** (toggle bleu)
5. Clique sur **Autorised domains** (ou **Domaines autorisés**)

### Étape 3 : Ajouter localhost

1. Clique sur **Ajouter un domaine**
2. Ajoute ces domaines :
   - `localhost`
   - `127.0.0.1`
   - `localhost:5173` (si tu utilises Vite)
   - `localhost:3000` (si tu utilises un autre port)

### Étape 4 : Configurer Google Cloud Console

1. Va dans **Paramètres du projet** → **Intégrations** → **Google Cloud Console**
2. Clique sur le lien pour ouvrir Google Cloud Console
3. Va dans **APIs & Services** → **Credentials**
4. Clique sur ton **OAuth 2.0 Client ID** (Web)
5. Ajoute dans **Authorized JavaScript origins** :
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
6. Ajoute dans **Authorized redirect URIs** :
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   ```
7. Clique sur **Enregistrer**

## Vérification

Après ces changements :
1. Redémarre ton serveur de développement
2. Vide le cache du navigateur (Ctrl+Shift+Delete)
3. Essaie de te connecter avec Google

## Erreurs Courantes

### "popup-closed-by-user"
- C'est normal si l'utilisateur ferme le popup
- Notre code gère déjà cette erreur

### "redirect_uri_mismatch"
- Vérifie que l'URL dans le navigateur correspond à celle configurée
- Assure-toi que le port est correct

### "invalid_client"
- Vérifie que tes credentials Firebase sont correctes
- Redémarre le serveur de développement

## Pour la Production

Quand tu déploies en production :

1. Va dans Firebase Console
2. Ajoute ton domaine de production dans **Authorized domains**
3. Va dans Google Cloud Console
4. Ajoute ton domaine de production dans les **Authorized JavaScript origins** et **Authorized redirect URIs**

Exemple pour production :
```
https://jobcamer.com
https://www.jobcamer.com
```

## Ressources

- [Firebase Google Auth Documentation](https://firebase.google.com/docs/auth/web/google-signin)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Console](https://console.firebase.google.com/)
