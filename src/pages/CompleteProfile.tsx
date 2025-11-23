import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select } from '../components/common/Input';
import { Upload, X, Check, AlertCircle, Camera, FileText, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { updateUserProfile } from '../services/authService';
import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { JOB_CATEGORIES, CITIES } from '../utils/constants';

export const CompleteProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // Données du formulaire
  const [profileData, setProfileData] = useState({
    // Commun
    phone: user?.phone || '',
    city: (user as any)?.location?.city || '',
    district: (user as any)?.location?.district || '',
    avatar: user?.avatar || '',
    
    // Worker
    category: (user as any)?.category || 'construction',
    bio: (user as any)?.bio || '',
    skills: (user as any)?.skills || [],
    portfolio: (user as any)?.portfolio || [],
    objective: (user as any)?.objective || '',
    
    // Employer
    companyName: (user as any)?.companyName || '',
    companyDescription: (user as any)?.companyDescription || '',
    website: (user as any)?.website || '',
    verified: (user as any)?.verified || false,
    cniNumber: (user as any)?.cniNumber || '',
    cniImages: (user as any)?.cniImages || [],
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    avatar: null,
    cniImage1: null,
    cniImage2: null,
  });

  const [skillInput, setSkillInput] = useState('');
  const [portfolioInput, setPortfolioInput] = useState({ title: '', description: '' });
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  // Upload fichier
  const handleFileUpload = async (file: File, path: string): Promise<string> => {
    try {
      setUploadProgress(prev => ({ ...prev, [path]: 0 }));
      
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      
      setUploadProgress(prev => ({ ...prev, [path]: 100 }));
      return url;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  // Gérer la sélection de fichier
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles(prev => ({ ...prev, [fieldName]: file }));

    try {
      setLoading(true);
      const path = `profiles/${user?.id}/${fieldName}-${Date.now()}`;
      const url = await handleFileUpload(file, path);

      if (fieldName === 'avatar') {
        setProfileData(prev => ({ ...prev, avatar: url }));
      } else if (fieldName === 'cniImage1') {
        setProfileData(prev => ({
          ...prev,
          cniImages: [url, prev.cniImages[1] || '']
        }));
      } else if (fieldName === 'cniImage2') {
        setProfileData(prev => ({
          ...prev,
          cniImages: [prev.cniImages[0] || '', url]
        }));
      }
    } catch (err) {
      setError('Erreur lors du téléchargement du fichier');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une compétence
  const addSkill = () => {
    if (skillInput.trim()) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  // Retirer une compétence
  const removeSkill = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Ajouter une photo au portfolio
  const addPortfolioPhoto = async () => {
    if (!portfolioFile || !portfolioInput.title.trim()) {
      setError('Veuillez sélectionner une image et entrer un titre');
      return;
    }

    try {
      setLoading(true);
      const path = `profiles/${user?.id}/portfolio-${Date.now()}`;
      const url = await handleFileUpload(portfolioFile, path);

      setProfileData(prev => ({
        ...prev,
        portfolio: [
          ...prev.portfolio,
          {
            image: url,
            title: portfolioInput.title,
            description: portfolioInput.description
          }
        ]
      }));

      setPortfolioFile(null);
      setPortfolioInput({ title: '', description: '' });
      setError('');
    } catch (err) {
      setError('Erreur lors du téléchargement de la photo');
    } finally {
      setLoading(false);
    }
  };

  // Retirer une photo du portfolio
  const removePortfolioPhoto = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index)
    }));
  };

  // Sauvegarder le profil
  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      // Validation
      if (!profileData.phone) {
        setError('Le téléphone est requis');
        return;
      }

      if (user?.role === 'employer' && !profileData.companyName) {
        setError('Le nom de l\'entreprise est requis');
        return;
      }

      if (user?.role === 'worker' && !profileData.category) {
        setError('La catégorie est requise');
        return;
      }

      // Préparer les données
      const updates: any = {
        phone: profileData.phone,
        avatar: profileData.avatar,
        location: {
          city: profileData.city,
          district: profileData.district
        }
      };

      if (user?.role === 'worker') {
        updates.category = profileData.category;
        updates.bio = profileData.bio;
        updates.skills = profileData.skills;
        updates.objective = profileData.objective;
        updates.portfolio = profileData.portfolio;
      } else if (user?.role === 'employer') {
        updates.companyName = profileData.companyName;
        updates.companyDescription = profileData.companyDescription;
        updates.website = profileData.website;
        updates.cniNumber = profileData.cniNumber;
        updates.cniImages = profileData.cniImages;
      }

      // Sauvegarder
      await updateUserProfile(user?.id || '', updates);

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Compléter votre profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user.role === 'worker'
              ? 'Enrichissez votre profil pour attirer plus de clients'
              : 'Vérifiez votre identité et complétez les informations de votre entreprise'}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <Card className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <Check className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-700 dark:text-green-300">Profil sauvegardé avec succès !</p>
            </div>
          </Card>
        )}

        {/* Photo de Profil */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Camera size={20} />
            Photo de profil
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Aperçu */}
            <div className="relative">
              <img
                src={profileData.avatar || 'https://i.pravatar.cc/150'}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              <label className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                <Upload size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'avatar')}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Téléchargez une photo claire et professionnelle. Les formats acceptés : JPG, PNG (max 5MB)
              </p>
              {uploadProgress.avatar > 0 && uploadProgress.avatar < 100 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress.avatar}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Informations de Base */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Informations de base
          </h2>

          <div className="space-y-4">
            <Input
              label="Téléphone"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+237 6XX XX XX XX"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Ville"
                value={profileData.city}
                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
              >
                <option value="">Sélectionner une ville</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </Select>

              <Input
                label="Quartier"
                value={profileData.district}
                onChange={(e) => setProfileData(prev => ({ ...prev, district: e.target.value }))}
                placeholder="Quartier"
              />
            </div>
          </div>
        </Card>

        {/* Profil Travailleur */}
        {user.role === 'worker' && (
          <>
            {/* Catégorie et Bio */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Informations professionnelles
              </h2>

              <div className="space-y-4">
                <Select
                  label="Catégorie de travail"
                  value={profileData.category}
                  onChange={(e) => setProfileData(prev => ({ ...prev, category: e.target.value }))}
                >
                  {Object.entries(JOB_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </Select>

                <TextArea
                  label="Bio / Description"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Décrivez votre expérience, vos qualifications..."
                  rows={4}
                />

                <TextArea
                  label="Objectif professionnel"
                  value={profileData.objective}
                  onChange={(e) => setProfileData(prev => ({ ...prev, objective: e.target.value }))}
                  placeholder="Quel type de travail recherchez-vous ?"
                  rows={3}
                />
              </div>
            </Card>

            {/* Compétences */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Compétences
              </h2>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Ajouter une compétence (ex: Maçonnerie)"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button
                    onClick={addSkill}
                    variant="outline"
                    disabled={!skillInput.trim()}
                  >
                    Ajouter
                  </Button>
                </div>

                {/* Liste des compétences */}
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full flex items-center gap-2"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="hover:text-primary-900 dark:hover:text-primary-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Portfolio */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                Portfolio - Anciens Travaux
              </h2>

              <div className="space-y-4">
                {/* Ajouter une photo */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sélectionner une image
                      </label>
                      <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
                        {portfolioFile ? (
                          <div className="text-green-600 dark:text-green-400">
                            <Check size={24} className="mx-auto mb-2" />
                            <p className="text-sm">{portfolioFile.name}</p>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">
                            <Upload size={24} className="mx-auto mb-2" />
                            <p className="text-xs">Cliquez pour sélectionner une image</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPortfolioFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <Input
                      label="Titre du projet"
                      value={portfolioInput.title}
                      onChange={(e) => setPortfolioInput(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Maison rénovée - Yaoundé"
                      disabled={loading}
                    />

                    <TextArea
                      label="Description (optionnel)"
                      value={portfolioInput.description}
                      onChange={(e) => setPortfolioInput(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez ce projet..."
                      rows={2}
                      disabled={loading}
                    />

                    <Button
                      onClick={addPortfolioPhoto}
                      icon={<Plus size={18} />}
                      disabled={!portfolioFile || !portfolioInput.title.trim() || loading}
                      fullWidth
                    >
                      Ajouter la photo
                    </Button>
                  </div>
                </div>

                {/* Liste des photos */}
                {profileData.portfolio.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Photos ajoutées ({profileData.portfolio.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {profileData.portfolio.map((item, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                {item.description}
                              </p>
                            )}
                            <button
                              onClick={() => removePortfolioPhoto(index)}
                              className="w-full flex items-center justify-center gap-2 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs"
                              disabled={loading}
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Profil Employeur */}
        {user.role === 'employer' && (
          <>
            {/* Informations Entreprise */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Informations de l'entreprise
              </h2>

              <div className="space-y-4">
                <Input
                  label="Nom de l'entreprise"
                  value={profileData.companyName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Nom de votre entreprise"
                  required
                />

                <TextArea
                  label="Description de l'entreprise"
                  value={profileData.companyDescription}
                  onChange={(e) => setProfileData(prev => ({ ...prev, companyDescription: e.target.value }))}
                  placeholder="Décrivez votre entreprise, vos services..."
                  rows={4}
                />

                <Input
                  label="Site web (optionnel)"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.example.com"
                  type="url"
                />
              </div>
            </Card>

            {/* Vérification CNI */}
            <Card className="mb-6 border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-yellow-600 dark:text-yellow-400" />
                Vérification d'identité
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Pour renforcer la confiance, veuillez télécharger les images de votre CNI (avant et arrière)
              </p>

              <div className="space-y-4">
                <Input
                  label="Numéro de CNI"
                  value={profileData.cniNumber}
                  onChange={(e) => setProfileData(prev => ({ ...prev, cniNumber: e.target.value }))}
                  placeholder="Numéro de votre CNI"
                />

                {/* Images CNI */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Avant */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNI - Avant
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
                      {profileData.cniImages[0] ? (
                        <img
                          src={profileData.cniImages[0]}
                          alt="CNI Avant"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                          <Upload size={24} className="mx-auto mb-2" />
                          <p className="text-xs">Cliquez pour télécharger</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'cniImage1')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                    {uploadProgress.cniImage1 > 0 && uploadProgress.cniImage1 < 100 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-primary-600 h-1 rounded-full transition-all"
                          style={{ width: `${uploadProgress.cniImage1}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Arrière */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNI - Arrière
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors cursor-pointer">
                      {profileData.cniImages[1] ? (
                        <img
                          src={profileData.cniImages[1]}
                          alt="CNI Arrière"
                          className="w-full h-32 object-cover rounded"
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                          <Upload size={24} className="mx-auto mb-2" />
                          <p className="text-xs">Cliquez pour télécharger</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'cniImage2')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={loading}
                      />
                    </div>
                    {uploadProgress.cniImage2 > 0 && uploadProgress.cniImage2 < 100 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                        <div
                          className="bg-primary-600 h-1 rounded-full transition-all"
                          style={{ width: `${uploadProgress.cniImage2}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {profileData.cniImages[0] && profileData.cniImages[1] && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                    <Check className="text-green-600 dark:text-green-400" size={20} />
                    <span className="text-green-700 dark:text-green-300 text-sm">
                      Images CNI téléchargées avec succès
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}

        {/* Boutons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            className="flex-1"
          >
            Sauvegarder le profil
          </Button>
        </div>
      </div>
    </div>
  );
};
