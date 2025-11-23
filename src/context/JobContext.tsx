import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Job, Application, SearchFilters } from '../types';
import { calculateDistance } from '../utils/helpers';
import { getAllJobs, createJob as createJobFirebase } from '../services/jobService';

interface JobState {
  jobs: Job[];
  filteredJobs: Job[];
  selectedJob: Job | null;
  myApplications: Application[];
  filters: SearchFilters;
  loading: boolean;
}

type JobAction =
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'SET_FILTERED_JOBS'; payload: Job[] }
  | { type: 'SET_SELECTED_JOB'; payload: Job | null }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: Job }
  | { type: 'SET_FILTERS'; payload: SearchFilters }
  | { type: 'ADD_APPLICATION'; payload: Application }
  | { type: 'SET_LOADING'; payload: boolean };

interface JobContextType extends JobState {
  searchJobs: (filters: SearchFilters) => void;
  getJobById: (id: string) => Job | undefined;
  createJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applicants'>) => Promise<void>;
  applyToJob: (jobId: string, workerId: string, message: string, proposedRate: number) => Promise<void>;
  updateFilters: (filters: SearchFilters) => void;
  refreshJobs: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const jobReducer = (state: JobState, action: JobAction): JobState => {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, loading: false };
    case 'SET_FILTERED_JOBS':
      return { ...state, filteredJobs: action.payload };
    case 'SET_SELECTED_JOB':
      return { ...state, selectedJob: action.payload };
    case 'ADD_JOB':
      return { ...state, jobs: [action.payload, ...state.jobs] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job => job.id === action.payload.id ? action.payload : job)
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'ADD_APPLICATION':
      return { ...state, myApplications: [...state.myApplications, action.payload] };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(jobReducer, {
    jobs: [],
    filteredJobs: [],
    selectedJob: null,
    myApplications: [],
    filters: {},
    loading: true
  });

  useEffect(() => {
    // Charger les jobs depuis Firebase au démarrage
    const loadJobs = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        console.log('📝 Chargement des jobs depuis Firebase...');
        const firebaseJobs = await getAllJobs();
        
        console.log('✅ Jobs chargés depuis Firebase:', firebaseJobs.length);
        // Toujours utiliser les données Firebase (même si vide)
        dispatch({ type: 'SET_JOBS', payload: firebaseJobs });
        dispatch({ type: 'SET_FILTERED_JOBS', payload: firebaseJobs });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des jobs:', error);
        // En cas d'erreur, utiliser un tableau vide
        dispatch({ type: 'SET_JOBS', payload: [] });
        dispatch({ type: 'SET_FILTERED_JOBS', payload: [] });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadJobs();
  }, []);

  const searchJobs = (filters: SearchFilters) => {
    let filtered = [...state.jobs];

    // Filtrer par catégorie
    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category);
    }

    // Filtrer par budget
    if (filters.minBudget) {
      filtered = filtered.filter(job => job.budget >= filters.minBudget!);
    }
    if (filters.maxBudget) {
      filtered = filtered.filter(job => job.budget <= filters.maxBudget!);
    }

    // Filtrer par localisation
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
        job.location.district.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Filtrer par rayon (si géolocalisation disponible)
    if (filters.radius && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;
        
        filtered = filtered.filter(job => {
          if (job.location.latitude && job.location.longitude) {
            const distance = calculateDistance(
              userLat,
              userLon,
              job.location.latitude,
              job.location.longitude
            );
            return distance <= filters.radius!;
          }
          return true; // Inclure les jobs sans coordonnées
        });
        
        dispatch({ type: 'SET_FILTERED_JOBS', payload: filtered });
      });
    } else {
      dispatch({ type: 'SET_FILTERED_JOBS', payload: filtered });
    }

    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const getJobById = (id: string): Job | undefined => {
    return state.jobs.find(job => job.id === id);
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applicants'>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Créer le job dans Firebase
      const jobId = await createJobFirebase(jobData);
      
      // Créer l'objet job local
      const newJob: Job = {
        ...jobData,
        id: jobId,
        createdAt: new Date(),
        updatedAt: new Date(),
        applicants: [],
        views: 0,
        status: jobData.status || 'open'
      };
      
      dispatch({ type: 'ADD_JOB', payload: newJob });
      console.log('✅ Offre créée avec succès:', jobId);
      
      // Recharger tous les jobs pour avoir les données à jour
      const updatedJobs = await getAllJobs();
      dispatch({ type: 'SET_JOBS', payload: updatedJobs });
      dispatch({ type: 'SET_FILTERED_JOBS', payload: updatedJobs });
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'offre:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const applyToJob = async (jobId: string, workerId: string, message: string, proposedRate: number) => {
    try {
      const job = state.jobs.find(j => j.id === jobId);
      if (!job) {
        throw new Error('Offre non trouvée');
      }

      if (job.applicants.includes(workerId)) {
        throw new Error('Vous avez déjà postulé pour cette offre');
      }

      console.log('📝 Création de la candidature...');

      // Importer le service d'applications
      const { createApplication } = await import('../services/applicationService');
      const { getUserProfile } = await import('../services/userService');

      // Récupérer le profil du travailleur
      const workerProfile = await getUserProfile(workerId);
      if (!workerProfile) {
        throw new Error('Profil du travailleur non trouvé');
      }

      // Créer la candidature dans Firebase
      const applicationId = await createApplication(
        jobId,
        workerId,
        job.employerId,
        {
          firstName: workerProfile.firstName,
          lastName: workerProfile.lastName,
          email: workerProfile.email,
          phone: workerProfile.phone || '',
          avatar: workerProfile.avatar,
          bio: (workerProfile as any).bio || '',
          rating: workerProfile.rating || 0,
          totalJobs: (workerProfile as any).completedJobs || 0,
          skills: (workerProfile as any).skills || [],
        },
        job.title,
        message,
        proposedRate
      );

      console.log('✅ Candidature créée avec ID:', applicationId);

      // Mettre à jour l'état local
      const updatedJob = {
        ...job,
        applicants: [...job.applicants, workerId]
      };
      dispatch({ type: 'UPDATE_JOB', payload: updatedJob });

      // Créer l'objet application local
      const application: Application = {
        id: applicationId,
        jobId,
        workerId,
        worker: workerProfile as any,
        message,
        proposedRate,
        status: 'pending',
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_APPLICATION', payload: application });

      // Recharger les jobs pour avoir les données à jour
      await refreshJobs();

      // Forcer la mise à jour de l'état local pour que le bouton change immédiatement
      const updatedJobs = state.jobs.map(j => 
        j.id === jobId ? { ...j, applicants: [...j.applicants, workerId] } : j
      );
      dispatch({ type: 'SET_JOBS', payload: updatedJobs });
      dispatch({ type: 'SET_FILTERED_JOBS', payload: updatedJobs });

      console.log('✅ Candidature envoyée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur lors de la candidature:', error);
      throw new Error(error.message || 'Erreur lors de l\'envoi de la candidature');
    }
  };

  const updateFilters = (filters: SearchFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
    searchJobs(filters);
  };

  const refreshJobs = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('🔄 Rechargement des jobs depuis Firebase...');
      const firebaseJobs = await getAllJobs();
      
      console.log('✅ Jobs rechargés depuis Firebase:', firebaseJobs.length);
      dispatch({ type: 'SET_JOBS', payload: firebaseJobs });
      dispatch({ type: 'SET_FILTERED_JOBS', payload: firebaseJobs });
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des jobs:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  return (
    <JobContext.Provider
      value={{
        ...state,
        searchJobs,
        getJobById,
        createJob,
        applyToJob,
        updateFilters,
        refreshJobs
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
