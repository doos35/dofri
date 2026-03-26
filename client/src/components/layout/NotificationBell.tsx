import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ExternalLink, Sparkles } from 'lucide-react';
import { useLinksContext } from '../../context/LinksContext';
import { cn } from '../../utils/cn';
import { Link } from '../../types';

const STORAGE_KEY = 'dofri_notif_last_seen';

function getLastSeen(): string {
  return localStorage.getItem(STORAGE_KEY) || '1970-01-01T00:00:00.000Z';
}

function setLastSeen(date: string) {
  localStorage.setItem(STORAGE_KEY, date);
}

/** Groupe les liens par date (jour) */
function groupByDate(links: Link[]): { date: string; label: string; links: Link[] }[] {
  const groups = new Map<string, Link[]>();
  for (const link of links) {
    const day = link.createdAt.slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(link);
  }

  return Array.from(groups.entries()).map(([day, links]) => ({
    date: day,
    label: formatDate(day),
    links,
  }));
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}

export default function NotificationBell() {
  const { links } = useLinksContext();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState(getLastSeen);
  const ref = useRef<HTMLDivElement>(null);

  // Liens récents = ajoutés dans les 30 derniers jours, triés par date desc
  const recentLinks = links
    .filter(l => l.createdAt && daysSince(l.createdAt) <= 30)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const unseenCount = recentLinks.filter(l => l.createdAt > lastSeen).length;

  const grouped = groupByDate(recentLinks);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open && recentLinks.length > 0) {
      const newest = recentLinks[0].createdAt;
      setLastSeen(newest);
      setLastSeenState(newest);
    }
  };

  // Fermer au clic extérieur
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        title="Nouveautés"
      >
        <Bell className="w-4 h-4" />
        {unseenCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-emerald-500 rounded-full"
          >
            {unseenCount > 99 ? '99+' : unseenCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl z-50"
          >
            {/* En-tête */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-5 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Nouveautés</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Les derniers liens ajoutés sur DoFri</p>
            </div>

            {/* Contenu */}
            <div className="px-5 py-3 space-y-4">
              {grouped.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                  Aucun lien ajouté récemment
                </p>
              ) : (
                grouped.map(group => (
                  <div key={group.date}>
                    {/* Badge date */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Sparkles className="w-3 h-3" />
                        Nouveau
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{group.label}</span>
                    </div>

                    {/* Liens du jour */}
                    <ul className="space-y-1.5 ml-1">
                      {group.links.map(link => (
                        <li key={link.id}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/item flex items-start gap-2 py-1 px-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            {link.icon ? (
                              <img src={link.icon} alt="" className="w-4 h-4 mt-0.5 rounded object-contain flex-shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 mt-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {link.title}
                                </span>
                                <ExternalLink className="w-3 h-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0" />
                              </div>
                              {link.description && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{link.description}</p>
                              )}
                            </div>
                            <span className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5',
                              'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                            )}>
                              {link.category}
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
