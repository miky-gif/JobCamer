import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { mockWorkers, mockEmployers } from '../data/mockData';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfile } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User>) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
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
    loading: true
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté avec Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user found:', firebaseUser.uid);
        try {
          // Récupérer le profil depuis Firestore avec retry
          let profile = null;
          let retries = 0;
          const maxRetries = 3;
          
          while (!profile && retries < maxRetries) {
            try {
              profile = await getUserProfile(firebaseUser.uid);
              if (!profile) {
                console.log(`Profile not found, retry ${retries + 1}/${maxRetries}`);
                // Attendre avant de réessayer
                await new Promise(resolve => setTimeout(resolve, 1000));
                retries++;
              }
            } catch (error) {
              console.log(`Error fetching profile, retry ${retries + 1}/${maxRetries}:`, error);
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries++;
            }
          }
          
          if (profile) {
            // Convertir le profil Firestore en User
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: profile.firstName || firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
              lastName: profile.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              phone: profile.phone || '',
              role: profile.role as 'worker' | 'employer',
              avatar: firebaseUser.photoURL || profile.avatar || undefined,
              createdAt: profile.createdAt ? new Date(profile.createdAt as any) : new Date(),
              verified: profile.verified || false,
              premium: profile.premium || false,
            };
            
            console.log('Profile loaded from Firestore:', user);
            dispatch({ type: 'LOGIN', payload: user });
          } else {
            console.log('No profile found in Firestore after retries');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        console.log('No Firebase user found');
        dispatch({ type: 'LOGOUT' });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  const login = async (phone: string, password: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Rechercher l'utilisateur dans les mocks
    const allUsers = [...mockWorkers, ...mockEmployers];
    const user = allUsers.find(u => u.phone === phone);
    
    if (user) {
      localStorage.setItem('jobcamer_user', JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: user });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const register = async (userData: Partial<User>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      phone: userData.phone || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email,
      role: userData.role || 'worker',
      createdAt: new Date(),
      verified: false,
      premium: false
    };
    
    localStorage.setItem('jobcamer_user', JSON.stringify(newUser));
    dispatch({ type: 'LOGIN', payload: newUser });
  };

  const updateProfile = (data: Partial<User>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...data };
      localStorage.setItem('jobcamer_user', JSON.stringify(updatedUser));
      dispatch({ type: 'UPDATE_PROFILE', payload: data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
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
