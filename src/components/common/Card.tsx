import React, { useState, useEffect } from 'react';
import { getUserProfile, UserProfile } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { createApplication, hasWorkerApplied } from '../../services/applicationServiceComplete';
import { Send, X, FileText, DollarSign, MessageCircle, MapPin } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = false 
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-card p-4
        ${hoverable ? 'hover:shadow-card-hover transition-shadow duration-200 cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface JobCardProps {
  job: any;
  onClick?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onClick }) => {
  const { user } = useAuth();
  const [employerProfile, setEmployerProfile] = useState<UserProfile | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationLoading, setApplicationLoading] = useState(false);
  
  // États pour la modal de candidature
  const [applicationForm, setApplicationForm] = useState({
    message: '',
    proposedRate: ''
  });
  
  const categoryColors: Record<string, string> = {
    construction: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    agriculture: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    domestic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    restaurant: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    delivery: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    events: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    artisan: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
  };

  // Charger le profil de l'employeur
  useEffect(() => {
    const loadEmployerProfile = async () => {
      if (job.employerId) {
        try {
          const profile = await getUserProfile(job.employerId);
          setEmployerProfile(profile);
        } catch (error) {
          console.error('Erreur lors du chargement du profil employeur:', error);
        }
      }
    };

    loadEmployerProfile();
  }, [job.employerId]);

  // Vérifier si l'utilisateur a déjà postulé
  useEffect(() => {
    const checkApplication = async () => {
      if (user && user.role === 'worker' && job.id) {
        try {
          const applied = await hasWorkerApplied(job.id, user.id);
          setHasApplied(applied);
        } catch (error) {
          console.error('Erreur lors de la vérification de candidature:', error);
        }
      }
    };

    checkApplication();
  }, [user, job.id]);

  // Gérer la candidature
  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    
    if (!user || user.role !== 'worker') {
      alert('Vous devez être connecté en tant que travailleur pour postuler');
      return;
    }

    if (hasApplied) {
      alert('Vous avez déjà postulé pour cette offre');
      return;
    }

    setShowApplicationModal(true);
  };

  const submitApplication = async () => {
    if (!user || !applicationForm.message.trim()) {
      alert('Veuillez remplir le message de candidature');
      return;
    }

    try {
      setApplicationLoading(true);
      
      const workerProfile = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar,
        bio: (user as any).bio || '',
        rating: (user as any).rating || 0,
        totalJobs: (user as any).totalJobs || 0,
        skills: (user as any).skills || []
      };

      await createApplication(
        job.id,
        user.id,
        job.employerId,
        workerProfile,
        job.title,
        applicationForm.message,
        applicationForm.proposedRate ? Number(applicationForm.proposedRate) : undefined
      );

      setHasApplied(true);
      setShowApplicationModal(false);
      setApplicationForm({ message: '', proposedRate: '' });
      alert('Candidature envoyée avec succès !');
      
    } catch (error: any) {
      console.error('Erreur lors de la candidature:', error);
      alert(error.message || 'Erreur lors de l\'envoi de la candidature');
    } finally {
      setApplicationLoading(false);
    }
  };

  return (
    <Card hoverable onClick={onClick}>
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex-1 overflow-hidden break-words"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.3em',
                maxHeight: '2.6em'
              }}>
            {job.title}
          </h3>
          {job.urgent && (
            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-medium rounded-full whitespace-nowrap">
              Urgent
            </span>
          )}
        </div>

        {/* Category */}
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[job.category] || 'bg-gray-100 text-gray-800'}`}>
            {job.category}
          </span>
          {job.sponsored && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs font-medium rounded-full">
              ⭐ Sponsorisé
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm overflow-hidden break-words" 
           style={{
             display: '-webkit-box',
             WebkitLineClamp: 2,
             WebkitBoxOrient: 'vertical',
             lineHeight: '1.4em',
             maxHeight: '2.8em'
           }}>
          {job.description}
        </p>

        {/* Location & Budget */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <span>📍</span>
            <span>{job.location.district}, {job.location.city}</span>
          </div>
          <div className="font-semibold text-primary-600 dark:text-primary-400">
            {new Intl.NumberFormat('fr-FR').format(job.budget)} FCFA
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {employerProfile?.avatar ? (
              <img 
                src={employerProfile.avatar} 
                alt={employerProfile.firstName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 text-sm font-semibold">
                  {employerProfile ? 
                    employerProfile.firstName.charAt(0).toUpperCase() : 
                    job.title.charAt(0).toUpperCase()
                  }
                </span>
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {employerProfile ? 
                `${employerProfile.firstName} ${employerProfile.lastName}` : 
                'Employeur'
              }
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <span>👁️</span>
                {job.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <span>👥</span>
                {job.applicants?.length || 0}
              </span>
            </div>
            
            {/* Bouton Postuler pour les travailleurs */}
            {user && user.role === 'worker' && user.id !== job.employerId && (
              <button
                onClick={handleApply}
                disabled={hasApplied}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  hasApplied
                    ? 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {hasApplied ? 'Postulé' : 'Postuler'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de candidature */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Postuler pour cette offre
                </h3>
                <button
                  onClick={() => setShowApplicationModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Informations de l'offre */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {job.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  📍 {job.location.district}, {job.location.city}
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Budget: {new Intl.NumberFormat('fr-FR').format(job.budget)} FCFA
                </p>
              </div>

              {/* Message de candidature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Message de candidature *
                </label>
                <textarea
                  value={applicationForm.message}
                  onChange={(e) => setApplicationForm({...applicationForm, message: e.target.value})}
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour cette offre..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              {/* Tarif proposé (optionnel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign size={16} className="inline mr-1" />
                  Votre tarif proposé (FCFA) - Optionnel
                </label>
                <input
                  type="number"
                  value={applicationForm.proposedRate}
                  onChange={(e) => setApplicationForm({...applicationForm, proposedRate: e.target.value})}
                  placeholder="Ex: 50000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Vous pouvez proposer un tarif différent du budget affiché
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={submitApplication}
                disabled={applicationLoading || !applicationForm.message.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {applicationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer ma candidature
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

interface WorkerCardProps {
  worker: any;
  onClick?: () => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onClick }) => {
  const { user } = useAuth();

  const handleContactWorker = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    
    if (!user) {
      alert('Vous devez être connecté pour contacter ce travailleur');
      return;
    }

    try {
      console.log('Création/récupération de la conversation avec:', worker.id);
      
      // Importer le service de chat
      const { getOrCreateConversation } = await import('../../services/chatService');
      
      // Créer ou récupérer la conversation
      const conversationId = await getOrCreateConversation(
        user.id,
        worker.id,
        `${user.firstName} ${user.lastName}`,
        `${worker.firstName} ${worker.lastName}`,
        user.avatar,
        worker.avatar
      );
      
      console.log('Conversation créée/récupérée:', conversationId);
      
      // Rediriger vers le chat avec la conversation sélectionnée
      window.location.href = `/chat?conversation=${conversationId}`;
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert('Erreur lors de l\'ouverture de la conversation');
    }
  };

  return (
    <Card hoverable onClick={onClick}>
      <div className="flex flex-col gap-3">
        {/* Header avec avatar */}
        <div className="flex items-start gap-3">
          <img 
            src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.firstName + ' ' + worker.lastName)}&background=22c55e&color=ffffff&size=200&bold=true&rounded=true`} 
            alt={`${worker.firstName} ${worker.lastName}`}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {worker.firstName} {worker.lastName}
              </h3>
              {worker.verified && (
                <span className="text-blue-500" title="Profil vérifié">✓</span>
              )}
              {worker.premium && (
                <span className="text-yellow-500" title="Premium">⭐</span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {worker.category || 'Travailleur'}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.floor(worker.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                ★
              </span>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {(worker.rating || 0).toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({worker.completedJobs || 0} missions)
          </span>
        </div>

        {/* Skills */}
        {worker.skills && worker.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {worker.skills.slice(0, 3).map((skill: string, index: number) => (
              <span 
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
              >
                {skill}
              </span>
            ))}
            {worker.skills.length > 3 && (
              <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                +{worker.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {worker.bio && (
          <p className="text-sm text-gray-600 dark:text-gray-300 overflow-hidden break-words"
             style={{
               display: '-webkit-box',
               WebkitLineClamp: 2,
               WebkitBoxOrient: 'vertical',
               lineHeight: '1.4em',
               maxHeight: '2.8em'
             }}>
            {worker.bio}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <MapPin size={14} />
            <span>
              {worker.location?.city ? 
                `${worker.location.district ? worker.location.district + ', ' : ''}${worker.location.city}` : 
                'Localisation non renseignée'
              }
            </span>
          </div>
          
          {/* Bouton Écrire au travailleur */}
          {user && user.id !== worker.id && (
            <button
              onClick={handleContactWorker}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <MessageCircle size={14} />
              Écrire
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
