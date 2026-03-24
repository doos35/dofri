import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Wifi, WifiOff, AlertTriangle, Loader2, Star } from 'lucide-react';
import { useLinksContext } from '../context/LinksContext';
import LinkCard from '../components/links/LinkCard';
import SearchBar from '../components/search/SearchBar';
import CategoryFilter from '../components/search/CategoryFilter';
import TagFilter from '../components/search/TagFilter';

export default function HomePage() {
  const {
    links,
    healthStatuses,
    categories,
    tags,
    loading,
    searchTerm,
    activeCategory,
    activeTags,
    setSearchTerm,
    setActiveCategory,
    toggleTag,
  } = useLinksContext();

  // Stats
  const totalLinks = links.length;
  const okCount = links.filter(l => healthStatuses.get(l.id)?.status === 'ok').length;
  const slowCount = links.filter(l => healthStatuses.get(l.id)?.status === 'slow').length;
  const deadCount = links.filter(l => healthStatuses.get(l.id)?.status === 'dead').length;

  // Favorites
  const favorites = links.filter(l => l.favorite);
  const nonFavorites = links.filter(l => !l.favorite);

  // Group by category if no filter active
  const grouped = !activeCategory && !searchTerm && activeTags.length === 0;
  const categoryGroups = grouped
    ? categories.reduce((acc, cat) => {
        const catLinks = nonFavorites.filter(l => l.category === cat);
        if (catLinks.length > 0) acc[cat] = catLinks;
        return acc;
      }, {} as Record<string, typeof links>)
    : {};

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero section */}
      <div
        className="relative py-16 px-4 mb-8 bg-cover bg-center bg-no-repeat"
        style={{
          // L'image est devant, le gradient sert de fallback si elle est absente
          backgroundImage: 'url(/hero-banner.jpg), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Overlay: dark gradient + subtle purple tint */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-violet-950/50 to-indigo-950/60" />
        {/* Bottom fade for smooth transition */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Compass className="w-4 h-4" />
            {totalLinks} lien{totalLinks > 1 ? 's' : ''} disponible{totalLinks > 1 ? 's' : ''}
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bienvenue sur DoFri
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Accédez rapidement à tous vos liens favoris, organisés par catégories et vérifiés en temps réel.
          </p>

          <div className="flex justify-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
          </div>

          {/* Stats bar */}
          <motion.div
            className="flex items-center justify-center gap-6 mt-6 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-1.5 text-emerald-200">
              <Wifi className="w-4 h-4" />
              <span>{okCount} en ligne</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span>{slowCount} lent{slowCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-200">
              <WifiOff className="w-4 h-4" />
              <span>{deadCount} hors ligne</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 mb-8">
        <CategoryFilter categories={categories} active={activeCategory} onChange={setActiveCategory} />
        <TagFilter tags={tags} activeTags={activeTags} onToggle={toggleTag} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chargement des liens...</p>
          </div>
        ) : links.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Compass className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Aucun lien trouvé</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || activeCategory || activeTags.length > 0
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter des liens via le panel admin'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {/* Favorites section */}
            {favorites.length > 0 && grouped && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  Favoris
                  <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({favorites.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((link, idx) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      health={healthStatuses.get(link.id)}
                      index={idx}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Category groups or flat list */}
            {grouped ? (
              <AnimatePresence>
                {Object.entries(categoryGroups).map(([cat, catLinks]) => (
                  <motion.section
                    key={cat}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <div className="w-2 h-8 rounded-full gradient-bg" />
                      {cat}
                      <span className="text-sm font-normal text-gray-400 dark:text-gray-500">({catLinks.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catLinks.map((link, idx) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          health={healthStatuses.get(link.id)}
                          index={idx}
                        />
                      ))}
                    </div>
                  </motion.section>
                ))}
              </AnimatePresence>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {links.map((link, idx) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      health={healthStatuses.get(link.id)}
                      index={idx}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
