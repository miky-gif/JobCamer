import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  Star,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface Job {
  id: string;
  employerId: string;
  title: string;
  description: string;
  category: string;
  location: { city: string; district: string };
  budget: number;
  duration: number;
  startDate: Date;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applicants: string[];
  requirements: string[];
  urgent: boolean;
  sponsored: boolean;
  createdAt: Date;
  updatedAt: Date;
  employer: any;
}

export const JobDetailNew: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Charger l'offre
  useEffect(() => {
    const loadJob = async () => {
      try {
        if (!jobId) {
          setError('ID de l\'offre manquant');
          setLoading(false);
          return;
        }

        console.log('📝 Chargement de l\'offre:', jobId);
        const { getJobById } = await import('../services/jobService');
        const loadedJob = await getJobById(jobId);

        if (!loadedJob) {
          setError('Offre non trouvée');
          setLoading(false);
          return;
        }

        console.log('✅ Offre chargée:', loadedJob);
        setJob(loadedJob as unknown as Job);

        // Vérifier si l'utilisateur a déjà postulé
        if (user && user.role === 'worker') {
          const { hasWorkerApplied } = await import('../services/applicationService');
          const applied = await hasWorkerApplied(jobId, user.id);
          setHasApplied(applied);
        }
      } catch (err) {
        console.error('❌ Erreur lors du chargement de l\'offre:', err);
        setError('Erreur lors du chargement de l\'offre');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, user]);

  // Soumettre une candidature
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || user.role !== 'worker') {
      alert('Vous devez être connecté en tant que travailleur pour postuler');
      navigate('/login');
      return;
    }

    if (!applicationMessage.trim()) {
      alert('Veuillez entrer un message');
      return;
    }

    try {
      setApplying(true);
      console.log('📝 Soumission de la candidature...');

      const { createApplication } = await import('../services/applicationService');
      const { createJobNotification } = await import('../services/notificationJobService');

      // Créer la candidature
      await createApplication(
        jobId!,
        user.id,
        user.firstName + ' ' + user.lastName,
        user.avatar || 'https://i.pravatar.cc/150',
        0, // rating (à récupérer du profil)
        user.bio || '',
        applicationMessage,
        proposedRate ? parseInt(proposedRate) : undefined
      );

      // Créer une notification pour l'employeur
      await createJobNotification(
        job!.employerId,
        'new_application',
        jobId!,
        job!.title,
        user.id,
        user.firstName + ' ' + user.lastName,
        `${user.firstName} ${user.lastName} a postulé pour votre offre "${job!.title}"`
      );

      console.log('✅ Candidature soumise avec succès');
      setApplicationSuccess(true);
      setApplicationMessage('');
      setProposedRate('');
      setHasApplied(true);

      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/search');
      }, 2000);
    } catch (err) {
      console.error('❌ Erreur lors de la soumission de la candidature:', err);
      alert('Erreur lors de la soumission de la candidature');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <Card className="border-l-4 border-red-500">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
              <div>
                <h2 className="font-semibold">Erreur</h2>
                <p className="text-sm">{error || 'Offre non trouvée'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Retour
        </button>

        {/* Message de succès */}
        {applicationSuccess && (
          <Card className="mb-6 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <CheckCircle size={24} />
              <div>
                <h3 className="font-semibold">Candidature envoyée !</h3>
                <p className="text-sm">Redirection vers la recherche...</p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-2">
            {/* En-tête de l'offre */}
            <Card className="mb-6 border-l-4 border-green-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin size={18} />
                      <span>{job.location.city}, {job.location.district}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <DollarSign size={18} />
                      <span>{job.budget.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={18} />
                      <span>{job.duration} jours</span>
                    </div>
                  </div>
                </div>
                {job.urgent && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">
                    Urgent
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm">
                  {job.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.status === 'open'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {job.status === 'open' ? 'Ouvert' : 'Fermé'}
                </span>
              </div>
            </Card>

            {/* Description */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
            </Card>

            {/* Exigences */}
            {job.requirements && job.requirements.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Exigences</h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                      <span className="text-primary-500 mt-1">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Informations supplémentaires */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Informations</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date de début</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(job.startDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durée</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{job.duration} jours</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Candidats</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{job.applicants.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Publiée le</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Candidature */}
          <div>
            {user && user.role === 'worker' ? (
              <Card className="sticky top-4 border-l-4 border-primary-500">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Postuler</h3>

                {hasApplied ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      ✓ Vous avez déjà postulé pour cette offre
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        placeholder="Présentez-vous et expliquez pourquoi vous êtes intéressé..."
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary-500 focus:outline-none resize-none"
                        rows={4}
                        disabled={applying}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tarif proposé (FCFA) - Optionnel
                      </label>
                      <input
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder="Ex: 50000"
                        className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary-500 focus:outline-none"
                        disabled={applying}
                      />
                    </div>

                    <Button
                      onClick={handleApply}
                      disabled={applying || !applicationMessage.trim()}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      {applying ? 'Envoi...' : 'Postuler'}
                    </Button>
                  </form>
                )}
              </Card>
            ) : user && user.role === 'employer' ? (
              <Card className="sticky top-4 border-l-4 border-primary-500">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Votre offre</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Candidats</p>
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {job.applicants.length}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate(`/employer-dashboard?job=${jobId}`)}
                    className="w-full"
                  >
                    Voir les candidatures
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="sticky top-4 border-l-4 border-primary-500">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Connectez-vous pour postuler
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Se connecter
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
