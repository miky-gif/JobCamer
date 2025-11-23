import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/common/Button';
import { Input, TextArea, Select } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { JOB_CATEGORIES, CITIES } from '../utils/constants';
import { JobCategory } from '../types';
import { Briefcase, MapPin, DollarSign, Calendar, Clock, FileText, CheckCircle } from 'lucide-react';

export const PostJob: React.FC = () => {
  const { user } = useAuth();
  const { createJob } = useJobs();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'construction' as JobCategory,
    city: 'Yaoundé',
    district: '',
    budget: '',
    duration: '',
    startDate: '',
    urgent: false,
    requirements: ['']
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const removeRequirement = (index: number) => {
    const newRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        employerId: user!.id,
        employer: user as any,
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        location: {
          city: formData.city,
          district: formData.district,
          latitude: 3.8480,
          longitude: 11.5021
        },
        budget: parseInt(formData.budget),
        duration: parseInt(formData.duration),
        startDate: new Date(formData.startDate),
        urgent: formData.urgent,
        sponsored: false,
        requirements: formData.requirements.filter(r => r.trim() !== ''),
        applicants: [],
        status: 'open' as const
      };

      // Créer l'offre dans Firebase
      await createJob(jobData);
      
      console.log('✅ Offre publiée avec succès');
      setSuccess(true);

      // Redirection après succès
      setTimeout(() => {
        navigate('/employer-dashboard');
      }, 2000);
    } catch (error) {
      console.error('❌ Erreur lors de la publication de l\'offre:', error);
      alert('Erreur lors de la publication de l\'offre');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center border-l-4 border-green-500 shadow-lg">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Offre publiée avec succès !
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Votre offre est maintenant visible par tous les travailleurs.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirection en cours...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900/20 dark:to-red-900/20 rounded-2xl border-l-4 border-green-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Publier une offre d'emploi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Remplissez les informations ci-dessous pour trouver le travailleur idéal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Briefcase className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Informations de base
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Décrivez le poste à pourvoir
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Titre de l'offre *"
                name="title"
                type="text"
                placeholder="Ex: Maçon pour construction villa"
                value={formData.title}
                onChange={handleChange}
                required
              />

              <Select
                label="Catégorie *"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={Object.entries(JOB_CATEGORIES).map(([key, cat]) => ({
                  value: key,
                  label: `${cat.icon} ${cat.label}`
                }))}
                required
              />

              <TextArea
                label="Description détaillée *"
                name="description"
                placeholder="Décrivez en détail le travail à effectuer, les conditions, etc."
                value={formData.description}
                onChange={handleChange}
                rows={6}
                required
              />
            </div>
          </Card>

          {/* Location */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Localisation
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Où se déroulera le travail ?
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Select
                label="Ville *"
                name="city"
                value={formData.city}
                onChange={handleChange}
                options={CITIES.map(city => ({ value: city, label: city }))}
                required
              />

              <Input
                label="Quartier/District *"
                name="district"
                type="text"
                placeholder="Ex: Bastos, Ngousso..."
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* Budget & Duration */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Budget & Durée
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Définissez votre budget et la durée du projet
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Budget total (FCFA) *"
                name="budget"
                type="number"
                placeholder="50000"
                value={formData.budget}
                onChange={handleChange}
                icon={<DollarSign size={20} />}
                required
              />

              <Input
                label="Durée (jours) *"
                name="duration"
                type="number"
                placeholder="7"
                value={formData.duration}
                onChange={handleChange}
                icon={<Clock size={20} />}
                required
              />

              <Input
                label="Date de début *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                icon={<Calendar size={20} />}
                required
              />
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="urgent"
                name="urgent"
                checked={formData.urgent}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="urgent" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Marquer cette offre comme urgente (plus de visibilité)
              </label>
            </div>
          </Card>

          {/* Requirements */}
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exigences
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Listez les compétences ou qualifications requises
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Exigence ${index + 1}`}
                    value={req}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeRequirement(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="w-full"
              >
                + Ajouter une exigence
              </Button>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              Publier l'offre
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
