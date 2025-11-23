import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, MessageCircle, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { unreadCount } = useChat();

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/search', icon: Search, label: 'Rechercher' },
    { 
      path: user?.role === 'worker' ? '/jobs' : '/post-job', 
      icon: Briefcase, 
      label: user?.role === 'worker' ? 'Offres' : 'Publier' 
    },
    { path: '/chat', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { path: '/profile', icon: User, label: 'Profil' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
