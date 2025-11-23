import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/common/Button';
import { TextArea } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { MapPin, Calendar, DollarSign, Clock, AlertCircle, Star, MessageCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { JOB_CATEGORIES } from '../utils/constants';
import { getUserProfile, UserProfile } from '../services/userService';

export const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { getJobById, applyToJob } = useJobs();
  const { user, isAuthenticated } = useAuth();
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [applying, setApplying] = useState(false);
  const [employerProfile, setEmployerProfile] = useState<UserProfile | null>(null);

  const job = getJobById(id!);

  // Charger le profil de l'employeur et incrémenter les vues
  useEffect(() => {
    const loadEmployerProfile = async () => {
      if (job?.employerId) {
        try {
          const profile = await getUserProfile(job.employerId);
          setEmployerProfile(profile);
        } catch (error) {
          console.error('Erreur lors du chargement du profil employeur:', error);
        }
      }
    };

    const incrementViews = async () => {
      if (job?.id && user?.id) {
        try {
          const { markJobAsViewed } = await import('../services/jobViewService');
          await markJobAsViewed(job.id, user.id);
        } catch (error) {
          console.error('Erreur lors de l\'incrémentation des vues:', error);
        }
      }
    };

    loadEmployerProfile();
    incrementViews();
  }, [job?.employerId, job?.id, user?.id]);

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Offre non trouvée
          </h2>
          <Button onClick={() => navigate('/search')}>
            Retour à la recherche
          </Button>
        </div>
      </div>
    );
  }

  const category = JOB_CATEGORIES[job.category];
  const hasApplied = user && job.applicants.includes(user.id);

  const handleApply = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setApplying(true);
    try {
      console.log('📝 Envoi de la candidature...');
      await applyToJob(job.id, user.id, applicationMessage, parseInt(proposedRate) || job.budget);
      setShowApplyModal(false);
      setApplicationMessage('');
      setProposedRate('');
      alert('Candidature envoyée avec succès !');
      console.log('✅ Candidature envoyée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de la candidature:', error);
      alert(error.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-6 font-semibold"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Job header */}
        <Card className="mb-6 border-l-4 border-green-500 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${category.color} text-white`}>
                  {category.icon} {category.label}
                </span>
                {job.urgent && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                )}
                {job.sponsored && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium rounded-full">
                    ⭐ Sponsorisé
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {job.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{job.location.district}, {job.location.city}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>Publié le {formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(job.budget)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Budget total
              </div>
            </div>
          </div>

          {/* Employer info */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {employerProfile?.avatar ? (
              <img 
                src={employerProfile.avatar} 
                alt={employerProfile.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
                  {employerProfile ? 
                    employerProfile.firstName.charAt(0).toUpperCase() : 
                    job.title.charAt(0).toUpperCase()
                  }
                </span>
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {employerProfile ? 
                  `${employerProfile.firstName} ${employerProfile.lastName}` : 
                  'Employeur'
                }
                {employerProfile?.companyName && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal ml-2">
                    ({employerProfile.companyName})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  <span>{employerProfile?.rating?.toFixed(1) || '4.5'}</span>
                </div>
                <span>•</span>
                <span>
                  {employerProfile?.verified ? 'Membre vérifié' : 'Membre'}
                </span>
                {employerProfile?.totalJobsPosted && (
                  <>
                    <span>•</span>
                    <span>{employerProfile.totalJobsPosted} offres publiées</span>
                  </>
                )}
              </div>
            </div>
            {isAuthenticated && user?.role === 'worker' && (
              <Button
                variant="outline"
                size="sm"
                icon={<MessageCircle size={16} />}
                onClick={() => navigate('/chat')}
              >
                Contacter
              </Button>
            )}
          </div>
        </Card>

        {/* Job details */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Clock className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Durée</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {job.duration} jour{job.duration > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Début</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(job.startDate)}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Candidatures</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {job.applicants.length} candidat{job.applicants.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Description */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Description du poste
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {job.description}
          </p>
        </Card>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Exigences
            </h2>
            <ul className="space-y-2">
              {job.requirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                  <span className="text-primary-600 dark:text-primary-400 mt-1">✓</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Apply button */}
        {isAuthenticated && user?.role === 'worker' && (
          <Card>
            {hasApplied ? (
              <div className="text-center py-4">
                <div className="text-green-600 dark:text-green-400 font-semibold mb-2">
                  ✓ Vous avez déjà postulé à cette offre
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  L'employeur examinera votre candidature prochainement
                </p>
              </div>
            ) : (
              <Button
                fullWidth
                size="lg"
                onClick={() => setShowApplyModal(true)}
              >
                Postuler à cette offre
              </Button>
            )}
          </Card>
        )}

        {!isAuthenticated && (
          <Card>
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connectez-vous pour postuler à cette offre
              </p>
              <Button onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Postuler à l'offre
            </h3>
            
            <div className="space-y-4 mb-6">
              <TextArea
                label="Message de motivation"
                placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={4}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Votre tarif proposé (FCFA)
                </label>
                <input
                  type="number"
                  placeholder={job.budget.toString()}
                  value={proposedRate}
                  onChange={(e) => setProposedRate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Budget proposé par l'employeur : {formatCurrency(job.budget)}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowApplyModal(false)}
              >
                Annuler
              </Button>
              <Button
                fullWidth
                loading={applying}
                onClick={handleApply}
                disabled={!applicationMessage.trim()}
              >
                Envoyer ma candidature
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
