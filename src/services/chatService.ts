import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // IDs des utilisateurs
  participantNames: string[];
  participantAvatars?: string[];
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Créer ou récupérer une conversation
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string,
  user1Name: string,
  user2Name: string,
  user1Avatar?: string,
  user2Avatar?: string
): Promise<string> => {
  try {
    // Chercher une conversation existante
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId1)
    );
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const data = doc.data() as Conversation;
      if (data.participants.includes(userId2)) {
        return doc.id;
      }
    }

    // Créer une nouvelle conversation
    const docRef = await addDoc(collection(db, 'conversations'), {
      participants: [userId1, userId2],
      participantNames: [user1Name, user2Name],
      participantAvatars: [user1Avatar, user2Avatar],
      lastMessage: '',
      lastMessageTime: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    throw error;
  }
};

// Envoyer un message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  senderAvatar?: string
) => {
  try {
    // Ajouter le message
    await addDoc(collection(db, 'messages'), {
      conversationId,
      senderId,
      senderName,
      senderAvatar,
      text,
      createdAt: new Date(),
      read: false,
    });

    // Mettre à jour la conversation
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: text,
      lastMessageTime: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    throw error;
  }
};

// Récupérer les messages d'une conversation
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Message[];
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    throw error;
  }
};

// Écouter les messages en temps réel
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Message[];
    callback(messages);
  });
};

// Récupérer les conversations d'un utilisateur
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      lastMessageTime: doc.data().lastMessageTime?.toDate(),
    })) as Conversation[];
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    throw error;
  }
};

// Marquer les messages comme lus
export const markMessagesAsRead = async (conversationId: string, userId: string) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      where('read', '==', false)
    );
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      if (doc.data().senderId !== userId) {
        await updateDoc(doc.ref, { read: true });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour des messages:', error);
    throw error;
  }
};
