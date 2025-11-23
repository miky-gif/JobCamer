import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Conversation, Message, UserRole } from '../types';
import { 
  getUserConversations, 
  getMessages, 
  sendMessage as sendFirebaseMessage,
  markMessagesAsRead,
  subscribeToMessages 
} from '../services/chatService';
import { notifyNewMessage } from '../services/notificationService';
import { useAuth } from './AuthContext';

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversation: string | null;
  unreadCount: number;
}

type ChatAction =
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] }
  | { type: 'SET_MESSAGES'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: string | null }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'UPDATE_UNREAD_COUNT' };

interface ChatContextType extends ChatState {
  sendMessage: (conversationId: string, content: string, senderId: string) => void;
  getConversationMessages: (conversationId: string) => Message[];
  markConversationAsRead: (conversationId: string) => void;
  createConversation: (participants: any[], jobId?: string) => string;
  addConversationById: (conversationId: string, participants: any[]) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return { ...state, conversations: action.payload };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.conversationId]: action.payload.messages
        }
      };
    case 'ADD_MESSAGE':
      const conversationId = action.payload.conversationId;
      return {
        ...state,
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), action.payload]
        },
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, lastMessage: action.payload, unreadCount: conv.unreadCount + 1 }
            : conv
        )
      };
    case 'SET_ACTIVE_CONVERSATION':
      return { ...state, activeConversation: action.payload };
    case 'MARK_AS_READ':
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload ? { ...conv, unreadCount: 0 } : conv
        ),
        messages: {
          ...state.messages,
          [action.payload]: (state.messages[action.payload] || []).map(msg => ({
            ...msg,
            read: true
          }))
        }
      };
    case 'UPDATE_UNREAD_COUNT':
      const total = state.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
      return { ...state, unreadCount: total };
    default:
      return state;
  }
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(chatReducer, {
    conversations: [],
    messages: {},
    activeConversation: null,
    unreadCount: 0
  });

  // Charger les conversations de l'utilisateur depuis Firebase
  useEffect(() => {
    const loadUserConversations = async () => {
      if (!user?.id) return;
      
      try {
        console.log('Chargement des conversations pour:', user.id);
        const userConversations = await getUserConversations(user.id);
        console.log('Conversations chargées:', userConversations);
        
        // Convertir les conversations Firebase vers le format attendu
        const formattedConversations = userConversations.map((conv: any) => ({
          id: conv.id,
          participants: conv.participantNames?.map((name: string, index: number) => ({
            id: conv.participants[index],
            firstName: name.split(' ')[0] || 'Utilisateur',
            lastName: name.split(' ').slice(1).join(' ') || '',
            avatar: conv.participantAvatars?.[index] || undefined,
            phone: '',
            role: 'worker' as UserRole,
            createdAt: new Date(),
            verified: false,
            premium: false
          })) || [],
          unreadCount: conv.unreadCount || 0,
          lastMessage: conv.lastMessage ? {
            id: `last_${conv.id}`,
            conversationId: conv.id,
            senderId: 'unknown',
            senderName: 'Utilisateur',
            content: conv.lastMessage,
            timestamp: conv.lastMessageTime || new Date(),
            read: true
          } : undefined
        }));
        
        dispatch({ type: 'SET_CONVERSATIONS', payload: formattedConversations });
        dispatch({ type: 'UPDATE_UNREAD_COUNT' });
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
      }
    };

    loadUserConversations();
  }, [user?.id]);

  const sendMessage = async (conversationId: string, content: string, senderId: string) => {
    if (!user) return;
    
    try {
      // Envoyer le message via Firebase
      await sendFirebaseMessage(
        conversationId,
        senderId,
        `${user.firstName} ${user.lastName}`,
        content,
        user.avatar
      );
      
      // Trouver l'autre participant pour lui envoyer une notification
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        const otherParticipant = conversation.participants.find(p => p.id !== user.id);
        if (otherParticipant) {
          try {
            await notifyNewMessage(
              otherParticipant.id,
              `${user.firstName} ${user.lastName}`,
              conversationId
            );
            console.log('Notification de message envoyée à:', otherParticipant.id);
          } catch (notificationError) {
            console.error('Erreur lors de la création de la notification:', notificationError);
            // Ne pas bloquer l'envoi du message si la notification échoue
          }
        }
      }
      
      // Ajouter le message localement pour un affichage immédiat
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        conversationId,
        senderId,
        senderName: `${user.firstName} ${user.lastName}`,
        content,
        timestamp: new Date(),
        read: false
      };
      dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      dispatch({ type: 'UPDATE_UNREAD_COUNT' });
      
      console.log('Message envoyé:', content);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    }
  };

  const getConversationMessages = (conversationId: string): Message[] => {
    // Charger les messages depuis Firebase si pas encore chargés
    if (!state.messages[conversationId]) {
      loadMessagesForConversation(conversationId);
    }
    return state.messages[conversationId] || [];
  };

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      console.log('Chargement des messages pour la conversation:', conversationId);
      const messages = await getMessages(conversationId);
      console.log('Messages chargés:', messages);
      
      // Convertir les messages Firebase vers le format attendu
      const formattedMessages = messages.map((msg: any) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.text,
        timestamp: msg.createdAt,
        read: msg.read
      }));
      
      dispatch({ type: 'SET_MESSAGES', payload: { conversationId, messages: formattedMessages } });
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: conversationId });
    dispatch({ type: 'UPDATE_UNREAD_COUNT' });
  };

  const createConversation = (participants: any[], jobId?: string): string => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      participants,
      unreadCount: 0,
      jobId
    };
    dispatch({ type: 'SET_CONVERSATIONS', payload: [...state.conversations, newConversation] });
    return newConversation.id;
  };

  const addConversationById = async (conversationId: string, participants: any[]) => {
    // Vérifier si la conversation existe déjà
    const existingConv = state.conversations.find(c => c.id === conversationId);
    if (existingConv) {
      return;
    }

    try {
      // Charger la conversation depuis Firebase pour obtenir les vraies données
      if (user?.id) {
        const userConversations = await getUserConversations(user.id);
        const firebaseConv = userConversations.find((conv: any) => conv.id === conversationId);
        
        if (firebaseConv) {
          // Utiliser les données Firebase
          const formattedConv = {
            id: firebaseConv.id,
            participants: firebaseConv.participantNames?.map((name: string, index: number) => ({
              id: firebaseConv.participants[index],
              firstName: name.split(' ')[0] || 'Utilisateur',
              lastName: name.split(' ').slice(1).join(' ') || '',
              avatar: firebaseConv.participantAvatars?.[index] || undefined,
              phone: '',
              role: 'worker' as UserRole,
              createdAt: new Date(),
              verified: false,
              premium: false
            })) || [],
            unreadCount: firebaseConv.unreadCount || 0,
            lastMessage: firebaseConv.lastMessage ? {
              id: `last_${firebaseConv.id}`,
              conversationId: firebaseConv.id,
              senderId: 'unknown',
              senderName: 'Utilisateur',
              content: firebaseConv.lastMessage,
              timestamp: firebaseConv.lastMessageTime || new Date(),
              read: true
            } : undefined
          };
          
          dispatch({ type: 'SET_CONVERSATIONS', payload: [...state.conversations, formattedConv] });
          
          // Charger les messages pour cette conversation
          await loadMessagesForConversation(conversationId);
          return;
        }
      }
      
      // Fallback: ajouter avec les participants fournis
      const newConversation: Conversation = {
        id: conversationId,
        participants,
        unreadCount: 0
      };
      dispatch({ type: 'SET_CONVERSATIONS', payload: [...state.conversations, newConversation] });
      
      // Charger les messages
      await loadMessagesForConversation(conversationId);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la conversation:', error);
      
      // Fallback en cas d'erreur
      const newConversation: Conversation = {
        id: conversationId,
        participants,
        unreadCount: 0
      };
      dispatch({ type: 'SET_CONVERSATIONS', payload: [...state.conversations, newConversation] });
      dispatch({ type: 'SET_MESSAGES', payload: { conversationId, messages: [] } });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        getConversationMessages,
        markConversationAsRead,
        createConversation,
        addConversationById
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
