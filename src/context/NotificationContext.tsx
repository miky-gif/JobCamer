import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Notification } from '../types';
import { 
  getUserNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  subscribeToNotifications 
} from '../services/notificationService';
import { useAuth } from './AuthContext';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
}

type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'SET_UNREAD_COUNT'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean };

interface NotificationContextType extends NotificationState {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length 
      };
    case 'ADD_NOTIFICATION':
      return { 
        ...state, 
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.read ? state.unreadCount : state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: false
  });

  // Charger les notifications au montage et quand l'utilisateur change
  useEffect(() => {
    if (!user?.id) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      return;
    }

    const loadNotifications = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('Chargement des notifications pour:', user.id);
        
        const notifications = await getUserNotifications(user.id);
        const unreadCount = await getUnreadCount(user.id);
        
        dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
        dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
        
        console.log('Notifications chargées:', notifications.length, 'non lues:', unreadCount);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadNotifications();

    // S'abonner aux notifications en temps réel
    const unsubscribe = subscribeToNotifications(user.id, (notifications) => {
      console.log('Notifications mises à jour en temps réel:', notifications.length);
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id]);

  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      dispatch({ type: 'MARK_AS_READ', payload: notificationId });
      console.log('Notification marquée comme lue:', notificationId);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    
    try {
      await markAllNotificationsAsRead(user.id);
      dispatch({ type: 'MARK_ALL_AS_READ' });
      console.log('Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
    }
  };

  const refreshNotifications = async () => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const notifications = await getUserNotifications(user.id);
      const unreadCount = await getUnreadCount(user.id);
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
      dispatch({ type: 'SET_UNREAD_COUNT', payload: unreadCount });
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des notifications:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        ...state,
        markAsRead,
        markAllAsRead,
        refreshNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
