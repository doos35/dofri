import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, CheckCheck, ExternalLink, Loader2 } from 'lucide-react';
import { DeadLinkReportWithLink } from '../../types';
import * as api from '../../api/linksApi';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange: (count: number) => void;
}

export default function NotificationPanel({ isOpen, onClose, onCountChange }: NotificationPanelProps) {
  const [reports, setReports] = useState<DeadLinkReportWithLink[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.fetchReports()
      .then(({ reports, undismissedCount }) => {
        setReports(reports);
        onCountChange(undismissedCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isOpen, onCountChange]);

  const handleDismiss = async (reportId: string) => {
    await api.dismissReport(reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
    onCountChange(Math.max(0, reports.length - 1));
  };

  const handleDismissAll = async () => {
    await api.dismissAllReports();
    setReports([]);
    onCountChange(0);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Signalements</h3>
                {reports.length > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                    {reports.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {reports.length > 0 && (
                  <button
                    onClick={handleDismissAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tout traiter
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
                  <Flag className="w-10 h-10 mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-medium">Aucun signalement</p>
                  <p className="text-xs mt-1">Tous les liens semblent OK</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <AnimatePresence>
                    {reports.map(report => (
                      <motion.div
                        key={report.id}
                        className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {report.linkTitle}
                            </p>
                            <a
                              href={report.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 truncate block max-w-[250px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {report.linkUrl}
                              <ExternalLink className="w-3 h-3 inline ml-1" />
                            </a>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                              Signalé le {formatDate(report.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                            title="Traiter"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
