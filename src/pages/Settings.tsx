import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Bell, Lock, Globe, Moon, Sun, LogOut, ArrowLeft, Save } from 'lucide-react';
import { auth } from '../config/firebase';
import { updateUserProfile } from '../services/authService';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    notifications: true,
    emailNotifications: true,
    language: language || 'fr',
    darkMode: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Charger les paramètres depuis localStorage
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('jobcamer_settings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
          setDarkMode(parsed.darkMode || false);
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }

      // Vérifier le mode sombre actuel
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    };

    loadSettings();

    // Recharger les paramètres quand on revient à cette page
    const handleFocus = () => {
      loadSettings();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    handleChange('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Sauvegarder les paramètres dans localStorage
      localStorage.setItem('jobcamer_settings', JSON.stringify(settings));

      // Changer la langue si nécessaire
      if (settings.language !== language) {
        setLanguage(settings.language as 'fr' | 'en');
      }

      // Sauvegarder les paramètres dans Firestore si connecté
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateUserProfile(currentUser.uid, {
          phone: settings.phone,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setTimeout(() => navigate('/login'), 500);
    } catch (error) {
      console.error('Error logging out:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            ✓ Paramètres sauvegardés avec succès
          </div>
        )}

        {/* Account Settings */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock size={20} />
            Compte
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={settings.email}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone
              </label>
              <Input
                type="tel"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Votre numéro de téléphone"
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Globe size={20} />
            Préférences
          </h2>

          <div className="space-y-4">
            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Langue
              </label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon size={20} className="text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun size={20} className="text-gray-600 dark:text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mode sombre
                </span>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h2>

          <div className="space-y-3">
            {/* Push Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notifications push
              </span>
              <button
                onClick={() => handleChange('notifications', !settings.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notifications par email
              </span>
              <button
                onClick={() => handleChange('emailNotifications', !settings.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="mb-6 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
            Zone de danger
          </h2>

          <div className="space-y-3">
            <Button
              variant="outline"
              fullWidth
              onClick={handleLogout}
              icon={<LogOut size={20} />}
              className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Déconnexion
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button
            fullWidth
            loading={loading}
            onClick={handleSave}
            icon={<Save size={20} />}
          >
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};
