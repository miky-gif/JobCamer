import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MapPin, Star, MessageCircle, Phone, Mail, Calendar, Award, Briefcase } from 'lucide-react';

interface WorkerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  category: string;
  bio: string;
  location: {
    city: string;
    district: string;
  };
  avatar: string;
  rating: number;
  verified: boolean;
  premium: boolean;
  createdAt: any;
  skills: string[];
  portfolio: string[];
  completedJobs: number;
  objective: string;
}

export const WorkerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkerProfile = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log('Chargement du profil travailleur:', id);
        
        const workerRef = doc(db, 'users', id);
        const workerDoc = await getDoc(workerRef);
        
        if (workerDoc.exists()) {
          const data = workerDoc.data();
          const workerData: WorkerData = {
            id: workerDoc.id,
            firstName: data.firstName || 'Utilisateur',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role,
            category: data.category || '',
            bio: data.bio || '',
            location: data.location || { city: '', district: '' },
            avatar: data.avatar || data.photoURL,
            rating: data.rating || 0,
            verified: data.verified || false,
            premium: data.premium || false,
            createdAt: data.createdAt,
            skills: data.skills || [],
            portfolio: data.portfolio || [],
            completedJobs: data.completedJobs || 0,
            objective: data.objective || ''
          };
          
          setWorker(workerData);
          console.log('Profil travailleur chargé:', workerData);
        } else {
          setError('Profil non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerProfile();
  }, [id]);

  const handleContactWorker = async () => {
    if (!user || !worker) {
      alert('Vous devez être connecté pour contacter ce travailleur');
      return;
    }

    try {
      console.log('Création/récupération de la conversation avec:', worker.id);
      
      // Importer le service de chat
      const { getOrCreateConversation } = await import('../services/chatService');
      
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
      navigate(`/chat?conversation=${conversationId}`);
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      alert('Erreur lors de l\'ouverture de la conversation');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profil non trouvé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Ce profil n\'existe pas ou a été supprimé.'}
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
          >
            Retour à la recherche
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.firstName + ' ' + worker.lastName)}&background=22c55e&color=ffffff&size=200&bold=true&rounded=true`}
                alt={`${worker.firstName} ${worker.lastName}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-100 dark:border-green-900"
              />
            </div>
            
            {/* Informations principales */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {worker.firstName} {worker.lastName}
                </h1>
                {worker.verified && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                    <Award size={14} />
                    Vérifié
                  </div>
                )}
                {worker.premium && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                    <Star size={14} />
                    Premium
                  </div>
                )}
              </div>
              
              <p className="text-xl text-green-600 dark:text-green-400 font-semibold mb-3">
                {worker.category || 'Travailleur'}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(worker.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {worker.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  ({worker.completedJobs} missions réalisées)
                </span>
              </div>
              
              {/* Localisation */}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                <MapPin size={18} />
                <span>
                  {worker.location?.city ? 
                    `${worker.location.district ? worker.location.district + ', ' : ''}${worker.location.city}` : 
                    'Localisation non renseignée'
                  }
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                {user && user.id !== worker.id && (
                  <>
                    <button
                      onClick={handleContactWorker}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      <MessageCircle size={18} />
                      Contacter
                    </button>
                    {worker.phone && (
                      <button
                        onClick={() => window.open(`tel:${worker.phone}`)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <Phone size={18} />
                        Appeler
                      </button>
                    )}
                  </>
                )}
                
                {/* Message d'encouragement pour les travailleurs */}
                {user && user.role === 'worker' && user.id !== worker.id && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      💡 Contactez ce travailleur pour échanger des conseils, collaborer ou demander de l'aide !
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-6">
            {/* À propos */}
            {worker.bio && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  À propos
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {worker.bio}
                </p>
              </div>
            )}

            {/* Objectif */}
            {worker.objective && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Objectif professionnel
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {worker.objective}
                </p>
              </div>
            )}

            {/* Portfolio */}
            {worker.portfolio && worker.portfolio.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {worker.portfolio.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Travail ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compétences */}
            {worker.skills && worker.skills.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Compétences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informations */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Informations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>
                    Membre depuis {worker.createdAt ? 
                      new Date(worker.createdAt.seconds * 1000).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long' 
                      }) : 
                      'Récemment'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Briefcase size={16} />
                  <span>{worker.completedJobs} missions réalisées</span>
                </div>
                {worker.email && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail size={16} />
                    <span className="truncate">{worker.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
