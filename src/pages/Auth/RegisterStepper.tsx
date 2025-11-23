import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Mail, Lock, User, Phone, Briefcase, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { signUpWithEmail, createUserProfile } from '../../services/authService';
import { JOB_CATEGORIES } from '../../utils/constants';

type Step = 'basic' | 'role' | 'details' | 'success';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'worker' | 'employer' | null;
  phone: string;
  category: string;
  bio: string;
  companyName: string;
}

export const RegisterStepper: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: null,
    phone: '',
    category: 'construction',
    bio: '',
    companyName: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateBasicInfo = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (!formData.firstName || !formData.lastName) {
      setError('Veuillez entrer votre nom et prénom');
      return false;
    }
    setError('');
    return true;
  };

  const validateRole = () => {
    if (!formData.role) {
      setError('Veuillez sélectionner un rôle');
      return false;
    }
    setError('');
    return true;
  };

  const validateDetails = () => {
    if (!formData.phone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return false;
    }
    if (formData.role === 'worker' && !formData.category) {
      setError('Veuillez sélectionner une catégorie');
      return false;
    }
    if (formData.role === 'employer' && !formData.companyName) {
      setError('Veuillez entrer le nom de votre entreprise');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 'basic' && validateBasicInfo()) {
      setCurrentStep('role');
    } else if (currentStep === 'role' && validateRole()) {
      setCurrentStep('details');
    } else if (currentStep === 'details' && validateDetails()) {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'role') {
      setCurrentStep('basic');
    } else if (currentStep === 'details') {
      setCurrentStep('role');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Créer l'utilisateur avec email/password
      const user = await signUpWithEmail(formData.email, formData.password);

      // Créer le profil utilisateur
      await createUserProfile(user, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role as 'worker' | 'employer',
        category: formData.role === 'worker' ? formData.category : undefined,
        bio: formData.bio,
      });

      setCurrentStep('success');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessRedirect = () => {
    navigate('/');
  };

  // Stepper indicator
  const steps = [
    { id: 'basic', label: 'Infos de base', icon: '📝' },
    { id: 'role', label: 'Votre rôle', icon: '👤' },
    { id: 'details', label: 'Détails', icon: '📋' },
  ];

  const getStepIndex = () => {
    if (currentStep === 'success') return 3;
    return steps.findIndex(s => s.id === currentStep);
  };

  const stepIndex = getStepIndex();

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

        {/* Stepper */}
        {currentStep !== 'success' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div
                    className={`flex flex-col items-center ${
                      index <= stepIndex ? 'opacity-100' : 'opacity-50'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                        index < stepIndex
                          ? 'bg-green-500 text-white'
                          : index === stepIndex
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {index < stepIndex ? '✓' : index + 1}
                    </div>
                    <span className="text-xs text-center text-gray-600 dark:text-gray-400">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 mb-6 rounded transition-all ${
                        index < stepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Informations de base
              </h2>

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
            </div>
          )}

          {/* Step 2: Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Quel est votre rôle ?
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'worker' });
                    setError('');
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-center ${
                    formData.role === 'worker'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  }`}
                >
                  <div className="text-4xl mb-3">👷</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {t('auth.register.worker')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('auth.register.workerDesc')}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'employer' });
                    setError('');
                  }}
                  className={`p-6 rounded-lg border-2 transition-all text-center ${
                    formData.role === 'employer'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'
                  }`}
                >
                  <div className="text-4xl mb-3">💼</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {t('auth.register.employer')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('auth.register.employerDesc')}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {formData.role === 'worker' ? 'Vos compétences' : 'Votre entreprise'}
              </h2>

              <Input
                label={t('auth.register.phone')}
                name="phone"
                type="tel"
                placeholder="6XX XX XX XX"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone size={20} />}
                required
              />

              {formData.role === 'worker' && (
                <>
                  <Select
                    label={t('auth.register.category')}
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    options={Object.entries(JOB_CATEGORIES).map(([key, cat]) => ({
                      value: key,
                      label: `${cat.icon} ${cat.label}`,
                    }))}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio (optionnel)
                    </label>
                    <textarea
                      name="bio"
                      placeholder="Décrivez vos compétences et expériences..."
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {formData.role === 'employer' && (
                <Input
                  label="Nom de l'entreprise"
                  name="companyName"
                  type="text"
                  placeholder="Votre entreprise"
                  value={formData.companyName}
                  onChange={handleChange}
                  icon={<Briefcase size={20} />}
                  required
                />
              )}
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <CheckCircle size={64} className="text-green-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Inscription réussie !
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Bienvenue sur JobCamer, {formData.firstName} !
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep !== 'basic' && currentStep !== 'success' && (
              <Button
                variant="outline"
                fullWidth
                onClick={handlePrevStep}
                icon={<ArrowLeft size={20} />}
              >
                Retour
              </Button>
            )}

            {currentStep !== 'success' && (
              <Button
                fullWidth
                loading={loading}
                onClick={handleNextStep}
                icon={currentStep === 'details' ? <CheckCircle size={20} /> : <ArrowRight size={20} />}
              >
                {currentStep === 'details' ? 'Terminer' : 'Suivant'}
              </Button>
            )}

            {currentStep === 'success' && (
              <Button
                fullWidth
                onClick={handleSuccessRedirect}
              >
                Aller à l'accueil
              </Button>
            )}
          </div>
        </div>

        {/* Login Link */}
        {currentStep !== 'success' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 text-gray-500 dark:text-gray-400">
                  Déjà inscrit ?
                </span>
              </div>
            </div>

            <Link to="/login">
              <Button variant="outline" fullWidth>
                Se connecter
              </Button>
            </Link>
          </>
        )}

        {/* Back to home */}
        {currentStep === 'success' && (
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              ← Retour à l'accueil
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
