import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Job } from '../types';
import { getJobsByEmployer } from '../services/jobService';
import { getApplicationsByEmployer, Application } from '../services/applicationService';
import {
  Plus,
  Eye,
  MessageSquare,
  Users,
  Star,
  MapPin,
  DollarSign,
  Calendar,
  RefreshCw,
  Briefcase
} from 'lucide-react';

export const EmployerDashboardFixed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employerJobs, setEmployerJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les données de l'employeur
  useEffect(() => {
    if (user) {
      loadEmployerData();
    }
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
      
      // Charger toutes les candidatures reçues par l'employeur
      const employerApplications = await getApplicationsByEmployer(user.id);
      console.log('✅ Candidatures de l\'employeur chargées:', employerApplications.length);
      setApplications(employerApplications);
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données employeur:', error);
      setEmployerJobs([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEmployerData();
    setRefreshing(false);
  };

  // Calculer les statistiques
  const totalJobs = employerJobs.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-green-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-green-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Employeur
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez vos offres d'emploi et candidatures
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              onClick={() => navigate('/post-job')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Nouvelle Offre
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Mes Offres
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalJobs}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Candidatures
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalApplications}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  En Attente
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pendingApplications}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Acceptées
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {acceptedApplications}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </Card>
        </div>

        {/* Mes Offres */}
        <Card className="mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mes Offres d'Emploi
            </h2>
          </div>
          <div className="p-6">
            {employerJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vous n'avez pas encore publié d'offres d'emploi
                </p>
                <Button
                  onClick={() => navigate('/post-job')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Publier ma première offre
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {employerJobs.map((job) => {
                  const jobApplications = applications.filter(app => app.jobId === job.id);
                  return (
                    <div
                      key={job.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {typeof job.location === 'string' ? job.location : `${job.location.city}, ${job.location.district}`}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.budget} XAF
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {job.views || 0} vues
                            </div>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {jobApplications.length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            candidature{jobApplications.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* Candidatures Récentes */}
        <Card>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Candidatures Récentes
            </h2>
          </div>
          <div className="p-6">
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune candidature reçue pour le moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div
                    key={application.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            {application.workerProfile.firstName[0]}{application.workerProfile.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {application.workerProfile.firstName} {application.workerProfile.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Candidature pour: {application.jobTitle}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              {application.workerProfile.rating}/5
                            </div>
                            <span>{application.workerProfile.totalJobs} missions</span>
                            {application.proposedRate && (
                              <span>{application.proposedRate} XAF proposé</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                            {application.message}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {application.status === 'pending' ? 'En attente' :
                           application.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          // TODO: Implémenter l'acceptation de candidature
                          console.log('Accepter candidature:', application.id);
                        }}
                      >
                        Accepter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // TODO: Implémenter le rejet de candidature
                          console.log('Rejeter candidature:', application.id);
                        }}
                      >
                        Rejeter
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/messages?user=${application.workerId}`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployerDashboardFixed;
