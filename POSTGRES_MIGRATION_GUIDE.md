# Guide de Migration vers PostgreSQL

## 📋 Vue d'ensemble

Ce guide explique comment passer de Firebase Authentication + Firestore à PostgreSQL avec Prisma pour l'authentification et la gestion des données.

## 🏗️ Architecture Actuelle vs Nouvelle

### Avant (Firebase)
- **Authentification**: Firebase Authentication
- **Base de données**: Firestore (NoSQL)
- **Stockage**: Firebase Storage
- **Services**: Authentification par téléphone, email, Google OAuth

### Après (PostgreSQL)
- **Authentification**: JWT + bcrypt
- **Base de données**: PostgreSQL avec Prisma ORM
- **Stockage**: À définir (peut rester Firebase Storage ou migrer vers S3)
- **Services**: Authentification par email/phone avec JWT

## 📦 Fichiers Créés

### Services PostgreSQL
- `src/services/authServicePostgres.ts` - Services d'authentification PostgreSQL
- `src/context/AuthContextPostgres.tsx` - Contexte React pour PostgreSQL
- `src/pages/Auth/LoginPostgres.tsx` - Page de connexion PostgreSQL

### Configuration Prisma
- `prisma/schema.prisma` - Schéma de base de données PostgreSQL
- `prisma/prisma.config.ts` - Configuration Prisma
- `.env.example` - Variables d'environnement mises à jour

## 🚀 Installation et Configuration

### 1. Installer les dépendances
```bash
npm install prisma @prisma/client bcryptjs jsonwebtoken
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

### 2. Configurer la base de données
Copier `.env.example` vers `.env` et configurer:
```env
# PostgreSQL Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/jobcamer_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
```

### 3. Générer le client Prisma
```bash
npx prisma generate
```

### 4. Créer et appliquer les migrations
```bash
npx prisma migrate dev --name init
```

## 🔄 Migration des Données

### Script de Migration (optionnel)
```typescript
// scripts/migrateFromFirebase.ts
import { PrismaClient } from '../src/generated/prisma';
import { getAllWorkers, getAllEmployers } from '../src/services/authService';

const prisma = new PrismaClient();

async function migrateUsers() {
  // Récupérer les utilisateurs depuis Firebase
  const workers = await getAllWorkers();
  const employers = await getAllEmployers();
  
  // Insérer dans PostgreSQL
  for (const worker of workers) {
    await prisma.user.create({
      data: {
        id: worker.id,
        email: worker.email,
        phone: worker.phone,
        firstName: worker.firstName,
        lastName: worker.lastName,
        role: 'WORKER',
        avatar: worker.avatar,
        location: worker.location,
        verified: worker.verified,
        premium: worker.premium,
        rating: worker.rating,
        totalJobs: worker.totalJobs,
        createdAt: worker.createdAt,
      }
    });
  }
  
  // Faire de même pour les employeurs...
}
```

## 🧪 Test de la Nouvelle Authentification

### 1. Mettre à jour App.tsx
Remplacer l'import du contexte:
```tsx
// Ancien
import { AuthProvider } from './context/AuthContext';

// Nouveau
import { AuthProvider } from './context/AuthContextPostgres';
```

### 2. Mettre à jour les routes
```tsx
// Ancien
import { Login } from './pages/Auth/Login';

// Nouveau
import { LoginPostgres } from './pages/Auth/LoginPostgres';

<Route path="/login" element={<LoginPostgres />} />
```

### 3. Tester l'inscription
1. Aller sur `/register`
2. Créer un nouveau compte avec email et mot de passe
3. Vérifier que l'utilisateur est bien créé dans PostgreSQL

### 4. Tester la connexion
1. Aller sur `/login`
2. Se connecter avec les identifiants créés
3. Vérifier que le token JWT est généré et stocké

## 🔍 Vérification

### Vérifier la base de données
```sql
-- Se connecter à PostgreSQL
psql -U username -d jobcamer_db

-- Vérifier les utilisateurs
SELECT * FROM users;

-- Vérifier les tables créées
\\dt
```

### Vérifier les logs
```bash
# Activer les logs de debug
DEBUG=prisma:* npm run dev
```

## 🛠️ Dépannage

### Erreurs Communes

1. **"Prisma Client not generated"**
   ```bash
   npx prisma generate
   ```

2. **"Database connection failed"**
   - Vérifier que PostgreSQL est en cours d'exécution
   - Vérifier la chaîne de connexion dans `.env`

3. **"JWT token invalid"**
   - Vérifier que `JWT_SECRET` est défini dans `.env`
   - Effacer le localStorage et se reconnecter

4. **"Password hash error"**
   - Vérifier que bcrypt est correctement importé
   - S'assurer que le mot de passe est bien hashé avant stockage

## 📝 Notes Importantes

### Sécurité
- Les mots de passe sont hashés avec bcrypt (12 rounds)
- Les tokens JWT expirent après 7 jours par défaut
- Utiliser des secrets forts en production

### Performance
- PostgreSQL offre de meilleures performances pour les requêtes complexes
- Prisma génère des requêtes SQL optimisées
- Index automatiques sur les champs uniques

### Scalabilité
- PostgreSQL gère mieux les grandes quantités de données
- Support des transactions ACID
- Meilleure gestion des relations complexes

## 🔄 Rollback (si nécessaire)

Si vous devez revenir à Firebase:
1. Restaurer les imports originaux dans `App.tsx`
2. Commenter les imports PostgreSQL
3. S'assurer que Firebase est toujours configuré

## 📚 Ressources

- [Documentation Prisma](https://www.prisma.io/docs)
- [Documentation JWT](https://jwt.io/)
- [Documentation bcrypt](https://www.npmjs.com/package/bcryptjs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
