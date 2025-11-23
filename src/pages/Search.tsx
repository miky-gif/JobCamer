import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllWorkers } from '../services/authService';
import { JobCard, WorkerCard } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { JOB_CATEGORIES, CITIES } from '../utils/constants';
import { Search as SearchIcon, Filter, DollarSign } from 'lucide-react';
import { SearchFilters } from '../types';

export const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { filteredJobs, searchJobs } = useJobs();
  
  const [searchType, setSearchType] = useState<'jobs' | 'workers'>('jobs');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: searchParams.get('category') as any || undefined,
    location: '',
    minBudget: undefined,
    maxBudget: undefined,
    rating: undefined,
    verified: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  useEffect(() => {
    searchJobs(filters);
  }, [filters]);

  // Charger les travailleurs au montage du composant
  useEffect(() => {
    const loadWorkers = async () => {
      if (searchType === 'workers') {
        setLoadingWorkers(true);
        try {
          console.log('Chargement des travailleurs...');
          const realWorkers = await getAllWorkers();
          setWorkers(realWorkers);
          console.log('Travailleurs chargés:', realWorkers);
        } catch (error) {
          console.error('Erreur lors du chargement des travailleurs:', error);
          // En cas d'erreur, utiliser un tableau vide
          setWorkers([]);
        } finally {
          setLoadingWorkers(false);
        }
      }
    };

    loadWorkers();
  }, [searchType]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    setFilters({
      category: undefined,
      location: '',
      minBudget: undefined,
      maxBudget: undefined,
      rating: undefined,
      verified: false
    });
  };

  const filteredWorkers = workers.filter((worker: any) => {
    if (filters.category && worker.category !== filters.category) return false;
    if (filters.location && !worker.location?.city?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.rating && (worker.rating || 0) < filters.rating) return false;
    if (filters.verified && !worker.verified) return false;
    if (searchQuery && !`${worker.firstName} ${worker.lastName} ${worker.bio || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const results = searchType === 'jobs' ? filteredJobs : filteredWorkers;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50/10 to-white dark:from-gray-900 dark:via-gray-800/10 dark:to-gray-900 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-red-50 dark:from-green-900/20 dark:to-red-900/20 rounded-2xl border-l-4 border-green-500">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('search.title')}
          </h1>
          
          {/* Search type toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={searchType === 'jobs' ? 'primary' : 'outline'}
              onClick={() => setSearchType('jobs')}
            >
              {t('search.jobs')}
            </Button>
            <Button
              variant={searchType === 'workers' ? 'primary' : 'outline'}
              onClick={() => setSearchType('workers')}
            >
              {t('search.workers')}
            </Button>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={searchType === 'jobs' ? t('search.jobs') : t('search.workers')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={20} />}
            >
              {t('search.filters')}
            </Button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {t('search.filters')}
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {t('search.clearFilters')}
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <Select
                label="Catégorie"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: '', label: 'Toutes les catégories' },
                  ...Object.entries(JOB_CATEGORIES).map(([key, cat]) => ({
                    value: key,
                    label: `${cat.icon} ${cat.label}`
                  }))
                ]}
              />

              {/* Location */}
              <Select
                label="Ville"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                options={[
                  { value: '', label: 'Toutes les villes' },
                  ...CITIES.map(city => ({ value: city, label: city }))
                ]}
              />

              {/* Budget range (for jobs) */}
              {searchType === 'jobs' && (
                <>
                  <Input
                    label="Budget min (FCFA)"
                    type="number"
                    placeholder="0"
                    value={filters.minBudget || ''}
                    onChange={(e) => handleFilterChange('minBudget', e.target.value ? parseInt(e.target.value) : undefined)}
                    icon={<DollarSign size={20} />}
                  />
                  <Input
                    label="Budget max (FCFA)"
                    type="number"
                    placeholder="1000000"
                    value={filters.maxBudget || ''}
                    onChange={(e) => handleFilterChange('maxBudget', e.target.value ? parseInt(e.target.value) : undefined)}
                    icon={<DollarSign size={20} />}
                  />
                </>
              )}

              {/* Rating (for workers) */}
              {searchType === 'workers' && (
                <Select
                  label="Note minimum"
                  value={filters.rating?.toString() || ''}
                  onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
                  options={[
                    { value: '', label: 'Toutes les notes' },
                    { value: '4.5', label: '4.5+ ⭐' },
                    { value: '4', label: '4+ ⭐' },
                    { value: '3.5', label: '3.5+ ⭐' },
                    { value: '3', label: '3+ ⭐' }
                  ]}
                />
              )}

              {/* Verified only */}
              {searchType === 'workers' && (
                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verified || false}
                    onChange={(e) => handleFilterChange('verified', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="verified" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Profils vérifiés uniquement
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{results.length}</span>{' '}
            {searchType === 'jobs' ? 'offre(s)' : 'travailleur(s)'} trouvé(s)
          </p>
        </div>

        {/* Loading state for workers */}
        {searchType === 'workers' && loadingWorkers ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Chargement des travailleurs...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchType === 'jobs' ? (
              filteredJobs.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => navigate(`/jobs/${job.id}`)}
                />
              ))
            ) : (
              filteredWorkers.map((worker: any) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onClick={() => navigate(`/workers/${worker.id}`)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucun résultat trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Essayez de modifier vos critères de recherche
            </p>
            <Button onClick={clearFilters}>
              {t('search.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
