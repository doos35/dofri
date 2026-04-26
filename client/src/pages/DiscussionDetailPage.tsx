import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Loader2, Trash2, Clock, MessageCircle, Pin } from 'lucide-react';
import * as api from '../api/linksApi';
import { DiscussionWithMessages, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { usePseudo } from '../hooks/usePseudo';
import { getVisitorId } from '../utils/visitorId';
import ToastContainer from '../components/ui/Toast';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function colorForName(name: string): string {
  const palette = [
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-sky-500 to-blue-600',
    'from-violet-500 to-indigo-600',
    'from-fuchsia-500 to-purple-600',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, dismissToast } = useToast();
  const { pseudo, setPseudo } = usePseudo();

  const [discussion, setDiscussion] = useState<DiscussionWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(pseudo);
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!id) return;
    try {
      const data = await api.fetchDiscussion(id);
      setDiscussion(data);
    } catch {
      addToast('Discussion introuvable', 'error');
      navigate('/discussions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    setAuthor(pseudo);
  }, [pseudo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !discussion) return;
    const txt = content.trim();
    const name = author.trim();
    if (name.length < 2) return addToast('Choisis un pseudo (2 caractères min)', 'error');
    if (!txt) return addToast('Le message est vide', 'error');

    setSubmitting(true);
    try {
      setPseudo(name);
      const message = await api.postMessage(id, {
        authorName: name,
        authorId: getVisitorId(),
        content: txt,
      });
      setDiscussion({
        ...discussion,
        messages: [...discussion.messages, message],
        messageCount: discussion.messageCount + 1,
        lastMessageAt: message.createdAt,
      });
      setContent('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err: any) {
      addToast(err?.response?.data?.error || "Erreur lors de l'envoi", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!id || !discussion) return;
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await api.deleteMessage(id, messageId);
      setDiscussion({
        ...discussion,
        messages: discussion.messages.filter((m) => m.id !== messageId),
        messageCount: Math.max(0, discussion.messageCount - 1),
      });
      addToast('Message supprimé');
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!discussion) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/discussions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux discussions
        </Link>

        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {discussion.pinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {discussion.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <span>par <span className="font-medium text-gray-700 dark:text-gray-300">{discussion.authorName}</span></span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(discussion.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {discussion.messageCount}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <AnimatePresence initial={false}>
            {discussion.messages.map((msg: Message) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-3"
                layout
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colorForName(msg.authorName)} flex items-center justify-center text-white font-semibold text-sm`}
                >
                  {msg.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {msg.authorName}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(msg.createdAt)}
                    </span>
                    {isAuthenticated && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="ml-auto p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="sticky bottom-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-4 space-y-3"
        >
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={40}
            placeholder="Ton pseudo"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
          <div className="flex gap-2 items-end">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={4000}
              rows={2}
              placeholder="Écris ta réponse..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex-shrink-0 w-10 h-10 rounded-xl gradient-bg text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              title="Envoyer (Ctrl+Entrée)"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 text-right">{content.length}/4000 — Ctrl+Entrée pour envoyer</p>
        </form>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
