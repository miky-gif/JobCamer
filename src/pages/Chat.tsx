import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Send, ArrowLeft } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';

export const Chat: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { conversations, getConversationMessages, sendMessage, markConversationAsRead, addConversationById } = useChat();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Vérifier s'il y a une conversation spécifiée dans l'URL
  useEffect(() => {
    const conversationFromUrl = searchParams.get('conversation');
    if (conversationFromUrl) {
      setSelectedConversation(conversationFromUrl);
      
      // Si la conversation n'existe pas dans le contexte, l'ajouter
      const existingConv = conversations.find(c => c.id === conversationFromUrl);
      if (!existingConv) {
        console.log('Ajout de la nouvelle conversation:', conversationFromUrl);
        // Pour l'instant, ajouter avec des participants vides - ils seront chargés depuis Firebase
        addConversationById(conversationFromUrl, []);
      }
    }
  }, [searchParams, conversations, addConversationById]);

  const activeConversation = conversations.find(c => c.id === selectedConversation);
  const messages = selectedConversation ? getConversationMessages(selectedConversation) : [];

  useEffect(() => {
    if (selectedConversation) {
      markConversationAsRead(selectedConversation);
      scrollToBottom();
    }
  }, [selectedConversation, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation || !user) return;

    sendMessage(selectedConversation, messageText, user.id);
    setMessageText('');
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p: any) => p.id !== user?.id);
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex flex-col md:flex-row">
      {/* Conversations list */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 bg-white dark:bg-gray-800 border-r-4 border-green-500 border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-4 border-b-2 border-yellow-500 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-yellow-50 dark:from-green-900/20 dark:to-yellow-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">💬</div>
              <p className="text-gray-600 dark:text-gray-400">
                Aucune conversation
              </p>
            </div>
          ) : (
            conversations.map(conversation => {
              const otherUser = getOtherParticipant(conversation);
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                    selectedConversation === conversation.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <img
                    src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((otherUser?.firstName || 'U') + ' ' + (otherUser?.lastName || ''))}&background=22c55e&color=ffffff&size=200&bold=true&rounded=true`}
                    alt={otherUser?.firstName}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherUser?.firstName} {otherUser?.lastName}
                      </span>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          {formatRelativeTime(conversation.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-gray-50 dark:bg-gray-900`}>
        {selectedConversation && activeConversation ? (
          <>
            {/* Chat header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden text-gray-600 dark:text-gray-400"
              >
                <ArrowLeft size={24} />
              </button>
              <img
                src={getOtherParticipant(activeConversation)?.avatar || 'https://i.pravatar.cc/150'}
                alt={getOtherParticipant(activeConversation)?.firstName}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {getOtherParticipant(activeConversation)?.firstName}{' '}
                  {getOtherParticipant(activeConversation)?.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getOtherParticipant(activeConversation)?.role === 'worker' ? 'Travailleur' : 'Employeur'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatRelativeTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim()}
                  icon={<Send size={20} />}
                >
                  Envoyer
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sélectionnez une conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choisissez une conversation pour commencer à discuter
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
