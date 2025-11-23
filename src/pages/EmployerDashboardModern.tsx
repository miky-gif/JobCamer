import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getJobsByEmployer, 
  updateJob, 
  deleteJob, 
  updateJobStatus 
} from '../services/jobServiceComplete';
import { 
  getApplicationsByJob, 
  updateApplicationStatus, 
  markApplicationAsViewed,
  Application as ServiceApplication 
} from '../services/applicationServiceComplete';
import { Job, JobCategory, JobStatus } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  UserCheck,
  UserX,
  MessageSquare
} from 'lucide-react';

// Utiliser directement le type Application de types/index.ts

export const EmployerDashboardModern: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<{[jobId: string]: ServiceApplication[]}>({});
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // États pour les candidatures
  const [selectedApplication, setSelectedApplication] = useState<ServiceApplication | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJobApplications, setSelectedJobApplications] = useState<ServiceApplication[]>([]);

  // États pour l'édition
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    budget: 0,
    location: { city: '', district: '' },
    category: 'construction' as JobCategory,
    urgent: false
  });

  useEffect(() => {
    loadEmployerData();
  }, [user]);

  const loadEmployerData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      console.log('📝 Chargement des données employeur pour:', user.id);
      
      // Charger les offres
      const employerJobs = await getJobsByEmployer(user.id);
      setJobs(employerJobs);
      
      // Charger les candidatures pour chaque offre
      const applicationsData: {[jobId: string]: ServiceApplication[]} = {};
      for (const job of employerJobs) {
        try {
          const jobApplications = await getApplicationsByJob(job.id);
          applicationsData[job.id] = jobApplications;
        } catch (error) {
          console.error(`Erreur candidatures pour ${job.id}:`, error);
          applicationsData[job.id] = [];
        }
      }
      setApplications(applicationsData);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      budget: job.budget,
      location: job.location,
      category: job.category,
      urgent: job.urgent || false
    });
    setShowEditModal(true);
  };

  const handleDeleteJob = (job: Job) => {
    setSelectedJob(job);
    setShowDeleteModal(true);
  };

  const confirmEdit = async () => {
    if (!selectedJob) return;
    
    try {
      setActionLoading(true);
      await updateJob(selectedJob.id, editForm);
      await loadEmployerData(); // Recharger les données
      setShowEditModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      alert('Erreur lors de la modification de l\'offre');
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedJob) return;
    
    try {
      setActionLoading(true);
      await deleteJob(selectedJob.id);
      await loadEmployerData(); // Recharger les données
      setShowDeleteModal(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'offre');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleJobStatus = async (job: Job) => {
    try {
      const newStatus: JobStatus = job.status === 'open' ? 'cancelled' : 'open';
      await updateJobStatus(job.id, newStatus);
      await loadEmployerData();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  // Fonctions pour gérer les candidatures
  const viewJobApplications = (job: Job) => {
    const jobApplications = applications[job.id] || [];
    setSelectedJobApplications(jobApplications);
    setSelectedJob(job);
    setShowApplicationsModal(true);
  };

  const viewApplicationDetails = async (application: ServiceApplication) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
    
    // Marquer comme vue si pas encore vue
    if (!application.viewedByEmployer) {
      try {
        await markApplicationAsViewed(application.id);
        await loadEmployerData(); // Recharger pour mettre à jour le statut
      } catch (error) {
        console.error('Erreur lors du marquage:', error);
      }
    }
  };

  const handleApplicationAction = async (applicationId: string, status: 'accepted' | 'rejected', response?: string) => {
    try {
      setActionLoading(true);
      await updateApplicationStatus(applicationId, status, response);
      await loadEmployerData(); // Recharger les données
      setShowApplicationModal(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour de la candidature');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculs des statistiques
  const totalJobs = jobs.length;
  const openJobs = jobs.filter(job => job.status === 'open').length;
  const totalApplications = Object.values(applications).flat().length;
  const pendingApplications = Object.values(applications).flat()
    .filter(app => app.status === 'pending').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tableau de Bord Employeur
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gérez vos offres d'emploi et candidatures
              </p>
            </div>
            <button
              onClick={() => navigate('/post-job')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Plus size={20} />
              Nouvelle Offre
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Offres</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalJobs}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Offres Ouvertes</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{openJobs}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Candidatures</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalApplications}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingApplications}</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des offres */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mes Offres d'Emploi
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Aucune offre publiée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Commencez par publier votre première offre d'emploi
              </p>
              <button
                onClick={() => navigate('/post-job')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 mx-auto"
              >
                <Plus size={20} />
                Publier une offre
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {jobs.map((job) => (
                <div key={job.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          job.status === 'open' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {job.status === 'open' ? 'Ouverte' : 'Fermée'}
                        </span>
                        {job.urgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{job.location.district}, {job.location.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          <span>{new Intl.NumberFormat('fr-FR').format(job.budget)} FCFA</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={16} />
                          <span>{job.views || 0} vues</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{applications[job.id]?.length || 0} candidatures</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={16} />
                          <span>{new Date(job.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => viewJobApplications(job)}
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors relative"
                        title="Voir les candidatures"
                      >
                        <Users size={18} />
                        {applications[job.id]?.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {applications[job.id].length}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`p-2 rounded-lg transition-colors ${
                          job.status === 'open'
                            ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                        }`}
                        title={job.status === 'open' ? 'Fermer l\'offre' : 'Rouvrir l\'offre'}
                      >
                        {job.status === 'open' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                      
                      <button
                        onClick={() => handleEditJob(job)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Modifier l'offre"
                      >
                        <Edit3 size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteJob(job)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Supprimer l'offre"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal d'édition */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Modifier l'offre
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Titre de l'offre
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Budget (FCFA)
                  </label>
                  <input
                    type="number"
                    value={editForm.budget}
                    onChange={(e) => setEditForm({...editForm, budget: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value as JobCategory})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="construction">Construction</option>
                    <option value="agriculture">Agriculture</option>
                    <option value="domestic">Domestique</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="delivery">Livraison</option>
                    <option value="events">Événements</option>
                    <option value="artisan">Artisan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editForm.location.city}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      location: {...editForm.location, city: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quartier
                  </label>
                  <input
                    type="text"
                    value={editForm.location.district}
                    onChange={(e) => setEditForm({
                      ...editForm, 
                      location: {...editForm.location, district: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={editForm.urgent}
                  onChange={(e) => setEditForm({...editForm, urgent: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="urgent" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Offre urgente
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmEdit}
                disabled={actionLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Modification...' : 'Modifier'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal liste des candidatures pour une offre */}
      {showApplicationsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Candidatures pour "{selectedJob.title}"
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedJobApplications.length} candidat{selectedJobApplications.length > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowApplicationsModal(false)}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Fermer
              </button>
            </div>

            <div className="p-6 space-y-4">
              {selectedJobApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  Aucune candidature pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedJobApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-start justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors cursor-pointer"
                      onClick={() => viewApplicationDetails(app)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-lg overflow-hidden">
                          {app.workerProfile.avatar ? (
                            <img
                              src={app.workerProfile.avatar}
                              alt={app.workerProfile.firstName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <span>
                              {app.workerProfile.firstName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {app.workerProfile.firstName} {app.workerProfile.lastName}
                            </p>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                              {app.status === 'pending' && 'En attente'}
                              {app.status === 'accepted' && 'Acceptée'}
                              {app.status === 'rejected' && 'Rejetée'}
                              {app.status === 'withdrawn' && 'Retirée'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {app.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              Proposé : {app.proposedRate ? new Intl.NumberFormat('fr-FR').format(app.proposedRate) : new Intl.NumberFormat('fr-FR').format(selectedJob.budget)} FCFA
                            </span>
                            <span>
                              Note : {app.workerProfile.rating?.toFixed(1) || 'N/A'} ⭐
                            </span>
                            <span>
                              Jobs : {app.workerProfile.totalJobs}
                            </span>
                            <span>
                              Reçu le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            viewApplicationDetails(app);
                          }}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60"
                        >
                          Détails
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleApplicationAction(app.id, 'accepted');
                              }}
                              className="px-3 py-1 text-xs bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/60"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleApplicationAction(app.id, 'rejected');
                              }}
                              className="px-3 py-1 text-xs bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal détail d'une candidature */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Détail de la candidature
              </h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Fermer
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-lg overflow-hidden">
                  {selectedApplication.workerProfile.avatar ? (
                    <img
                      src={selectedApplication.workerProfile.avatar}
                      alt={selectedApplication.workerProfile.firstName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {selectedApplication.workerProfile.firstName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedApplication.workerProfile.firstName} {selectedApplication.workerProfile.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedApplication.workerProfile.email} • {selectedApplication.workerProfile.phone}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Note : {selectedApplication.workerProfile.rating?.toFixed(1) || 'N/A'} ⭐ • Jobs : {selectedApplication.workerProfile.totalJobs}
                  </p>
                </div>
              </div>

              {selectedApplication.workerProfile.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    À propos du candidat
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedApplication.workerProfile.bio}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Message de motivation
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {selectedApplication.message}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Offre : {selectedApplication.jobTitle}
                </span>
                <span>
                  Tarif proposé : {selectedApplication.proposedRate ? new Intl.NumberFormat('fr-FR').format(selectedApplication.proposedRate) : 'Non précisé'} FCFA
                </span>
                <span>
                  Reçue le {new Date(selectedApplication.createdAt).toLocaleDateString('fr-FR')}
                </span>
                <span>
                  Statut : {selectedApplication.status === 'pending' && 'En attente'}
                  {selectedApplication.status === 'accepted' && 'Acceptée'}
                  {selectedApplication.status === 'rejected' && 'Rejetée'}
                  {selectedApplication.status === 'withdrawn' && 'Retirée'}
                </span>
              </div>

              {selectedApplication.status === 'pending' && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleApplicationAction(selectedApplication.id, 'rejected')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/60 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                  <button
                    onClick={() => handleApplicationAction(selectedApplication.id, 'accepted')}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    Accepter la candidature
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Supprimer l'offre
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer l'offre "{selectedJob.title}" ? 
                Cette action est irréversible et supprimera également toutes les candidatures associées.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={actionLoading}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
