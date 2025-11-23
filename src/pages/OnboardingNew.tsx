import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/authService';
import { auth } from '../config/firebase';
import { ChevronRight, ChevronLeft, MapPin, Camera, Check, Search, X, Plus } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
}

const steps: OnboardingStep[] = [
  { id: 1, title: "Bienvenue sur JobCamer", subtitle: "Votre plateforme de mise en relation professionnelle" },
  { id: 2, title: "Type de compte", subtitle: "Comment souhaitez-vous utiliser la plateforme ?" },
  { id: 3, title: "Catégories d'intérêt", subtitle: "Sélectionnez vos domaines de compétence ou d'intérêt" },
  { id: 4, title: "Localisation", subtitle: "Où souhaitez-vous exercer ou recruter ?" },
  { id: 5, title: "Photo de profil", subtitle: "Ajoutez une photo pour personnaliser votre profil" }
];

const predefinedCategories = [
  'Construction', 'Plomberie', 'Électricité', 'Maçonnerie',
  'Agriculture', 'Jardinage', 'Élevage',
  'Ménage', 'Cuisine', 'Baby-sitting', 'Garde-malade',
  'Livraison', 'Transport', 'Déménagement',
  'Coiffure', 'Couture', 'Mécanique',
  'Événementiel', 'Serveur', 'Hôtellerie',
  'Informatique', 'Réparation téléphones',
  'Peinture', 'Décoration', 'Design'
];

const cities = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Ebolowa', 'Kribi'];
const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: 'Toute la région' }
];

export const OnboardingNew: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'worker' | 'employer' | undefined>(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [location, setLocation] = useState({ city: '', radius: 10 });
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = predefinedCategories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase()) &&
    !selectedCategories.includes(cat)
  );

  const addCategory = (category: string) => {
    if (selectedCategories.length < 5 && !selectedCategories.includes(category)) {
      setSelectedCategories([...selectedCategories, category]);
      setCategorySearch('');
    }
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(selectedCategories.filter(cat => cat !== category));
  };

  const addCustomCategory = () => {
    if (categorySearch.trim() && !selectedCategories.includes(categorySearch.trim()) && selectedCategories.length < 5) {
      setSelectedCategories([...selectedCategories, categorySearch.trim()]);
      setCategorySearch('');
    }
  };

  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep, 'canProceed:', canProceed());
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkipPhoto = () => {
    console.log('handleSkipPhoto called');
    if (currentStep === 5) {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    console.log('=== DÉBUT FINALISATION ONBOARDING ===');
    setLoading(true);
    
    try {
      // Vérifier si l'utilisateur Firebase est connecté
      const firebaseUser = auth.currentUser;
      console.log('Firebase user:', firebaseUser);
      console.log('Context user:', user);
      
      if (!firebaseUser) {
        console.error('Aucun utilisateur Firebase connecté');
        
        // Fallback: créer un utilisateur temporaire et rediriger
        console.log('Création d\'un utilisateur temporaire pour continuer...');
        const tempUser = {
          id: `temp_${Date.now()}`,
          email: 'temp@example.com',
          firstName: 'Utilisateur',
          lastName: 'Temporaire',
          role: userType,
          phone: '',
          createdAt: new Date(),
          verified: false,
          premium: false
        };
        
        localStorage.setItem('jobcamer_temp_user', JSON.stringify(tempUser));
        localStorage.setItem('jobcamer_onboarding_data', JSON.stringify({
          userType,
          selectedCategories,
          location,
          profileImage
        }));
        
        console.log('Données sauvegardées localement, redirection...');
        navigate(userType === 'worker' ? '/search' : '/', { replace: true });
        return;
      }

      console.log('Finalisation de l\'onboarding pour:', firebaseUser.uid);
      const profileData = {
        role: userType,
        category: selectedCategories[0] || '',
        location: { city: location.city, district: '' },
        avatar: profileImage,
        firstName: firebaseUser.displayName?.split(' ')[0] || 'Utilisateur',
        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
        email: firebaseUser.email || '',
        phone: '',
        createdAt: new Date(),
        verified: false,
        premium: false
      };
      
      console.log('Données à sauvegarder:', profileData);

      try {
        // Utiliser l'ID Firebase directement
        await updateUserProfile(firebaseUser.uid, profileData);
        console.log('✅ Profil mis à jour avec succès dans Firestore');
      } catch (firestoreError) {
        console.error('❌ Erreur Firestore, sauvegarde locale:', firestoreError);
        // Sauvegarder localement en cas d'erreur Firestore
        localStorage.setItem('jobcamer_profile_data', JSON.stringify(profileData));
      }
      
      console.log('Redirection vers:', userType === 'worker' ? '/search' : '/');
      
      // Redirection immédiate
      navigate(userType === 'worker' ? '/search' : '/', { replace: true });
      
    } catch (error) {
      console.error('❌ Erreur générale lors de la finalisation:', error);
      
      // En cas d'erreur, sauvegarder localement et rediriger quand même
      const fallbackData = {
        userType,
        selectedCategories,
        location,
        profileImage,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('jobcamer_onboarding_fallback', JSON.stringify(fallbackData));
      console.log('Données sauvegardées en fallback, redirection forcée...');
      
      // Redirection forcée
      navigate(userType === 'worker' ? '/search' : '/', { replace: true });
    } finally {
      setLoading(false);
      console.log('=== FIN FINALISATION ONBOARDING ===');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true;
      case 2: return userType !== undefined;
      case 3: return selectedCategories.length > 0;
      case 4: return location.city !== '';
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 relative overflow-hidden">
      {/* Subtle Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-green-400/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-red-400/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-56 h-56 bg-yellow-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-500/20 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-red-500/20 rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-yellow-500/20 rounded-full animate-ping delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Elegant Progress bar */}
        <div className="w-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="JobCamer" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <div>
                  <span className="font-black text-lg text-gray-900 dark:text-white">JobCamer</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Configuration du profil</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Étape {currentStep} sur 5
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round((currentStep / 5) * 100)}% terminé
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {/* Elegant Step indicator */}
            <div className="flex justify-center mb-16">
              <div className="flex items-center gap-6">
                {steps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-3">
                      <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-500 ${
                        currentStep >= step.id 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl scale-110 ring-4 ring-green-500/20' 
                          : currentStep === step.id
                          ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-lg ring-4 ring-green-500/30 scale-105'
                          : 'bg-white/70 dark:bg-gray-700/70 text-gray-400 dark:text-gray-500 shadow-md'
                      }`}>
                        {currentStep > step.id ? (
                          <Check size={22} className="animate-in zoom-in duration-300" />
                        ) : (
                          <span className="transition-all duration-300">{step.id}</span>
                        )}
                        {currentStep === step.id && (
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl animate-pulse"></div>
                        )}
                      </div>
                      <div className={`text-xs font-medium transition-all duration-300 ${
                        currentStep >= step.id 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {step.title.split(' ')[0]}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-20 h-0.5 rounded-full transition-all duration-500 ${
                        currentStep > step.id 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-sm' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step content */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 shadow-2xl border border-white/30 dark:border-gray-700/30">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
                  {steps[currentStep - 1].title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {steps[currentStep - 1].subtitle}
                </p>
              </div>

              {/* Step 1: Welcome */}
              {currentStep === 1 && (
                <div className="text-center space-y-8">
                  <div className="w-32 h-32 mx-auto bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center shadow-2xl p-6">
                    <img src="/logo.png" alt="JobCamer" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                      Bienvenue sur la première plateforme camerounaise de mise en relation professionnelle !
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Nous allons configurer votre profil en quelques étapes simples pour vous offrir la meilleure expérience possible.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: User Type */}
              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-8">
                  <div 
                    onClick={() => setUserType('worker')}
                    className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                      userType === 'worker' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-xl scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 ${
                        userType === 'worker' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
                      }`}>
                        👷
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Je cherche du travail</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Trouvez des missions et opportunités d'emploi près de chez vous
                      </p>
                    </div>
                    {userType === 'worker' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div 
                    onClick={() => setUserType('employer')}
                    className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${
                      userType === 'employer' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-xl scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 ${
                        userType === 'employer' 
                          ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-lg' 
                          : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/30'
                      }`}>
                        💼
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Je cherche à recruter</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Publiez des offres et trouvez les meilleurs talents
                      </p>
                    </div>
                    {userType === 'employer' && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Categories */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Search input */}
                  <div className="relative">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Rechercher ou créer une catégorie..."
                          className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white text-lg"
                          onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                        />
                      </div>
                      {categorySearch.trim() && !predefinedCategories.includes(categorySearch.trim()) && (
                        <button
                          onClick={addCustomCategory}
                          className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Plus size={20} />
                          Ajouter
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Selected categories */}
                  {selectedCategories.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Catégories sélectionnées ({selectedCategories.length}/5)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                          <div key={category} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full">
                            <span>{category}</span>
                            <button onClick={() => removeCategory(category)} className="hover:bg-white/20 rounded-full p-1">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested categories */}
                  {filteredCategories.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Suggestions</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredCategories.slice(0, 12).map((category) => (
                          <button
                            key={category}
                            onClick={() => addCategory(category)}
                            disabled={selectedCategories.length >= 5}
                            className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-xl hover:border-yellow-400 dark:hover:border-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Location */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                        <MapPin className="inline mr-2" size={20} />
                        Ville
                      </label>
                      <select
                        value={location.city}
                        onChange={(e) => setLocation({...location, city: e.target.value})}
                        className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white text-lg"
                      >
                        <option value="">Sélectionnez votre ville</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-lg font-semibold text-gray-900 dark:text-white">
                        Rayon d'action
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {radiusOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setLocation({...location, radius: option.value})}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              location.radius === option.value
                                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-yellow-300'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Profile Image */}
              {currentStep === 5 && (
                <div className="text-center space-y-8">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-3xl flex items-center justify-center overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={48} className="text-gray-400" />
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all">
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Une photo de profil aide à établir la confiance avec vos futurs partenaires
                    </p>
                    <div className="flex justify-center gap-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Choisir une photo
                      </button>
                      <button 
                        onClick={handleSkipPhoto}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                      >
                        Passer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Elegant Navigation buttons */}
              <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="group flex items-center gap-3 px-6 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                  <span className="font-medium">Retour</span>
                </button>

                <div className="flex items-center gap-4">
                  {currentStep < 5 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {5 - currentStep} étape{5 - currentStep > 1 ? 's' : ''} restante{5 - currentStep > 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <button
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 border-2 border-green-500/20 hover:border-green-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-yellow-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <span className="relative z-10">
                      {loading ? (
                        <div className="flex items-center gap-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-500 border-t-transparent"></div>
                          Finalisation...
                        </div>
                      ) : currentStep === 5 ? (
                        <div className="flex items-center gap-3">
                          <span>Terminer</span>
                          <Check size={20} className="text-green-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span>Suivant</span>
                          <ChevronRight size={20} className="text-green-500 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
