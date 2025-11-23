import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select } from '../components/common/Input';
import { Star, MapPin, Briefcase, Calendar, Edit2, Save, X, CheckCircle2, Plus, Zap, Image as ImageIcon, Upload, Shield, FileText } from 'lucide-react';
import { mockReviews } from '../data/mockData';
import { JOB_CATEGORIES, CITIES } from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { getUserProfile, updateUserProfile } from '../services/authService';
import { auth } from '../config/firebase';
import { testNotificationSystem, testFirebaseConnection, diagnoseFirestoreRules } from '../utils/testNotifications';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [skillInput, setSkillInput] = useState('');
  const [savingField, setSavingField] = useState<string | null>(null);

  // Calculer le pourcentage de complétion du profil
  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 0;

    if (user?.role === 'worker') {
      total = 8;
      if (fullProfile?.avatar) completed++;
      if (fullProfile?.phone) completed++;
      if (fullProfile?.location?.city) completed++;
      if (fullProfile?.category) completed++;
      if (fullProfile?.bio) completed++;
      if (fullProfile?.skills?.length > 0) completed++;
      if (fullProfile?.objective) completed++;
      if (fullProfile?.verified) completed++;
    } else {
      total = 7;
      if (fullProfile?.avatar) completed++;
      if (fullProfile?.phone) completed++;
      if (fullProfile?.location?.city) completed++;
      if (fullProfile?.companyName) completed++;
      if (fullProfile?.companyDescription) completed++;
      if (fullProfile?.cniImages?.length === 2) completed++;
      if (fullProfile?.verified) completed++;
    }

    return Math.round((completed / total) * 100);
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  // Charger le profil complet depuis Firestore
  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        console.log('Loading profile for user:', currentUser?.uid);
        
        if (currentUser) {
          const profile = await getUserProfile(currentUser.uid);
          console.log('Profile loaded:', profile);
          
          if (isMounted) {
            if (profile) {
              const mergedProfile = {
                ...user,
                ...profile
              };
              console.log('Merged profile:', mergedProfile);
              setFullProfile(mergedProfile);
            } else {
              console.log('No profile found, using user data');
              setFullProfile(user);
            }
          }
        } else {
          console.log('No current user');
          if (isMounted) {
            setFullProfile(user);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isMounted) {
          setFullProfile(user);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const userReviews = mockReviews.filter(r => r.revieweeId === user.id);

  const handleEdit = () => {
    setEditedData(fullProfile);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData({});
    setIsEditing(false);
  };

  // Fonction de test des notifications (temporaire)
  const handleTestNotifications = async () => {
    if (!user?.id) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    console.log('🔍 Test des notifications pour:', user.id);
    
    // Test 1: Connexion Firebase
    const firebaseTest = await testFirebaseConnection();
    console.log('Firebase Test:', firebaseTest);
    
    // Test 2: Système de notifications
    const notificationTest = await testNotificationSystem(user.id);
    console.log('Notification Test:', notificationTest);
    
    // Test 3: Afficher les règles recommandées
    diagnoseFirestoreRules();
    
    alert('Tests terminés ! Vérifiez la console (F12) pour les résultats.');
  };

  // Sauvegarder un champ spécifique
  const saveField = async (fieldName: string, value: any) => {
    try {
      setSavingField(fieldName);
      const updates: any = {};
      updates[fieldName] = value;
      await updateUserProfile(user?.id || '', updates);
      setFullProfile((prev: any) => ({ ...prev, [fieldName]: value }));
      setTimeout(() => setSavingField(null), 1000);
    } catch (error) {
      console.error('Error saving field:', error);
      setSavingField(null);
    }
  };

  // Ajouter une compétence
  const addSkill = async () => {
    if (skillInput.trim()) {
      const newSkills = [...(fullProfile?.skills || []), skillInput.trim()];
      await saveField('skills', newSkills);
      setSkillInput('');
    }
  };

  // Retirer une compétence
  const removeSkill = async (index: number) => {
    const newSkills = fullProfile?.skills?.filter((_: string, i: number) => i !== index) || [];
    await saveField('skills', newSkills);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!fullProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profil non trouvé
          </h2>
          <Button onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateProfileCompletion();
  const isProfileComplete = completionPercentage === 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Completion Notification */}
        {!isProfileComplete && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Zap className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Complétez votre profil pour plus de visibilité ! 🚀
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Votre profil est à {completionPercentage}% complet. Remplissez les sections ci-dessous pour attirer plus de clients.
                </p>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {completionPercentage}% complet
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Bouton de test temporaire - À SUPPRIMER EN PRODUCTION */}
        <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">🔧 Test des Notifications</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Diagnostiquer pourquoi les notifications ne fonctionnent pas</p>
            </div>
            <Button 
              onClick={handleTestNotifications}
              variant="outline"
              size="sm"
            >
              Tester
            </Button>
          </div>
        </Card>

        {/* Success Message */}
        {isProfileComplete && (
          <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <CheckCircle2 className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  Profil complet ! ✨
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Excellent ! Votre profil est maintenant optimisé pour attirer des clients.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Header Card */}
        <Card className="mb-6 border-l-4 border-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={fullProfile.avatar || 'https://i.pravatar.cc/150'}
                alt={fullProfile.firstName}
                className="w-24 h-24 rounded-full object-cover"
              />
              {fullProfile.verified && (
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-800">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {fullProfile.firstName} {fullProfile.lastName}
                </h1>
                {fullProfile.premium && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium rounded-full">
                    ⭐ Premium
                  </span>
                )}
              </div>

              {user.role === 'worker' && (fullProfile as any).category && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Briefcase size={16} />
                  <span>{JOB_CATEGORIES[(fullProfile as any).category]?.label}</span>
                </div>
              )}

              {(fullProfile as any).location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <MapPin size={16} />
                  <span>{(fullProfile as any).location.district}, {(fullProfile as any).location.city}</span>
                </div>
              )}

              {/* Rating */}
              {(fullProfile as any).rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={i < Math.floor((fullProfile as any).rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {(fullProfile as any).rating?.toFixed(1)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    ({user.role === 'worker' ? (fullProfile as any).totalJobs : (fullProfile as any).totalJobsPosted} missions)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                <span>Membre depuis {formatDate(fullProfile.createdAt)}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                icon={isEditing ? <X size={20} /> : <Edit2 size={20} />}
                onClick={isEditing ? handleCancel : handleEdit}
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Bio / Description */}
        <Card className={`mb-6 ${
          !fullProfile?.bio
            ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
            : 'border-l-4 border-green-500'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.role === 'worker' ? 'À propos' : 'Description'}
            </h2>
            {fullProfile?.bio && (
              <CheckCircle2 className="text-green-500" size={20} />
            )}
          </div>
          {isEditing ? (
            <div className="space-y-3">
              <TextArea
                value={editedData.bio || ''}
                onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                rows={4}
                placeholder="Décrivez votre expérience, vos compétences..."
              />
              <Button
                size="sm"
                onClick={() => saveField('bio', editedData.bio)}
                loading={savingField === 'bio'}
              >
                Sauvegarder
              </Button>
            </div>
          ) : !fullProfile?.bio ? (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                ⚠️ Ajoutez une description pour que les clients vous connaissent mieux
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
              >
                Ajouter une description
              </Button>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">
              {fullProfile?.bio}
            </p>
          )}
        </Card>

        {/* Worker-specific sections */}
        {user.role === 'worker' && (
          <>
            {/* Localisation */}
            <Card className={`mb-6 ${
              !fullProfile?.location?.city
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Localisation
                </h2>
                {fullProfile?.location?.city && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              {!fullProfile?.location?.city ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    📍 Indiquez votre localisation pour que les clients vous trouvent
                  </p>
                  <div className="space-y-3">
                    <Select
                      label="Ville"
                      value={editedData.location?.city || ''}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        location: { ...editedData.location, city: e.target.value }
                      })}
                    >
                      <option value="">Sélectionner une ville</option>
                      {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </Select>
                    <Input
                      label="Quartier"
                      value={editedData.location?.district || ''}
                      onChange={(e) => setEditedData({
                        ...editedData,
                        location: { ...editedData.location, district: e.target.value }
                      })}
                      placeholder="Quartier"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveField('location', editedData.location)}
                      loading={savingField === 'location'}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin size={18} className="text-primary-600" />
                  <span>{fullProfile?.location?.district}, {fullProfile?.location?.city}</span>
                </div>
              )}
            </Card>

            {/* Catégorie */}
            <Card className={`mb-6 ${
              !fullProfile?.category
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} />
                  Catégorie de Travail
                </h2>
                {fullProfile?.category && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              {!fullProfile?.category ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    💼 Sélectionnez votre catégorie de travail
                  </p>
                  <div className="space-y-3">
                    <Select
                      label="Catégorie"
                      value={editedData.category || ''}
                      onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {Object.entries(JOB_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
                      ))}
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => saveField('category', editedData.category)}
                      loading={savingField === 'category'}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {JOB_CATEGORIES[fullProfile?.category as any]?.label}
                </p>
              )}
            </Card>

            {/* Objectif */}
            <Card className={`mb-6 ${
              !fullProfile?.objective
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Objectif Professionnel
                </h2>
                {fullProfile?.objective && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              {!fullProfile?.objective ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    🎯 Décrivez le type de travail que vous recherchez
                  </p>
                  <div className="space-y-3">
                    <TextArea
                      value={editedData.objective || ''}
                      onChange={(e) => setEditedData({ ...editedData, objective: e.target.value })}
                      placeholder="Ex: Chercher des missions de construction et rénovation"
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={() => saveField('objective', editedData.objective)}
                      loading={savingField === 'objective'}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">
                  {fullProfile?.objective}
                </p>
              )}
            </Card>

            {/* Skills & Rates */}
            <Card className={`mb-6 ${
              !fullProfile?.skills || fullProfile?.skills?.length === 0
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Compétences
                </h2>
                {fullProfile?.skills && fullProfile?.skills?.length > 0 && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              
              {!fullProfile?.skills || fullProfile?.skills?.length === 0 ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    ⭐ Ajoutez vos compétences pour être plus attractif
                  </p>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="Ex: Maçonnerie"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button
                        size="sm"
                        icon={<Plus size={18} />}
                        onClick={addSkill}
                        disabled={!skillInput.trim()}
                      >
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {fullProfile?.skills?.map((skill: string, index: number) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(index)}
                          className="hover:text-primary-900 dark:hover:text-primary-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Ajouter une compétence"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button
                      size="sm"
                      icon={<Plus size={18} />}
                      onClick={addSkill}
                      disabled={!skillInput.trim()}
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Certifications */}
            {(fullProfile as any).certifications && (fullProfile as any).certifications.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {(fullProfile as any).certifications.map((cert: any) => (
                    <div key={cert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl">{cert.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h3>
                          {cert.verified && (
                            <span className="text-blue-500 text-sm">✓ Vérifié</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {cert.issuer} • {formatDate(cert.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Portfolio */}
            <Card className={`mb-6 ${
              !fullProfile?.portfolio || fullProfile?.portfolio?.length === 0
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon size={20} />
                  Portfolio - Anciens Travaux
                </h2>
                {fullProfile?.portfolio && fullProfile?.portfolio?.length > 0 && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              
              {!fullProfile?.portfolio || fullProfile?.portfolio?.length === 0 ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    📸 Ajoutez des photos de vos anciens travaux pour montrer votre expertise
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Upload size={18} />}
                    onClick={() => navigate('/complete-profile')}
                  >
                    Ajouter des photos
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {fullProfile?.portfolio?.map((item: any, index: number) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Plus size={18} />}
                    onClick={() => navigate('/complete-profile')}
                  >
                    Ajouter plus de photos
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Employer Verification Section */}
        {user.role === 'employer' && (
          <>
            {/* Company Info */}
            <Card className={`mb-6 ${
              !fullProfile?.companyName
                ? 'border-l-4 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'
                : 'border-l-4 border-green-500'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase size={20} />
                  Informations Entreprise
                </h2>
                {fullProfile?.companyName && (
                  <CheckCircle2 className="text-green-500" size={20} />
                )}
              </div>
              
              {!fullProfile?.companyName ? (
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                    🏢 Complétez les informations de votre entreprise
                  </p>
                  <div className="space-y-3">
                    <Input
                      label="Nom de l'entreprise"
                      value={editedData.companyName || ''}
                      onChange={(e) => setEditedData({ ...editedData, companyName: e.target.value })}
                      placeholder="Ex: Ma Société SARL"
                    />
                    <TextArea
                      label="Description de l'entreprise"
                      value={editedData.companyDescription || ''}
                      onChange={(e) => setEditedData({ ...editedData, companyDescription: e.target.value })}
                      placeholder="Décrivez votre entreprise, vos services..."
                      rows={3}
                    />
                    <Input
                      label="Site web (optionnel)"
                      value={editedData.website || ''}
                      onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                      placeholder="https://www.example.com"
                    />
                    <Button
                      size="sm"
                      onClick={() => saveField('companyName', editedData.companyName)}
                      loading={savingField === 'companyName'}
                      disabled={!editedData.companyName?.trim()}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Nom</span>
                    <p className="text-gray-900 dark:text-white font-semibold">{fullProfile?.companyName}</p>
                  </div>
                  {fullProfile?.companyDescription && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Description</span>
                      <p className="text-gray-700 dark:text-gray-300">{fullProfile?.companyDescription}</p>
                    </div>
                  )}
                  {fullProfile?.website && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Site web</span>
                      <a href={fullProfile?.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">
                        {fullProfile?.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* CNI Verification */}
            <Card className={`mb-6 ${
              !fullProfile?.cniNumber || !fullProfile?.cniImages || fullProfile?.cniImages?.length < 2
                ? 'border-l-4 border-red-400 bg-red-50 dark:bg-red-900/10'
                : fullProfile?.verified
                ? 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10'
                : 'border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/10'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield size={20} />
                  Vérification d'Identité (CNI)
                </h2>
                {fullProfile?.verified && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-300">Vérifié</span>
                  </div>
                )}
                {!fullProfile?.verified && fullProfile?.cniNumber && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <FileText className="text-blue-600 dark:text-blue-400" size={16} />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">En attente</span>
                  </div>
                )}
              </div>
              
              {!fullProfile?.cniNumber || !fullProfile?.cniImages || fullProfile?.cniImages?.length < 2 ? (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200 mb-3">
                    🔐 Vérifiez votre compte en uploadant votre CNI pour renforcer la confiance
                  </p>
                  <div className="space-y-3">
                    <Input
                      label="Numéro de CNI"
                      value={editedData.cniNumber || ''}
                      onChange={(e) => setEditedData({ ...editedData, cniNumber: e.target.value })}
                      placeholder="Ex: 123456789"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      icon={<Upload size={18} />}
                      onClick={() => navigate('/complete-profile')}
                    >
                      Uploader images CNI
                    </Button>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      ⚠️ Vous devez uploader les 2 images (avant et arrière) de votre CNI
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Numéro de CNI</span>
                      <span className="text-gray-900 dark:text-white font-mono">{fullProfile?.cniNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Images uploadées</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        {fullProfile?.cniImages?.length || 0}/2 ✓
                      </span>
                    </div>
                  </div>

                  {fullProfile?.cniImages && fullProfile?.cniImages?.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {fullProfile?.cniImages?.map((image: string, index: number) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`CNI ${index === 0 ? 'Avant' : 'Arrière'}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 bg-gray-50 dark:bg-gray-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {index === 0 ? 'Avant (Recto)' : 'Arrière (Verso)'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {fullProfile?.verified ? (
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-200 font-semibold">
                        ✅ Votre compte est vérifié ! Vous avez accès à toutes les fonctionnalités premium.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-800 dark:text-blue-200 font-semibold mb-2">
                        ⏳ Votre demande de vérification est en attente
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Un administrateur examinera vos documents. Cela prend généralement 24-48 heures. Vous recevrez une notification quand c'est approuvé.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </>
        )}

        {/* Reviews */}
        {userReviews.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Évaluations ({userReviews.length})
            </h2>
            <div className="space-y-4">
              {userReviews.map(review => (
                <div key={review.id} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-start gap-3 mb-2">
                    <img
                      src={review.reviewerAvatar || 'https://i.pravatar.cc/150'}
                      alt={review.reviewerName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {review.reviewerName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Save button when editing */}
        {isEditing && (
          <Button
            fullWidth
            size="lg"
            icon={<Save size={20} />}
            onClick={handleSave}
          >
            Enregistrer les modifications
          </Button>
        )}
      </div>
    </div>
  );
};
