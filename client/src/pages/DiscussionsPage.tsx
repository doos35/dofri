import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Pin, Trash2, Loader2, Clock, Users } from 'lucide-react';
import * as api from '../api/linksApi';
import { Discussion } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { usePseudo } from '../hooks/usePseudo';
import { getVisitorId } from '../utils/visitorId';
import Modal from '../components/ui/Modal';
import ToastContainer from '../components/ui/Toast';
import BackToTop from '../components/ui/BackToTop';
import EmojiPicker from '../components/ui/EmojiPicker';

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function DiscussionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const { pseudo, setPseudo } = usePseudo();

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPseudo, setFormPseudo] = useState(pseudo);
  const formContentRef = useRef<HTMLTextAreaElement>(null);

  const insertEmoji = (emoji: string) => {
    const el = formContentRef.current;
    if (!el) {
      setFormContent(formContent + emoji);
      return;
    }
    const start = el.selectionStart ?? formContent.length;
    const end = el.selectionEnd ?? formContent.length;
    const next = formContent.slice(0, start) + emoji + formContent.slice(end);
    setFormContent(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const load = async () => {
    setLoading(true);
    try {
      setDiscussions(await api.fetchDiscussions());
    } catch {
      addToast('Erreur lors du chargement des discussions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setFormTitle('');
    setFormContent('');
    setFormPseudo(pseudo);
    setShowCreate(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = formTitle.trim();
    const content = formContent.trim();
    const author = formPseudo.trim();
    if (title.length < 3) return addToast('Le titre est trop court', 'error');
    if (author.length < 2) return addToast('Choisis un pseudo (2 caractères min)', 'error');
    if (!content) return addToast('Le message ne peut pas être vide', 'error');

    setSubmitting(true);
    try {
      setPseudo(author);
      const discussion = await api.createDiscussion({
        title,
        authorName: author,
        authorId: getVisitorId(),
        content,
      });
      setShowCreate(false);
      addToast('Discussion créée');
      navigate(`/discussions/${discussion.id}`);
    } catch (err: any) {
      addToast(err?.response?.data?.error || 'Erreur lors de la création', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette discussion et tous ses messages ?')) return;
    try {
      await api.deleteDiscussion(id);
      setDiscussions((prev) => prev.filter((d) => d.id !== id));
      addToast('Discussion supprimée');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  const handlePin = async (id: string) => {
    try {
      const updated = await api.togglePinDiscussion(id);
      setDiscussions((prev) => {
        const next = prev.map((d) => (d.id === id ? updated : d));
        return next.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.lastMessageAt.localeCompare(a.lastMessageAt);
        });
      });
    } catch {
      addToast('Erreur', 'error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative py-12 px-4 mb-8 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-950">
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-4">
            <MessageCircle className="w-4 h-4" />
            Espace de discussions
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Discutez avec la communauté
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Crée une discussion, partage un avis, pose une question — tout le monde peut participer.
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Users className="w-4 h-4" />
            {discussions.length} discussion{discussions.length > 1 ? 's' : ''}
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium shadow hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouvelle discussion
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        ) : discussions.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aucune discussion pour le moment
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Sois le premier à lancer le sujet
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Créer une discussion
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {discussions.map((d, idx) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                  layout
                >
                  <Link
                    to={`/discussions/${d.id}`}
                    className="block p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {d.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {d.pinned && (
                            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          )}
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {d.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          par <span className="font-medium text-gray-700 dark:text-gray-300">{d.authorName}</span>
                          {' · '}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {relativeTime(d.createdAt)}
                          </span>
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            {d.messageCount} message{d.messageCount > 1 ? 's' : ''}
                          </span>
                          <span>·</span>
                          <span>Dernier : {relativeTime(d.lastMessageAt)}</span>
                        </div>
                      </div>
                      {isAuthenticated && (
                        <div className="flex flex-col gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handlePin(d.id);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              d.pinned
                                ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/30'
                                : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                            }`}
                            title={d.pinned ? 'Désépingler' : 'Épingler'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(d.id);
                            }}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle discussion">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Ton pseudo
            </label>
            <input
              type="text"
              value={formPseudo}
              onChange={(e) => setFormPseudo(e.target.value)}
              maxLength={40}
              placeholder="Ex. Doos"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Titre
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              maxLength={200}
              placeholder="De quoi veux-tu parler ?"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Premier message
            </label>
            <div className="relative">
              <textarea
                ref={formContentRef}
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                maxLength={4000}
                rows={5}
                placeholder="Lance la discussion..."
                className="w-full px-3 py-2 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                required
              />
              <div className="absolute bottom-2 right-2">
                <EmojiPicker onSelect={insertEmoji} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">{formContent.length}/4000</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl gradient-bg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </Modal>

      <BackToTop />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
