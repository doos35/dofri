import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Sparkles, Wrench, Bug, Info } from 'lucide-react';
import { Notification } from '../../types';
import * as api from '../../api/linksApi';
import { cn } from '../../utils/cn';

const BADGE_OPTIONS: { value: Notification['badge']; label: string; icon: typeof Sparkles; color: string }[] = [
  { value: 'nouveau', label: 'Nouveau', icon: Sparkles, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { value: 'amélioration', label: 'Amélioration', icon: Wrench, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { value: 'correction', label: 'Correction', icon: Bug, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' },
  { value: 'info', label: 'Info', icon: Info, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  onDone: () => void;
  onCancel: () => void;
}

export default function ManageNotifications({ onDone, onCancel }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [badge, setBadge] = useState<Notification['badge']>('nouveau');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.fetchNotifications();
      setNotifications(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await api.createNotification({ title: title.trim(), content: content.trim(), badge });
      setTitle('');
      setContent('');
      setBadge('nouveau');
      await load();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const selectedBadge = BADGE_OPTIONS.find(b => b.value === badge)!;

  return (
    <div className="space-y-6">
      {/* Formulaire de création */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Classement intelligent"
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Contenu <span className="text-gray-400 font-normal">(une ligne par puce)</span>
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder={"Moyenne Bayésienne (formule IMDb)\nScore Wilson (formule Reddit)\nSélecteur de méthode dans le classement"}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
          <div className="flex flex-wrap gap-2">
            {BADGE_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBadge(opt.value)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    opt.color,
                    badge === opt.value ? 'ring-2 ring-offset-1 ring-primary-500 dark:ring-offset-gray-800' : 'opacity-60 hover:opacity-100'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={!title.trim() || submitting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Création…' : 'Publier la notification'}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Liste des notifications existantes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Notifications publiées ({notifications.length})
        </h4>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Chargement…</p>
        ) : notifications.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Aucune notification</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <AnimatePresence>
              {notifications.map(notif => {
                const badgeOpt = BADGE_OPTIONS.find(b => b.value === notif.badge) || BADGE_OPTIONS[0];
                const BadgeIcon = badgeOpt.icon;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 mt-0.5', badgeOpt.color)}>
                      <BadgeIcon className="w-3 h-3" />
                      {badgeOpt.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                      {notif.content && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{notif.content.split('\n')[0]}…</p>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(notif.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
