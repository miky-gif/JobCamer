import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Job } from '../types';
import { getJobsByEmployer } from '../services/jobService';
import { getApplicationsByJob, getApplicationsByEmployer } from '../services/applicationService';
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
  RefreshCw
} from 'lucide-react';

interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerProfile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar?: string;
    bio?: string;
    rating: number;
    totalJobs: number;
    skills?: string[];
  };
  jobTitle: string;
  message: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected';
  viewedByEmployer: boolean;
  createdAt: Date;
}

type ViewMode = 'list' | 'detail' | 'applicants' | 'chat';

export const EmployerDashboard: React.FC = () => {
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
  const [jobApplications, setJobApplications] = useState<{[jobId: string]: Application[]}>({});
  const [loading, setLoading] = useState(true);

  // Charger les offres de l'employeur depuis Firebase
  useEffect(() => {
    loadEmployerData();
  }, [user]);

  const loadEmployerData = async () => {
    try {
      if (!user) {
        console.log('⚠️ Utilisateur non connecté');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('📝 Chargement des données employeur pour:', user.id);
      
      // Charger les offres de l'employeur
      const jobs = await getJobsByEmployer(user.id);
      console.log('✅ Offres de l\'employeur chargées:', jobs.length);
      setEmployerJobs(jobs);
      
      // Charger les candidatures pour chaque offre
      const applicationsData: {[jobId: string]: Application[]} = {};
      for (const job of jobs) {
        try {
          const applications = await getApplicationsByJob(job.id);
          applicationsData[job.id] = applications;
          console.log(`✅ Candidatures chargées pour ${job.title}:`, applications.length);
        } catch (error) {
          console.error(`❌ Erreur candidatures pour ${job.id}:`, error);
          applicationsData[job.id] = [];
        }
      }
      setJobApplications(applicationsData);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données employeur:', error);
      setEmployerJobs([]);
      setJobApplications({});
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    loadEmployerData();
  };

  // Fonction pour obtenir les candidatures d'une offre
  const getJobApplicationsCount = (jobId: string): number => {
    return jobApplications[jobId]?.length || 0;
  };

  const getJobApplications = (jobId: string): Application[] => {
    return jobApplications[jobId] || [];
  };

  // Ancienne mock data (supprimée)
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Maçon pour construction villa',
      description: 'Nous cherchons un maçon expérimenté pour construire une villa de 3 chambres',
      category: 'construction',
      location: { city: 'Yaoundé', district: 'Bastos' },
      budget: 500000,
      duration: 30,
      startDate: new Date('2024-11-20'),
      status: 'open',
      views: 245,
      urgent: true,
      applicants: [
        {
          id: 'a1',
          workerId: 'w1',
          name: 'Jean Kamga',
          avatar: 'https://i.pravatar.cc/150?img=1',
          rating: 4.8,
          totalJobs: 12,
          bio: 'Maçon expérimenté avec 10 ans d\'expérience',
          status: 'pending',
          appliedAt: new Date('2024-11-15')
        },
        {
          id: 'a2',
          workerId: 'w2',
          name: 'Pierre Nkomo',
          avatar: 'https://i.pravatar.cc/150?img=2',
          rating: 4.5,
          totalJobs: 8,
          bio: 'Spécialisé en construction résidentielle',
          status: 'pending',
          appliedAt: new Date('2024-11-14')
        }
      ],
      createdAt: new Date('2024-11-10')
    },
    {
      id: '2',
      title: 'Électricien pour installation',
      description: 'Installation électrique complète pour immeuble de 5 étages',
      category: 'electricite',
      location: { city: 'Douala', district: 'Akwa' },
      budget: 300000,
      duration: 15,
      startDate: new Date('2024-11-25'),
      status: 'open',
      views: 156,
      applicants: [
        {
          id: 'a3',
          workerId: 'w3',
          name: 'Paul Talla',
          avatar: 'https://i.pravatar.cc/150?img=3',
          rating: 4.9,
          totalJobs: 20,
          bio: 'Électricien certifié avec normes internationales',
          status: 'accepted',
          appliedAt: new Date('2024-11-13')
        }
      ],
      createdAt: new Date('2024-11-08')
    }
  ];

  const filteredJobs = employerJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setViewMode('detail');
  };

  const handleViewApplicants = (job: Job) => {
    setSelectedJob(job);
    setViewMode('applicants');
  };

  const handleChat = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setViewMode('chat');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          sender: 'employer',
          text: chatMessage,
          timestamp: new Date()
        }
      ]);
      setChatMessage('');
    }
  };

  // Vue Liste
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mes Offres d'Emploi</h1>
              <p className="text-gray-600 dark:text-gray-400">Gérez vos offres et candidatures</p>
            </div>
            <Button onClick={() => navigate('/post-job')} icon={<Plus size={20} />} size="lg">
              Nouvelle Offre
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Offres Actives</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredJobs.filter(j => j.status === 'open').length}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Candidatures</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredJobs.reduce((acc, job) => acc + job.applicants.length, 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Vues Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredJobs.reduce((acc, job) => acc + job.views, 0)}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Complétées</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredJobs.filter(j => j.status === 'completed').length}</p>
            </Card>
          </div>

          <Card className="mb-6 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                {(['all', 'open', 'closed', 'completed'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterStatus === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {status === 'all' ? 'Tous' : status === 'open' ? 'Actives' : status === 'closed' ? 'Fermées' : 'Complétées'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{job.title}</h3>
                      {job.urgent && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded">URGENT</span>}
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        job.status === 'open' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {job.status === 'open' ? 'Actif' : 'Fermé'}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1"><MapPin size={16} />{job.location.city}</div>
                      <div className="flex items-center gap-1"><DollarSign size={16} />{job.budget.toLocaleString()} FCFA</div>
                      <div className="flex items-center gap-1"><Calendar size={16} />{job.duration} jours</div>
                      <div className="flex items-center gap-1"><Eye size={16} />{job.views} vues</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewApplicants(job)} icon={<Users size={16} />} fullWidth>
                      {job.applicants.length} Candidats
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleViewJob(job)} icon={<Eye size={16} />} fullWidth>
                      Détails
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vue Candidatures
  if (viewMode === 'applicants' && selectedJob) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6 hover:underline">
            <ArrowLeft size={20} /> Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Candidatures pour "{selectedJob.title}"</h1>
          <div className="space-y-4">
            {selectedJob.applicants.map(applicant => (
              <Card key={applicant.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <img src={applicant.avatar} alt={applicant.name} className="w-16 h-16 rounded-full object-cover" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{applicant.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < Math.floor(applicant.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{applicant.rating} ({applicant.totalJobs} missions)</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{applicant.bio}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${
                      applicant.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700' : 'bg-green-100 dark:bg-green-900/30 text-green-700'
                    }`}>
                      {applicant.status === 'pending' ? 'En attente' : 'Accepté'}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => handleChat(applicant)} icon={<MessageSquare size={16} />} fullWidth>
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vue Chat
  if (viewMode === 'chat' && selectedJob && selectedApplicant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => setViewMode('applicants')} className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-6 hover:underline">
            <ArrowLeft size={20} /> Retour
          </button>
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-4">
              <img src={selectedApplicant.avatar} alt={selectedApplicant.name} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedApplicant.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Pour: {selectedJob.title}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 h-96 flex flex-col mb-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'employer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'employer' ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
              />
              <Button onClick={handleSendMessage} icon={<Send size={18} />} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};
