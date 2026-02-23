import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, User, UserRole } from '../generated/prisma';
import { User as UserType } from '../types';

// Initialisation du client Prisma
const prisma = new PrismaClient();

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Interface pour le payload JWT
interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role: UserRole;
}

// Interface pour les données d'inscription
export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

// Interface pour les données de connexion
export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

// Hasher un mot de passe
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Vérifier un mot de passe
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Générer un token JWT
export const generateToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Vérifier un token JWT
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Inscription d'un nouvel utilisateur
export const register = async (data: RegisterData): Promise<{ user: User; token: string }> => {
  try {
    // Vérifier si l'email ou le téléphone existe déjà
    if (data.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: data.email }
      });
      if (existingEmailUser) {
        throw new Error('Cet email est déjà utilisé');
      }
    }

    if (data.phone) {
      const existingPhoneUser = await prisma.user.findUnique({
        where: { phone: data.phone }
      });
      if (existingPhoneUser) {
        throw new Error('Ce numéro de téléphone est déjà utilisé');
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(data.password);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      }
    });

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role
    });

    return { user, token };
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// Connexion d'un utilisateur
export const login = async (data: LoginData): Promise<{ user: User; token: string }> => {
  try {
    // Trouver l'utilisateur par email ou téléphone
    let user: User | null = null;

    if (data.email) {
      user = await prisma.user.findUnique({
        where: { email: data.email }
      });
    } else if (data.phone) {
      user = await prisma.user.findUnique({
        where: { phone: data.phone }
      });
    }

    if (!user) {
      throw new Error('Identifiants incorrects');
    }

    if (!user.password) {
      throw new Error('Compte sans mot de passe. Utilisez une connexion sociale.');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Identifiants incorrects');
    }

    // Générer le token JWT
    const token = generateToken({
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      role: user.role
    });

    return { user, token };
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// Obtenir le profil utilisateur par ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobs: true,
        applications: true,
        reviews: true,
        receivedReviews: true,
        notifications: true
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// Mettre à jour le profil utilisateur
export const updateUser = async (userId: string, updates: Partial<Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
  try {
    // Nettoyer les données pour Prisma
    const cleanUpdates: any = { ...updates };
    
    return await prisma.user.update({
      where: { id: userId },
      data: cleanUpdates
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// Changer le mot de passe
export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || !user.password) {
      throw new Error('Utilisateur non trouvé ou compte sans mot de passe');
    }

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    // Hasher et mettre à jour le nouveau mot de passe
    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    throw error;
  }
};

// Obtenir tous les travailleurs
export const getAllWorkers = async (): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      where: { role: 'WORKER' },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des travailleurs:', error);
    throw error;
  }
};

// Obtenir tous les employeurs
export const getAllEmployers = async (): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      where: { role: 'EMPLOYER' },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des employeurs:', error);
    throw error;
  }
};

// Convertir l'utilisateur Prisma vers le format User de l'application
export const convertPrismaUserToAppUser = (prismaUser: User): UserType => {
  return {
    id: prismaUser.id,
    email: prismaUser.email || '',
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    phone: prismaUser.phone || '',
    role: prismaUser.role.toLowerCase() as 'worker' | 'employer',
    avatar: prismaUser.avatar || undefined,
    // Les champs qui n'existent pas dans le modèle Prisma sont omis ou mis à undefined
    category: undefined, // Le champ category n'existe pas encore dans Prisma
    bio: undefined, // Le champ bio n'existe pas dans Prisma
    location: prismaUser.location as { city: string; district: string } | undefined,
    verified: prismaUser.verified,
    premium: prismaUser.premium,
    createdAt: prismaUser.createdAt,
    rating: prismaUser.rating || undefined,
    totalJobs: prismaUser.totalJobs || undefined,
    totalJobsPosted: prismaUser.totalJobsPosted || undefined,
  };
};

export default prisma;
