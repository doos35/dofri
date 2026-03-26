import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Edit3, RefreshCw, ExternalLink, Search,
  Wifi, WifiOff, AlertTriangle, BarChart3, Globe, Star, MousePointerClick, Bell, ChevronDown, Upload, GripVertical
} from 'lucide-react';
import { Link as LinkType, HealthStatus, RatingSummary, CreateLinkDTO, UpdateLinkDTO } from '../types';
import * as api from '../api/linksApi';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LinkForm from '../admin/LinkForm';
import NotificationPanel from '../components/admin/NotificationPanel';
import AdminDashboard from '../components/admin/AdminDashboard';
import ImportLinks from '../components/admin/ImportLinks';

export default function AdminPage() {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [healthMap, setHealthMap] = useState<Map<string, HealthStatus>>(new Map());
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editLink, setEditLink] = useState<LinkType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [ratings, setRatings] = useState<RatingSummary[]>([]);
  const [showDashboard, setShowDashboard] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [linksData, catsData, healthData] = await Promise.all([
        api.fetchLinks(),
        api.fetchCategories(),
        api.fetchHealthStatuses(),
      ]);
      setLinks(linksData);
      setCategories(catsData);
      const map = new Map<string, HealthStatus>();
      for (const s of healthData) map.set(s.linkId, s);
      setHealthMap(map);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    api.fetchReportCount().then(setReportCount).catch(() => {});
    api.fetchRatings().then(setRatings).catch(() => {});
  }, [loadData]);

  const handleCreate = async (data: CreateLinkDTO | UpdateLinkDTO) => {
    await api.createLink(data as CreateLinkDTO);
    setShowForm(false);
    await loadData();
  };

  const handleUpdate = async (data: CreateLinkDTO | UpdateLinkDTO) => {
    if (!editLink) return;
    await api.updateLink(editLink.id, data as UpdateLinkDTO);
    setEditLink(null);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    await api.deleteLink(id);
    setDeleteConfirm(null);
    await loadData();
  };

  const handleToggleFavorite = async (id: string) => {
    await api.toggleFavorite(id);
    await loadData();
  };

  const handleHealthCheck = async () => {
    setChecking(true);
    try {
      const { results } = await api.triggerHealthCheck();
      const map = new Map<string, HealthStatus>();
      for (const s of results) map.set(s.linkId, s);
      setHealthMap(map);
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleDragEnd = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    const reordered = [...filteredLinks];
    const [dragged] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, dragged);

    // Optimistic update
    setLinks(prev => {
      if (search) return prev; // Don't reorder when filtering
      return reordered;
    });

    dragItem.current = null;
    dragOverItem.current = null;

    // Persist
    try {
      await api.reorderLinks(reordered.map(l => l.id));
    } catch {
      await loadData(); // Rollback on failure
    }
  };

  const filteredLinks = search
    ? links.filter(l =>
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        l.url.toLowerCase().includes(search.toLowerCase()) ||
        l.category.toLowerCase().includes(search.toLowerCase())
      )
    : links;

  // Stats
  const okCount = links.filter(l => healthMap.get(l.id)?.status === 'ok').length;
  const slowCount = links.filter(l => healthMap.get(l.id)?.status === 'slow').length;
  const deadCount = links.filter(l => healthMap.get(l.id)?.status === 'dead').length;
  const totalClicks = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Panel Admin</h2>
          <p className="text-gray-500 dark:text-gray-400">Gérez vos liens, catégories et vérifiez leur disponibilité.</p>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{links.length}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total liens</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{okCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">En ligne</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{slowCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Lents</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-red-100 dark:border-red-900/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{deadCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Hors ligne</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-violet-100 dark:border-violet-900/50 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalClicks}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Clics totaux</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dashboard toggle */}
        <motion.button
          onClick={() => setShowDashboard(prev => !prev)}
          className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showDashboard ? 'rotate-0' : '-rotate-90'}`} />
          {showDashboard ? 'Masquer le dashboard' : 'Afficher le dashboard'}
        </motion.button>

        {/* Dashboard détaillé */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <AdminDashboard links={links} healthMap={healthMap} ratings={ratings} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions bar */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNotifications(true)}
              className="relative inline-flex items-center justify-center w-11 h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              title="Signalements"
            >
              <Bell className="w-5 h-5" />
              {reportCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                  {reportCount}
                </span>
              )}
            </button>
            <button
              onClick={handleHealthCheck}
              disabled={checking}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              Vérifier santé
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              <Upload className="w-4 h-4" />
              Importer
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>
        </motion.div>

        {/* Links table */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">Chargement...</div>
          ) : filteredLinks.length === 0 ? (
            <div className="p-12 text-center">
              <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Aucun lien trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    {!search && <th className="w-8 py-4 px-2" />}
                    <th className="text-center py-4 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">Fav</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lien</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                    <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Tags</th>
                    <th className="text-center py-4 px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clics</th>
                    <th className="text-center py-4 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-4 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredLinks.map((link, idx) => (
                      <motion.tr
                        key={link.id}
                        className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                        draggable={!search}
                        onDragStart={() => { dragItem.current = idx; }}
                        onDragEnter={() => { dragOverItem.current = idx; }}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnd={handleDragEnd}
                      >
                        {!search && (
                          <td className="py-4 px-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                          </td>
                        )}
                        <td className="py-4 px-3 text-center">
                          <button
                            onClick={() => handleToggleFavorite(link.id)}
                            className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                            title={link.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Star className={`w-4 h-4 ${link.favorite ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                          </button>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
                              {link.icon ? (
                                <img src={link.icon} alt="" className="w-5 h-5 object-contain" />
                              ) : (
                                <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{link.title}</p>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 truncate block max-w-[250px]"
                              >
                                {link.url}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 hidden md:table-cell">
                          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                            {link.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {link.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                                {tag}
                              </span>
                            ))}
                            {link.tags.length > 2 && (
                              <span className="text-xs text-gray-400 dark:text-gray-500">+{link.tags.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 font-medium">
                            <MousePointerClick className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {link.clicks || 0}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <div className="flex justify-center">
                            <StatusBadge health={healthMap.get(link.id)} size="md" />
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center justify-end gap-1">
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Ouvrir"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </a>
                            <button
                              onClick={() => setEditLink(link)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4 text-blue-500" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(link.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Ajouter un lien">
        <LinkForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editLink} onClose={() => setEditLink(null)} title="Modifier le lien">
        <LinkForm
          link={editLink}
          categories={categories}
          onSubmit={handleUpdate}
          onCancel={() => setEditLink(null)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmer la suppression">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Êtes-vous sûr de vouloir supprimer ce lien ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Supprimer
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title="Importer des liens">
        <ImportLinks
          onDone={() => { setShowImport(false); loadData(); }}
          onCancel={() => setShowImport(false)}
        />
      </Modal>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onCountChange={setReportCount}
      />
    </div>
  );
}
