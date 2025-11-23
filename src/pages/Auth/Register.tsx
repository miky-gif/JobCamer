import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Lock, User } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '../../services/authService';

export const Register: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        setLoading(false);
        return;
      }

      console.log('Inscription en cours avec:', {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Créer l'utilisateur
      const user = await signUpWithEmail(formData.email, formData.password);
      console.log('Utilisateur créé avec succès:', user.uid);
      
      // Rediriger vers le stepper de catalogage
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      console.log('Inscription Google en cours...');
      const user = await signInWithGoogle();
      console.log('Utilisateur créé avec Google:', user.uid);
      
      // Rediriger vers le stepper de catalogage
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Erreur Google:', err);
      // Ignorer l'erreur si l'utilisateur ferme le popup
      if (err.code === 'auth/popup-closed-by-user') {
        console.log('Popup fermé par l\'utilisateur');
      } else {
        setError(err.message || 'Erreur lors de l\'inscription avec Google');
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
            {t('auth.register.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.register.subtitle')}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.register.firstName')}
                name="firstName"
                type="text"
                placeholder="Jean"
                value={formData.firstName}
                onChange={handleChange}
                icon={<User size={20} />}
                required
              />
              <Input
                label={t('auth.register.lastName')}
                name="lastName"
                type="text"
                placeholder="Kamga"
                value={formData.lastName}
                onChange={handleChange}
                icon={<User size={20} />}
                required
              />
            </div>

            <Input
              label={t('auth.register.email')}
              name="email"
              type="email"
              placeholder="jean@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={<Mail size={20} />}
              required
            />

            <Input
              label={t('auth.login.password')}
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={20} />}
              required
            />

            <Input
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<Lock size={20} />}
              required
            />

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                J'accepte les{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                  politique de confidentialité
                </a>
              </label>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              {t('auth.register.button')}
            </Button>
          </form>

          {/* Google Sign Up */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
                {googleLoading ? 'Inscription...' : 'S\'inscrire avec Google'}
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
                Déjà inscrit ?
              </span>
            </div>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link to="/login">
              <Button variant="outline" fullWidth>
                Se connecter
              </Button>
            </Link>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};
