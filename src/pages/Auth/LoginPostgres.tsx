import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContextPostgres';

export const LoginPostgres: React.FC = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login, loginWithPhone } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'email') {
        await login(email, password);
      } else {
        await loginWithPhone(phone, password);
      }
      
      // Rediriger selon le rôle de l'utilisateur
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'worker') {
        navigate('/search');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Erreur connexion:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="JobCamer Logo" 
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.login.title') || 'Connexion'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.login.subtitle') || 'Connectez-vous à votre compte'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Toggle between email and phone login */}
          <div className="flex mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                loginType === 'email'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Mail size={16} className="inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setLoginType('phone')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                loginType === 'phone'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Phone size={16} className="inline mr-2" />
              Téléphone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {loginType === 'email' ? (
              <Input
                label={t('auth.login.email') || 'Email'}
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} />}
                required
              />
            ) : (
              <Input
                label={t('auth.login.phone') || 'Téléphone'}
                type="tel"
                placeholder="+237 6XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone size={20} />}
                required
              />
            )}

            <Input
              label={t('auth.login.password')}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('auth.login.remember') || 'Se souvenir de moi'}
                </span>
              </label>
              <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                {t('auth.login.forgot') || 'Mot de passe oublié ?'}
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {t('auth.login.button') || 'Se connecter'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {t('auth.login.newUser') || 'Nouveau sur JobCamer ?'}
              </span>
            </div>
          </div>

          {/* Register link */}
          <div className="text-center">
            <Link to="/register">
              <Button variant="outline" fullWidth>
                {t('auth.register.button') || 'Créer un compte'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← {t('common.close') || 'Retour'}
          </Link>
        </div>
      </div>
    </div>
  );
};
