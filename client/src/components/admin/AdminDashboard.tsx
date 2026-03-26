import { motion } from 'framer-motion';
import { Trophy, Star, WifiOff, FolderOpen, MousePointerClick, TrendingUp } from 'lucide-react';
import { Link as LinkType, HealthStatus, RatingSummary } from '../../types';

interface AdminDashboardProps {
  links: LinkType[];
  healthMap: Map<string, HealthStatus>;
  ratings: RatingSummary[];
}

export default function AdminDashboard({ links, healthMap, ratings }: AdminDashboardProps) {
  // Top 5 most clicked
  const topClicked = [...links]
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 5);

  // Top 5 highest rated (min 1 vote)
  const ratingMap = new Map(ratings.map(r => [r.linkId, r]));
  const topRated = [...links]
    .filter(l => {
      const r = ratingMap.get(l.id);
      return r && r.count > 0;
    })
    .sort((a, b) => {
      const ra = ratingMap.get(a.id)!;
      const rb = ratingMap.get(b.id)!;
      return rb.average - ra.average || rb.count - ra.count;
    })
    .slice(0, 5);

  // Dead links
  const deadLinks = links.filter(l => healthMap.get(l.id)?.status === 'dead');

  // Links per category
  const catCounts: Record<string, number> = {};
  for (const l of links) {
    catCounts[l.category] = (catCounts[l.category] || 0) + 1;
  }
  const catEntries = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries[0]?.[1] || 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Top cliqués */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-violet-500" />
          Top 5 — Plus cliqués
        </h3>
        <div className="space-y-3">
          {topClicked.map((link, i) => (
            <div key={link.id} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {link.icon && (
                  <img src={link.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link.title}</span>
              </div>
              <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">
                {link.clicks || 0}
              </span>
            </div>
          ))}
          {topClicked.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">Aucune donnée</p>
          )}
        </div>
      </motion.div>

      {/* Mieux notés */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Top 5 — Mieux notés
        </h3>
        <div className="space-y-3">
          {topRated.map((link, i) => {
            const r = ratingMap.get(link.id)!;
            return (
              <div key={link.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {link.icon && (
                    <img src={link.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link.title}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{r.average}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">({r.count})</span>
                </div>
              </div>
            );
          })}
          {topRated.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">Aucune note</p>
          )}
        </div>
      </motion.div>

      {/* Liens morts */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-red-500" />
          Liens morts
          {deadLinks.length > 0 && (
            <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              {deadLinks.length}
            </span>
          )}
        </h3>
        <div className="space-y-3">
          {deadLinks.map(link => {
            const h = healthMap.get(link.id);
            return (
              <div key={link.id} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {link.icon && (
                    <img src={link.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{link.title}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {h?.httpCode ? `HTTP ${h.httpCode}` : 'Timeout'}
                </span>
              </div>
            );
          })}
          {deadLinks.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              Tous les liens sont en ligne !
            </div>
          )}
        </div>
      </motion.div>

      {/* Répartition par catégorie */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-primary-500" />
          Répartition par catégorie
        </h3>
        <div className="space-y-2.5">
          {catEntries.map(([cat, count]) => (
            <div key={cat}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{count}</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-bg rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / maxCat) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
