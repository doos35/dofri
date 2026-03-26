import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Wifi, WifiOff, AlertTriangle, Loader2, Star, Shield, ShieldBan, X, Monitor, Smartphone } from 'lucide-react';
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

  const [vpnBannerDismissed, setVpnBannerDismissed] = useState(false);
  const [adblockBannerDismissed, setAdblockBannerDismissed] = useState(false);

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

      {/* VPN Banner */}
      <AnimatePresence>
        {!vpnBannerDismissed && (
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Protégez votre vie privée — utilisez un VPN
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/70 mt-0.5">
                  Un VPN masque votre adresse IP et chiffre votre connexion.{' '}
                  <a
                    href="https://protonvpn.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors"
                  >
                    ProtonVPN
                  </a>
                  {' '}propose un plan gratuit, sans limite de temps.
                </p>
              </div>
              <button
                onClick={() => setVpnBannerDismissed(true)}
                className="flex-shrink-0 p-1.5 rounded-lg text-emerald-400 dark:text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Adblock Banner */}
      <AnimatePresence>
        {!adblockBannerDismissed && (
          <motion.div
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative flex items-start gap-4 px-5 py-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mt-0.5">
                <ShieldBan className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Bloquez les pubs — c'est indispensable
                </p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400/70">
                    <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-amber-800 dark:text-amber-300">PC :</span>{' '}
                      <a href="https://brave.com/download/" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">Brave</a>
                      {' '}(bloqueur intégré) +{' '}
                      <a href="https://ublockorigin.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">uBlock Origin</a>
                      {' '}pour une protection maximale
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400/70">
                    <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-amber-800 dark:text-amber-300">Android :</span>{' '}
                      <a href="https://play.google.com/store/apps/details?id=com.hsv.freeadblockerbrowser" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">FAB Adblocker Browser</a>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400/70">
                    <Smartphone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-amber-800 dark:text-amber-300">iPhone :</span>{' '}
                      <a href="https://apps.apple.com/app/brave-private-web-browser/id1052879175" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors">Brave</a>
                      {' '}(bloqueur intégré)
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setAdblockBannerDismissed(true)}
                className="flex-shrink-0 p-1.5 rounded-lg text-amber-400 dark:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
