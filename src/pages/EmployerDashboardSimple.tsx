import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Job } from '../types';
import { getJobsByEmployer } from '../services/jobService';
import { getApplicationsByJob } from '../services/applicationService';
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
  RefreshCw,
  Loader
} from 'lucide-react';

interface ApplicationData {
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
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  viewedByEmployer: boolean;
  createdAt: Date;
}

export const EmployerDashboardSimple: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [jobApplications, setJobApplications] = useState<{[jobId: string]: ApplicationData[]}>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'cancelled'>('all');

  // Charger les données de l'employeur
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
      const applicationsData: {[jobId: string]: ApplicationData[]} = {};
      for (const job of jobs) {
        try {
          const applications = await getApplicationsByJob(job.id);
          applicationsData[job.id] = applications as ApplicationData[];
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

  // Filtrer les offres
  const filteredJobs = employerJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Formater le budget
  const formatBudget = (budget: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(budget);
  };

  // Formater la date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-yellow-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-red-600 to-yellow-500 rounded-lg p-6 mb-8 text-white border-l-4 border-green-600 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tableau de Bord Employeur</h1>
              <p className="text-green-100">Gérez vos offres d'emploi et candidatures</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleRefresh}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
              <Button
                onClick={() => navigate('/post-job')}
                className="bg-white text-green-600 hover:bg-green-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Offre
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-green-600">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Offres</p>
                <p className="text-2xl font-bold text-gray-900">{employerJobs.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-600">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offres Ouvertes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employerJobs.filter(job => job.status === 'open').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-600">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Candidatures</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(jobApplications).reduce((total, apps) => total + apps.length, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-red-600">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <Star className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vues Totales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {employerJobs.reduce((total, job) => total + (job.views || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher une offre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="open">Ouvertes</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminées</option>
              <option value="cancelled">Annulées</option>
            </select>
          </div>
        </Card>

        {/* Liste des offres */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-gray-600 mb-6">
              {employerJobs.length === 0 
                ? "Vous n'avez pas encore publié d'offres d'emploi."
                : "Aucune offre ne correspond à vos critères de recherche."
              }
            </p>
            <Button
              onClick={() => navigate('/post-job')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Publier une offre
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-green-600">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'open' 
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800'
                        : job.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {job.status === 'open' ? 'Ouverte' :
                       job.status === 'in_progress' ? 'En cours' :
                       job.status === 'completed' ? 'Terminée' : 'Annulée'}
                    </span>
                    {job.urgent && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {job.location.city}, {job.location.district}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatBudget(job.budget)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {job.duration} jours
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {job.views || 0} vues
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Créée le {formatDate(job.createdAt)}</span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {getJobApplicationsCount(job.id)} candidature{getJobApplicationsCount(job.id) !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/job/${job.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    {getJobApplicationsCount(job.id) > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/employer-dashboard/applications/${job.id}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Candidatures ({getJobApplicationsCount(job.id)})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
