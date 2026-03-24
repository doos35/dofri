import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { HealthStatus } from '../../types';

interface StatusBadgeProps {
  health?: HealthStatus;
  size?: 'sm' | 'md';
}

const statusConfig = {
  ok: { color: 'bg-emerald-500', label: 'En ligne', shadow: 'shadow-emerald-500/50' },
  slow: { color: 'bg-amber-500', label: 'Lent', shadow: 'shadow-amber-500/50' },
  dead: { color: 'bg-red-500', label: 'Hors ligne', shadow: 'shadow-red-500/50' },
  unknown: { color: 'bg-gray-400', label: 'Inconnu', shadow: 'shadow-gray-400/50' },
};

export default function StatusBadge({ health, size = 'sm' }: StatusBadgeProps) {
  const status = health?.status || 'unknown';
  const config = statusConfig[status];
  const dotSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';

  return (
    <div className="relative group inline-flex items-center">
      <motion.div
        className={cn(dotSize, 'rounded-full shadow-md', config.color, config.shadow)}
        animate={status === 'dead' ? { scale: [1, 1.3, 1] } : {}}
        transition={status === 'dead' ? { repeat: Infinity, duration: 2 } : {}}
      />
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <div className="font-medium">{config.label}</div>
        {health?.httpCode && <div>HTTP {health.httpCode}</div>}
        {health?.responseTimeMs != null && <div>{health.responseTimeMs}ms</div>}
        {health?.lastCheckedAt && (
          <div className="text-gray-400">
            {new Date(health.lastCheckedAt).toLocaleString('fr-FR')}
          </div>
        )}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
