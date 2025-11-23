import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock } from 'lucide-react';
import { signInWithEmail, signInWithGoogle, getUserProfile } from '../../services/authService';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await signInWithEmail(email, password);
      console.log('Utilisateur connecté:', user.uid);
      
      // Vérifier si le profil existe
      const profile = await getUserProfile(user.uid);
      if (profile && profile.role) {
        console.log('Profil trouvé avec rôle:', profile.role);
        // Rediriger selon le rôle
        if (profile.role === 'worker') {
          console.log('Redirection worker vers /search');
          navigate('/search');
        } else {
          console.log('Redirection employer vers /');
          navigate('/');
        }
      } else {
        console.log('Profil incomplet, redirection vers onboarding');
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Erreur connexion email:', err);
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const user = await signInWithGoogle();
      console.log('Utilisateur connecté avec Google:', user.uid);
      
      // Attendre un peu pour que Firestore soit synchronisé
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Vérifier si le profil existe
      const profile = await getUserProfile(user.uid);
      if (profile && profile.role) {
        console.log('Profil trouvé avec rôle:', profile.role);
        // Rediriger selon le rôle
        if (profile.role === 'worker') {
          console.log('Redirection worker vers /search');
          navigate('/search');
        } else {
          console.log('Redirection employer vers /');
          navigate('/');
        }
      } else {
        console.log('Profil incomplet, redirection vers onboarding');
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Erreur connexion Google:', err);
      // Ignorer l'erreur si l'utilisateur ferme le popup
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Popup fermé par l\'utilisateur');
      } else {
        setError(err.message || 'Erreur de connexion Google');
      }
    } finally {
      setGoogleLoading(false);
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
            {t('auth.login.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.login.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label={t('auth.login.email') || 'Email'}
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
              required
            />

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
                  {t('auth.login.remember')}
                </span>
              </label>
              <a href="#" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                {t('auth.login.forgot')}
              </a>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {t('auth.login.button')}
            </Button>
          </form>

          {/* Google Sign In */}
          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Google Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-medium text-gray-900 dark:text-white">
                {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
              </span>
            </button>
          </div>

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
                {t('auth.register.button')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← {t('common.close')}
          </Link>
        </div>
      </div>
    </div>
  );
};
