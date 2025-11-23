import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Bell, Briefcase, MessageCircle, DollarSign, Star, CheckCircle, Trash2, RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '../utils/helpers';
import { Notification, NotificationType } from '../types';


export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'account_created':
      case 'profile_completed':
      case 'profile_verified':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={24} />;
      case 'new_job':
      case 'job_posted':
      case 'job_started':
      case 'job_completed':
        return <Briefcase className="text-primary-600 dark:text-primary-400" size={24} />;
      case 'application_received':
      case 'application_accepted':
      case 'application_rejected':
        return <CheckCircle className="text-green-600 dark:text-green-400" size={24} />;
      case 'payment_sent':
      case 'payment_received':
      case 'payment_failed':
        return <DollarSign className="text-yellow-600 dark:text-yellow-400" size={24} />;
      case 'message':
        return <MessageCircle className="text-blue-600 dark:text-blue-400" size={24} />;
      case 'review_received':
        return <Star className="text-orange-600 dark:text-orange-400" size={24} />;
      case 'premium_activated':
      case 'premium_expired':
        return <Star className="text-purple-600 dark:text-purple-400" size={24} />;
      default:
        return <Bell className="text-gray-600 dark:text-gray-400" size={24} />;
    }
  };

  const getNotificationBgColor = (type: NotificationType) => {
    switch (type) {
      case 'account_created':
      case 'profile_completed':
      case 'profile_verified':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'new_job':
      case 'job_posted':
      case 'job_started':
      case 'job_completed':
        return 'bg-primary-100 dark:bg-primary-900/30';
      case 'application_received':
      case 'application_accepted':
      case 'application_rejected':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'payment_sent':
      case 'payment_received':
      case 'payment_failed':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'message':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'review_received':
        return 'bg-orange-100 dark:bg-orange-900/30';
      case 'premium_activated':
      case 'premium_expired':
        return 'bg-purple-100 dark:bg-purple-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-700';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 via-red-50 to-yellow-50 dark:from-green-900/20 dark:via-red-900/20 dark:to-yellow-900/20 rounded-2xl border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Notifications
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? (
                  <span>
                    Vous avez <span className="font-semibold text-primary-600 dark:text-primary-400">{unreadCount}</span> notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  'Aucune nouvelle notification'
                )}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Toutes ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Non lues ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications list */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-lg ${
                  !notification.read ? 'border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`font-semibold ${
                        !notification.read 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                        {!notification.read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                        )}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions - Bouton de rafraîchissement */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshNotifications();
                    }}
                    className="text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors p-2"
                    title="Rafraîchir"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filter === 'unread' 
                ? 'Toutes vos notifications ont été lues'
                : 'Vous n\'avez pas encore de notifications'
              }
            </p>
            {filter === 'unread' && (
              <Button onClick={() => setFilter('all')}>
                Voir toutes les notifications
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
