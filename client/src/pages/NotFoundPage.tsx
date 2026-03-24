import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icône */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Compass className="w-12 h-12 text-gray-300 dark:text-gray-600" />
        </motion.div>

        {/* 404 */}
        <h1 className="text-8xl font-extrabold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Page introuvable
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
          Cette page n'existe pas ou a été déplacée. Retourne à l'accueil pour retrouver tes liens.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 gradient-bg text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
        >
          <Home className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
