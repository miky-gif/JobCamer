import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Phone, Briefcase, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { updateUserProfile, getUserProfile } from '../services/authService';
import { auth } from '../config/firebase';
import { JOB_CATEGORIES } from '../utils/constants';

type Step = 'role' | 'details' | 'skills' | 'success';

interface OnboardingData {
  role: 'worker' | 'employer' | null;
  phone: string;
  category: string;
  bio: string;
  companyName: string;
  location: string;
  skills: string[];
  objective: string;
}

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('role');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');

  const [formData, setFormData] = useState<OnboardingData>({
    role: null,
    phone: '',
    category: 'construction',
    bio: '',
    companyName: '',
    location: '',
    skills: [],
    objective: '',
  });

  useEffect(() => {
    // Récupérer le nom de l'utilisateur et les données Google
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Récupérer le profil depuis Firestore
          const profile = await getUserProfile(user.uid);
          
          if (profile) {
            // Utiliser le profil existant
            setUserName(profile.firstName || 'Utilisateur');
          } else {
            // Récupérer les données de Google si disponibles
            const firstName = user.displayName?.split(' ')[0] || 'Utilisateur';
            const lastName = user.displayName?.split(' ').slice(1).join(' ') || '';
            
            setUserName(firstName);
            
            // Pré-remplir les données Google
            setFormData(prev => ({
              ...prev,
              // Les autres champs restent vides pour que l'utilisateur les remplisse
            }));
            
            console.log('Google user data:', {
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              firstName,
              lastName
            });
          }
        } catch (err) {
          console.error('Erreur récupération profil:', err);
        }
      } else {
        navigate('/login');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = () => {
    if (currentStep === 'role' && !formData.role) {
      setError('Veuillez sélectionner un rôle');
      return false;
    }
    if (currentStep === 'details') {
      if (!formData.phone) {
        setError('Veuillez entrer votre numéro de téléphone');
        return false;
      }
      if (formData.role === 'employer' && !formData.companyName) {
        setError('Veuillez entrer le nom de votre entreprise');
        return false;
      }
    }
    if (currentStep === 'skills') {
      if (!formData.objective) {
        setError('Veuillez décrire votre objectif');
        return false;
      }
      if (formData.role === 'worker' && !formData.category) {
        setError('Veuillez sélectionner une catégorie');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep()) return;

    if (currentStep === 'role') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('skills');
    } else if (currentStep === 'skills') {
      handleSubmit();
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 'details') {
      setCurrentStep('role');
    } else if (currentStep === 'skills') {
      setCurrentStep('details');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      console.log('Sauvegarde du profil pour:', user.uid);

      // Créer le profil utilisateur avec les données complètes
      const profileData: any = {
        id: user.uid,
        firstName: user.displayName?.split(' ')[0] || 'Utilisateur',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        phone: formData.phone,
        role: formData.role as 'worker' | 'employer',
        avatar: user.photoURL || undefined, // Récupérer la photo Google
        verified: false,
        premium: false,
        createdAt: new Date(),
        rating: 0,
        totalJobs: 0,
        totalJobsPosted: 0,
      };

      console.log('Google user data:', {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        avatar: profileData.avatar,
      });

      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (formData.role === 'worker') {
        profileData.category = formData.category;
        if (formData.bio) profileData.bio = formData.bio;
      }

      if (formData.location) {
        profileData.location = {
          city: formData.location,
          district: ''
        };
      }

      if (formData.objective) {
        profileData.objective = formData.objective;
      }

      console.log('Données à sauvegarder:', profileData);

      await updateUserProfile(user.uid, profileData);

      console.log('Profil sauvegardé avec succès');
      setCurrentStep('success');
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.message || 'Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessRedirect = async () => {
    console.log('Redirection selon le rôle:', formData.role);
    
    // Attendre un peu pour que Firestore soit synchronisé
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Rediriger selon le rôle
    if (formData.role === 'worker') {
      console.log('Redirection worker vers /search');
      navigate('/search'); // Les workers vont chercher du travail
    } else {
      console.log('Redirection employer vers /');
      navigate('/'); // Les employers vont à l'accueil
    }
  };

  // Stepper steps
  const steps = [
    { id: 'role', label: 'Votre rôle', icon: '👤', number: 1 },
    { id: 'details', label: 'Détails', icon: '📋', number: 2 },
    { id: 'skills', label: 'Objectifs', icon: '🎯', number: 3 },
  ];

  const getStepIndex = () => {
    if (currentStep === 'success') return 3;
    return steps.findIndex(s => s.id === currentStep);
  };

  const stepIndex = getStepIndex();
  const progress = ((stepIndex + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100/50 to-primary-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-400 dark:to-primary-500 bg-clip-text text-transparent mb-2">
            Bienvenue, {userName} ! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Finalisez votre profil en quelques étapes
          </p>
        </div>

        {/* Stepper Progress Bar */}
        {currentStep !== 'success' && (
          <div className="mb-12">
            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Steps */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-all ${
                        index < stepIndex
                          ? 'bg-green-500 text-white shadow-lg'
                          : index === stepIndex
                          ? 'bg-primary-500 text-white shadow-lg scale-110'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {index < stepIndex ? '✓' : step.number}
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      index <= stepIndex
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
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

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-8 flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Quel est votre rôle ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choisissez le rôle qui vous correspond le mieux
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Worker Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'worker' });
                    setError('');
                  }}
                  className={`p-8 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                    formData.role === 'worker'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-5xl mb-4">👷</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Je suis Travailleur
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Je cherche du travail et des missions
                  </p>
                </button>

                {/* Employer Card */}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, role: 'employer' });
                    setError('');
                  }}
                  className={`p-8 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                    formData.role === 'employer'
                      ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 shadow-xl'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:shadow-lg'
                  }`}
                >
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Je suis Employeur
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Je cherche des travailleurs qualifiés
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {formData.role === 'worker' ? 'Vos informations' : 'Informations de votre entreprise'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Aidez-nous à mieux vous connaître
                </p>
              </div>

              <Input
                label="Numéro de téléphone"
                name="phone"
                type="tel"
                placeholder="6XX XX XX XX"
                value={formData.phone}
                onChange={handleChange}
                icon={<Phone size={20} />}
                required
              />

              <Input
                label="Localisation"
                name="location"
                type="text"
                placeholder="Yaoundé, Douala..."
                value={formData.location}
                onChange={handleChange}
                icon={<MapPin size={20} />}
              />

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

              {formData.role === 'worker' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio (optionnel)
                  </label>
                  <textarea
                    name="bio"
                    placeholder="Parlez de vos expériences et compétences..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Skills & Objectives */}
          {currentStep === 'skills' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {formData.role === 'worker' ? 'Vos compétences' : 'Vos besoins'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Décrivez votre objectif principal
                </p>
              </div>

              {formData.role === 'worker' && (
                <Select
                  label="Catégorie de compétence"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={Object.entries(JOB_CATEGORIES).map(([key, cat]) => ({
                    value: key,
                    label: `${cat.icon} ${cat.label}`,
                  }))}
                  required
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {formData.role === 'worker' ? 'Quel est votre objectif ?' : 'Quel type de travail recherchez-vous ?'}
                </label>
                <textarea
                  name="objective"
                  placeholder={formData.role === 'worker' 
                    ? 'Ex: Je cherche des missions en construction pour développer mon expérience...'
                    : 'Ex: Je cherche des développeurs pour un projet web...'
                  }
                  value={formData.objective}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none dark:bg-gray-700 dark:text-white resize-none"
                  rows={5}
                  required
                />
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="text-center py-12">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle size={48} className="text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Profil complété ! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                Bienvenue sur JobCamer, {userName} !
              </p>
              <p className="text-gray-500 dark:text-gray-500">
                Votre profil est maintenant prêt. Commencez à explorer les opportunités.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            {currentStep !== 'role' && currentStep !== 'success' && (
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
                icon={currentStep === 'skills' ? <CheckCircle size={20} /> : <ArrowRight size={20} />}
              >
                {currentStep === 'skills' ? 'Terminer' : 'Suivant'}
              </Button>
            )}

            {currentStep === 'success' && (
              <Button
                fullWidth
                onClick={handleSuccessRedirect}
                icon={<ArrowRight size={20} />}
              >
                Aller à l'accueil
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
