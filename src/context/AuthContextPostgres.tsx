import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { 
  login as loginService, 
  register as registerService, 
  getUserById, 
  updateUser, 
  verifyToken,
  convertPrismaUserToAppUser
} from '../services/authServicePostgres';
import { UserRole } from '../generated/prisma';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'worker' | 'employer';
  }) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: true,
    token: null
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté avec le token JWT
    const token = localStorage.getItem('jobcamer_token');
    if (token) {
      try {
        const payload = verifyToken(token);
        loadUserProfile(payload.userId, token);
      } catch (error) {
        console.error('Token invalide:', error);
        localStorage.removeItem('jobcamer_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const loadUserProfile = async (userId: string, token: string) => {
    try {
      const prismaUser = await getUserById(userId);
      if (prismaUser) {
        const user = convertPrismaUserToAppUser(prismaUser);
        dispatch({ type: 'LOGIN', payload: { user, token } });
      } else {
        localStorage.removeItem('jobcamer_token');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      localStorage.removeItem('jobcamer_token');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { user: prismaUser, token } = await loginService({ email, password });
      const user = convertPrismaUserToAppUser(prismaUser);
      
      // Sauvegarder le token dans localStorage
      localStorage.setItem('jobcamer_token', token);
      
      dispatch({ type: 'LOGIN', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const loginWithPhone = async (phone: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { user: prismaUser, token } = await loginService({ phone, password });
      const user = convertPrismaUserToAppUser(prismaUser);
      
      // Sauvegarder le token dans localStorage
      localStorage.setItem('jobcamer_token', token);
      
      dispatch({ type: 'LOGIN', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('jobcamer_token');
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (userData: {
    email?: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'worker' | 'employer';
  }): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { user: prismaUser, token } = await registerService({
        ...userData,
        role: userData.role.toUpperCase() as UserRole
      });
      const user = convertPrismaUserToAppUser(prismaUser);
      
      // Sauvegarder le token dans localStorage
      localStorage.setItem('jobcamer_token', token);
      
      dispatch({ type: 'LOGIN', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (state.user && state.token) {
      try {
        // Convertir les données pour correspondre au type Prisma
        const prismaUpdates: any = { ...data };
        if (prismaUpdates.role) {
          prismaUpdates.role = prismaUpdates.role.toUpperCase() as UserRole;
        }
        
        const updatedPrismaUser = await updateUser(state.user.id, prismaUpdates);
        const updatedUser = convertPrismaUserToAppUser(updatedPrismaUser);
        dispatch({ type: 'UPDATE_PROFILE', payload: updatedUser });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw error;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithPhone,
        logout,
        register,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
