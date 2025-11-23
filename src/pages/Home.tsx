import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useLanguage } from '../context/LanguageContext';
import { JOB_CATEGORIES } from '../utils/constants';
import { JobCard } from '../components/common/Card';
import { Search } from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { jobs } = useJobs();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const recentJobs = jobs.slice(0, 4);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section - Ultra Modern Design */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-32 px-4 overflow-hidden">
        {/* Advanced Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-green-400/20 via-emerald-300/10 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-red-400/15 via-rose-300/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-gradient-to-bl from-yellow-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-green-500/30 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-1/3 w-6 h-6 bg-red-500/30 rotate-45 animate-pulse delay-700"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-yellow-500/40 rounded-full animate-bounce delay-1000"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full border border-green-200 dark:border-green-700/50 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xl">🇨🇲</span>
                </div>
                <span className="text-sm font-semibold text-green-700 dark:text-green-400 tracking-wide">Plateforme Camerounaise #1</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-[0.9] tracking-tight">
                {t('home.hero.title').split(' ').map((word, idx) => {
                  if (idx === 1) return <span key={idx} className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">{word} </span>;
                  if (idx === 3) return <span key={idx} className="bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">{word} </span>;
                  if (idx === 4) return <span key={idx} className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">{word}</span>;
                  return <span key={idx}>{word} </span>;
                })}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed font-light max-w-2xl">
                {t('home.hero.subtitle')}
              </p>
              
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-6 mb-16">
                  <Link to="/register?role=worker" className="group">
                    <button className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <span className="text-2xl">👷</span>
                        <span>{t('auth.register.worker')}</span>
                      </div>
                    </button>
                  </Link>
                  <Link to="/register?role=employer" className="group">
                    <button className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 shadow-lg transform hover:scale-105 hover:-translate-y-1 hover:border-green-500 dark:hover:border-green-400 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <span className="text-2xl">💼</span>
                        <span>{t('auth.register.employer')}</span>
                      </div>
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="mb-16">
                  <Link to="/search" className="group">
                    <button className="px-10 py-5 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <Search size={24} />
                        <span>{t('home.hero.search')}</span>
                      </div>
                    </button>
                  </Link>
                </div>
              )}

              {/* Enhanced Trust badges */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('home.hero.free')}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t('home.hero.secure')}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Support 24/7</span>
                </div>
              </div>
            </div>

            {/* Enhanced Right Image */}
            <div className="relative h-[500px] hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-transparent to-red-500/20 rounded-3xl blur-xl"></div>
              <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500">
                <img 
                  src="/image accueil.jpg" 
                  alt="JobCamer Platform" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                
                {/* Floating stats cards */}
                <div className="absolute top-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                  <div className="text-2xl font-bold text-green-600">500+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Travailleurs</div>
                </div>
                
                <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                  <div className="text-2xl font-bold text-red-600">200+</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Employeurs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search bar */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-red-500/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 flex flex-col sm:flex-row gap-4 shadow-2xl border border-white/30 dark:border-gray-700/30">
                <div className="flex-1 flex items-center px-6 py-2 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
                  <Search size={24} className="text-gray-400 mr-4" />
                  <input
                    type="text"
                    placeholder="Rechercher un métier ou une compétence..."
                    className="flex-1 py-4 border-0 focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 bg-transparent text-lg font-medium"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        navigate('/search');
                      }
                    }}
                  />
                </div>
                <button 
                  onClick={() => navigate('/search')}
                  className="px-8 py-4 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Rechercher</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra Modern Stats Section */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full border border-green-200 dark:border-green-700/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700 dark:text-green-400">Nos Performances</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.stats.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.stats.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat Card 1 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-3xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-6 shadow-lg">
                    <span className="text-2xl">👷</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    500+
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.stats.workers')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.stats.workersDesc')}</div>
                </div>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-rose-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-3xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-6 shadow-lg">
                    <span className="text-2xl">💼</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    200+
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.stats.employers')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.stats.employersDesc')}</div>
                </div>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-t-3xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl mb-6 shadow-lg">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    1000+
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.stats.missions')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.stats.missionsDesc')}</div>
                </div>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-8 rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl"></div>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-3">
                    4.8/5
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('home.stats.satisfaction')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{t('home.stats.satisfactionDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra Modern Categories Section */}
      <section className="py-32 px-4 bg-gradient-to-br from-white via-slate-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 right-20 w-28 h-28 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-300"></div>
          <div className="absolute bottom-10 left-20 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-full border border-red-200 dark:border-red-700/50">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">Nos Catégories</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.categories.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.categories.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {Object.entries(JOB_CATEGORIES).map(([key, category], index) => {
              const colorSchemes = [
                { 
                  gradient: 'from-green-500/20 to-emerald-500/10', 
                  border: 'border-green-200 dark:border-green-700/50',
                  icon: 'bg-gradient-to-br from-green-500 to-emerald-600',
                  hover: 'hover:border-green-400 dark:hover:border-green-500'
                },
                { 
                  gradient: 'from-red-500/20 to-rose-500/10', 
                  border: 'border-red-200 dark:border-red-700/50',
                  icon: 'bg-gradient-to-br from-red-500 to-rose-600',
                  hover: 'hover:border-red-400 dark:hover:border-red-500'
                },
                { 
                  gradient: 'from-yellow-500/20 to-amber-500/10', 
                  border: 'border-yellow-200 dark:border-yellow-700/50',
                  icon: 'bg-gradient-to-br from-yellow-500 to-amber-600',
                  hover: 'hover:border-yellow-400 dark:hover:border-yellow-500'
                },
                { 
                  gradient: 'from-blue-500/20 to-indigo-500/10', 
                  border: 'border-blue-200 dark:border-blue-700/50',
                  icon: 'bg-gradient-to-br from-blue-500 to-indigo-600',
                  hover: 'hover:border-blue-400 dark:hover:border-blue-500'
                },
                { 
                  gradient: 'from-purple-500/20 to-violet-500/10', 
                  border: 'border-purple-200 dark:border-purple-700/50',
                  icon: 'bg-gradient-to-br from-purple-500 to-violet-600',
                  hover: 'hover:border-purple-400 dark:hover:border-purple-500'
                },
                { 
                  gradient: 'from-pink-500/20 to-rose-500/10', 
                  border: 'border-pink-200 dark:border-pink-700/50',
                  icon: 'bg-gradient-to-br from-pink-500 to-rose-600',
                  hover: 'hover:border-pink-400 dark:hover:border-pink-500'
                },
                { 
                  gradient: 'from-teal-500/20 to-cyan-500/10', 
                  border: 'border-teal-200 dark:border-teal-700/50',
                  icon: 'bg-gradient-to-br from-teal-500 to-cyan-600',
                  hover: 'hover:border-teal-400 dark:hover:border-teal-500'
                }
              ];
              const scheme = colorSchemes[index % 7];
              
              return (
                <Link
                  key={key}
                  to={`/search?category=${key}`}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100`}></div>
                  <div className={`relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 text-center transition-all duration-500 border ${scheme.border} ${scheme.hover} shadow-lg hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${scheme.icon} rounded-2xl mb-4 shadow-lg text-white text-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors leading-tight">
                      {category.label}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>


      {/* Ultra Modern How it Works */}
      <section className="py-32 px-4 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-36 h-36 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-red-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-full border border-yellow-200 dark:border-yellow-700/50">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">Comment Ça Marche</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-green-300 via-red-300 to-yellow-300 transform -translate-y-1/2 z-0"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 transform -translate-y-1/2 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative group z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-10 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl text-2xl font-black shadow-2xl border-4 border-white dark:border-gray-800">
                    1
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl mb-6 shadow-lg">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">
                    {t('home.howItWorks.step1')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {t('home.howItWorks.step1Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-rose-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-10 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl text-2xl font-black shadow-2xl border-4 border-white dark:border-gray-800">
                    2
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 rounded-3xl mb-6 shadow-lg">
                    <span className="text-4xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">
                    {t('home.howItWorks.step2')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {t('home.howItWorks.step2Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-400/10 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative p-10 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 hover:scale-105">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-600 text-white rounded-2xl text-2xl font-black shadow-2xl border-4 border-white dark:border-gray-800">
                    3
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-3xl mb-6 shadow-lg">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 text-gray-900 dark:text-white">
                    {t('home.howItWorks.step3')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    {t('home.howItWorks.step3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <section className="py-16 px-4 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('home.recentJobs.title')}
              </h2>
              <Link to="/search" className="text-primary-600 dark:text-primary-400 hover:underline">
                {t('home.recentJobs.viewAll')}
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="relative py-24 px-4 bg-gradient-to-r from-green-600 via-red-500 to-yellow-500 text-white overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t('home.cta.title')}
            </h2>
            <p className="text-xl mb-10 text-white/90 leading-relaxed">
              {t('home.cta.subtitle')}
            </p>
            <Link to="/register">
              <button className="px-10 py-5 bg-white text-green-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all shadow-xl transform hover:scale-105">
                {t('home.cta.button')}
              </button>
            </Link>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>✓</span>
                <span>{t('home.hero.free')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>✓</span>
                <span>{t('home.hero.secure')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <span>✓</span>
                <span>Support 24/7</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white py-16 px-4 border-t-4 border-green-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="JobCamer Logo" 
                  className="h-12 w-auto"
                />
                <h3 className="font-bold text-xl">JobCamer</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {t('footer.description')}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-xl">🇨🇲</span>
                <span>{t('footer.proudlyCamera')}</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-green-400">{t('auth.register.worker')}s</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/search" className="hover:text-green-400 transition-colors">🔍 {t('search.jobs')}</Link></li>
                <li><Link to="/register?role=worker" className="hover:text-green-400 transition-colors">📝 {t('profile.title')}</Link></li>
                <li><Link to="/profile" className="hover:text-green-400 transition-colors">👤 {t('profile.title')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-red-400">{t('auth.register.employer')}s</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/post-job" className="hover:text-red-400 transition-colors">📢 {t('header.postJob')}</Link></li>
                <li><Link to="/search" className="hover:text-red-400 transition-colors">👥 {t('search.workers')}</Link></li>
                <li><Link to="/register?role=employer" className="hover:text-red-400 transition-colors">✨ {t('auth.register.button')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-yellow-400">{t('footer.company')}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">ℹ️ {t('footer.about')}</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">📞 {t('footer.contact')}</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">📄 {t('footer.terms')}</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">🔒 {t('footer.privacy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              {t('footer.copyright')}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Fait avec ❤️ au Cameroun</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
