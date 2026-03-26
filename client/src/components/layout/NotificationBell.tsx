import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, Wrench, Bug, Info } from 'lucide-react';
import { Notification } from '../../types';
import * as api from '../../api/linksApi';
import { cn } from '../../utils/cn';

const STORAGE_KEY = 'dofri_notif_last_seen';

function getLastSeen(): string {
  return localStorage.getItem(STORAGE_KEY) || '1970-01-01T00:00:00.000Z';
}

function setLastSeen(date: string) {
  localStorage.setItem(STORAGE_KEY, date);
}

const BADGE_CONFIG: Record<Notification['badge'], { label: string; icon: typeof Sparkles; color: string }> = {
  nouveau: { label: 'Nouveau', icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  amélioration: { label: 'Amélioration', icon: Wrench, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  correction: { label: 'Correction', icon: Bug, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  info: { label: 'Info', icon: Info, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Groupe les notifications par date */
function groupByDate(notifs: Notification[]): { date: string; label: string; items: Notification[] }[] {
  const groups = new Map<string, Notification[]>();
  for (const n of notifs) {
    const day = n.createdAt.slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(n);
  }
  return Array.from(groups.entries()).map(([day, items]) => ({
    date: day,
    label: formatDate(day),
    items,
  }));
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeenState] = useState(getLastSeen);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.fetchNotifications();
      setNotifications(data);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const unseenCount = notifications.filter(n => n.createdAt > lastSeen).length;
  const grouped = groupByDate(notifications);

  const handleOpen = () => {
    setOpen(prev => !prev);
    if (!open && notifications.length > 0) {
      const newest = notifications[0].createdAt;
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
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Les dernières mises à jour de DoFri</p>
            </div>

            {/* Contenu */}
            <div className="px-5 py-3 space-y-5">
              {grouped.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">
                  Aucune notification
                </p>
              ) : (
                grouped.map(group => (
                  <div key={group.date} className="space-y-3">
                    {group.items.map(notif => {
                      const cfg = BADGE_CONFIG[notif.badge] || BADGE_CONFIG.nouveau;
                      const Icon = cfg.icon;
                      const lines = notif.content ? notif.content.split('\n').filter(l => l.trim()) : [];

                      return (
                        <div key={notif.id}>
                          {/* Badge + date */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                              cfg.color
                            )}>
                              <Icon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{group.label}</span>
                          </div>

                          {/* Titre */}
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                            {notif.title}
                          </h4>

                          {/* Contenu en puces */}
                          {lines.length > 0 && (
                            <ul className="space-y-0.5 ml-1">
                              {lines.map((line, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="w-1 h-1 mt-1.5 rounded-full bg-gray-400 dark:bg-gray-500 flex-shrink-0" />
                                  {line}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
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
