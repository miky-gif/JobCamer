import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Plus,
  Eye,
  MessageSquare,
  Users,
  Search,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Clock,
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

interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  workerRating: number;
  workerBio: string;
  message: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

type ViewMode = 'list' | 'detail' | 'applicants' | 'chat';

export const EmployerDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed' | 'completed'>('all');
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; sender: string; text: string; timestamp: Date }>>([]);
  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les offres de l'employeur
  useEffect(() => {
    const loadEmployerJobs = async () => {
      try {
        if (!user) {
          console.log('⚠️ Utilisateur non connecté');
          setLoading(false);
          return;
        }

        console.log('📝 Chargement des offres de l\'employeur...');
        const { getJobsByEmployer } = await import('../services/jobService');
        const jobs = await getJobsByEmployer(user.id);

        console.log('✅ Offres chargées:', jobs.length);
        setEmployerJobs(jobs as unknown as Job[]);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des offres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmployerJobs();
  }, [user]);

  // Charger les candidatures quand une offre est sélectionnée
  useEffect(() => {
    const loadApplications = async () => {
      if (!selectedJob) return;

      try {
        console.log('📝 Chargement des candidatures pour l\'offre:', selectedJob.id);
        const { getApplicationsByJob } = await import('../services/applicationService');
        const applications = await getApplicationsByJob(selectedJob.id);

        console.log('✅ Candidatures chargées:', applications.length);
        setJobApplications(applications);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des candidatures:', error);
      }
    };

    loadApplications();
  }, [selectedJob]);

  // Filtrer les offres
  const filteredJobs = employerJobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Gérer l'approbation d'une candidature
  const handleApproveApplication = async (applicationId: string) => {
    try {
      console.log('📝 Approbation de la candidature:', applicationId);
      const { updateApplicationStatus } = await import('../services/applicationService');
      await updateApplicationStatus(applicationId, 'accepted');

      // Mettre à jour la liste
      setJobApplications(
        jobApplications.map((app) =>
          app.id === applicationId ? { ...app, status: 'accepted' } : app
        )
      );

      console.log('✅ Candidature approuvée');
    } catch (error) {
      console.error('❌ Erreur lors de l\'approbation:', error);
      alert('Erreur lors de l\'approbation');
    }
  };

  // Gérer le rejet d'une candidature
  const handleRejectApplication = async (applicationId: string) => {
    try {
      console.log('📝 Rejet de la candidature:', applicationId);
      const { updateApplicationStatus } = await import('../services/applicationService');
      await updateApplicationStatus(applicationId, 'rejected');

      // Mettre à jour la liste
      setJobApplications(
        jobApplications.map((app) =>
          app.id === applicationId ? { ...app, status: 'rejected' } : app
        )
      );

      console.log('✅ Candidature rejetée');
    } catch (error) {
      console.error('❌ Erreur lors du rejet:', error);
      alert('Erreur lors du rejet');
    }
  };

  // Envoyer un message
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: 'employer',
      text: chatMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setChatMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  // Vue Liste
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Offres</h1>
            <Button onClick={() => navigate('/post-job')} className="flex items-center gap-2">
              <Plus size={20} />
              Nouvelle offre
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Offres Actives</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {employerJobs.filter((j) => j.status === 'open').length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Candidatures</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {employerJobs.reduce((sum, j) => sum + j.applicants.length, 0)}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">En Cours</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {employerJobs.filter((j) => j.status === 'in_progress').length}
                </p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Complétées</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {employerJobs.filter((j) => j.status === 'completed').length}
                </p>
              </div>
            </Card>
          </div>

          {/* Recherche et filtres */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary-500 focus:outline-none"
              >
                <option value="all">Tous les statuts</option>
                <option value="open">Ouvertes</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Complétées</option>
              </select>
            </div>
          </Card>

          {/* Liste des offres */}
          {filteredJobs.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Aucune offre trouvée</p>
              <Button onClick={() => navigate('/post-job')}>Créer une offre</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          {job.location.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          {job.budget.toLocaleString()} FCFA
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          {job.duration} jours
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          {job.applicants.length} candidat{job.applicants.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'open'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {job.status === 'open' ? 'Ouvert' : job.status === 'in_progress' ? 'En cours' : 'Complété'}
                        </span>
                        {job.urgent && (
                          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-xs font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setViewMode('applicants');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir les candidatures"
                      >
                        <Users size={20} className="text-primary-600 dark:text-primary-400" />
                      </button>
                      <button
                        onClick={() => navigate(`/job/${job.id}`)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Voir l'offre"
                      >
                        <Eye size={20} className="text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue Candidatures
  if (viewMode === 'applicants' && selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* En-tête */}
          <button
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedJob.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {jobApplications.length} candidat{jobApplications.length > 1 ? 's' : ''}
          </p>

          {/* Liste des candidatures */}
          {jobApplications.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Aucune candidature pour le moment</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobApplications.map((app) => (
                <Card key={app.id} className="border-l-4 border-primary-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={app.workerAvatar}
                          alt={app.workerName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{app.workerName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Star size={14} className="text-yellow-500" />
                            <span>{app.workerRating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{app.message}</p>
                      {app.proposedRate && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Tarif proposé: <span className="font-semibold">{app.proposedRate.toLocaleString()} FCFA</span>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {app.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleApproveApplication(app.id)}
                            className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                            title="Approuver"
                          >
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app.id)}
                            className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            title="Rejeter"
                          >
                            <XCircle size={20} className="text-red-600 dark:text-red-400" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          app.status === 'accepted'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {app.status === 'accepted' ? 'Approuvé' : 'Rejeté'}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedApplicant(app);
                          setViewMode('chat');
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Envoyer un message"
                      >
                        <MessageSquare size={20} className="text-primary-600 dark:text-primary-400" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue Chat
  if (viewMode === 'chat' && selectedApplicant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-red-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* En-tête */}
          <button
            onClick={() => setViewMode('applicants')}
            className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} />
            Retour
          </button>

          <Card className="mb-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-4">
              <img
                src={selectedApplicant.workerAvatar}
                alt={selectedApplicant.workerName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedApplicant.workerName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{selectedApplicant.workerBio}</p>
              </div>
            </div>
          </Card>

          {/* Messages */}
          <Card className="mb-6 h-96 overflow-y-auto">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  Aucun message pour le moment
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'employer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'employer'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Formulaire d'envoi */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Entrez votre message..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-primary-500 focus:outline-none"
            />
            <Button onClick={handleSendMessage} className="flex items-center gap-2">
              <Send size={18} />
              Envoyer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
