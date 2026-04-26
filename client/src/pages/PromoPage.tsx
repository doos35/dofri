import { motion } from 'framer-motion';
import { Tag, Gift, Bell } from 'lucide-react';

export default function PromoPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative py-16 px-4 mb-8 bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 dark:from-rose-900 dark:via-orange-900 dark:to-amber-900 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-10 right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 left-10 w-40 h-40 bg-amber-300/30 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Tag className="w-4 h-4" />
            Bientôt disponible
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Promo
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Bons plans, codes promo et réductions arrivent bientôt sur DoFri.
          </p>
        </motion.div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            En cours de préparation
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Une sélection de bons plans à ne pas manquer arrivera très vite.
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
            <Bell className="w-4 h-4" />
            Tu seras notifié dès la sortie
          </div>
        </motion.div>
      </div>
    </div>
  );
}
