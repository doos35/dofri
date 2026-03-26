import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Star, MousePointerClick, Monitor, Flag, Pencil } from 'lucide-react';
import { Link, HealthStatus, RatingSummary } from '../../types';
import StatusBadge from '../ui/StatusBadge';
import StarRating from '../ui/StarRating';
import { cn } from '../../utils/cn';
import { getVisitorId } from '../../utils/visitorId';
import * as api from '../../api/linksApi';

interface LinkCardProps {
  link: Link;
  health?: HealthStatus;
  rating?: RatingSummary;
  onRatingChange?: () => void;
  onEdit?: (link: Link) => void;
  index?: number;
}

export default function LinkCard({ link, health, rating, onRatingChange, onEdit, index = 0 }: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [reported, setReported] = useState(false);

  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(link.url)}&screenshot=true&meta=false&embed=screenshot.url`;

  const handleMouseEnter = () => {
    setHasHovered(true);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    api.trackClick(link.id).catch(() => {});
  };

  const handleRate = async (score: number) => {
    try {
      await api.rateLink(link.id, getVisitorId(), score);
      onRatingChange?.();
    } catch {}
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.reportDeadLink(link.id, getVisitorId());
      setReported(true);
    } catch {}
  };

  const statusColor = {
    ok: 'border-emerald-200 hover:border-emerald-300 dark:border-emerald-800 dark:hover:border-emerald-700',
    slow: 'border-amber-200 hover:border-amber-300 dark:border-amber-800 dark:hover:border-amber-700',
    dead: 'border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700',
    unknown: 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600',
  };

  const status = health?.status || 'unknown';

  return (
    <motion.a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group block p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 shadow-sm hover:shadow-xl dark:shadow-black/20 transition-shadow duration-300 cursor-pointer relative overflow-hidden',
        statusColor[status],
        link.favorite && 'ring-2 ring-amber-200/50 dark:ring-amber-700/40'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      layout
    >
      {/* Screenshot */}
      <motion.div
        className="-mx-5 -mt-5 overflow-hidden"
        animate={{
          height: isHovered ? 156 : 0,
          marginBottom: isHovered ? 16 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="relative w-full h-[156px] bg-gray-100 dark:bg-gray-700">
          {hasHovered && !imgLoaded && !imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              <span className="text-xs text-gray-400 dark:text-gray-500">Chargement…</span>
            </div>
          )}
          {imgError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
              <Monitor className="w-8 h-8" />
              <span className="text-xs">Aperçu indisponible</span>
            </div>
          )}
          {hasHovered && !imgError && (
            <img
              src={screenshotUrl}
              alt=""
              className={cn(
                'w-full h-full object-cover object-top transition-opacity duration-300',
                imgLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          {imgLoaded && (
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/60 dark:from-gray-800/60 to-transparent" />
          )}
        </div>
      </motion.div>

      {/* Top right: favorite + edit + report */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        {link.favorite && (
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        )}
        {onEdit && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(link); }}
            className="p-1 rounded-md transition-all duration-200 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleReport}
          disabled={reported}
          className={cn(
            'p-1 rounded-md transition-all duration-200',
            reported
              ? 'text-red-400 dark:text-red-500 cursor-default'
              : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
          )}
          title={reported ? 'Lien signalé' : 'Signaler comme mort'}
        >
          <Flag className={cn('w-3.5 h-3.5', reported && 'fill-red-400 dark:fill-red-500')} />
        </button>
      </div>

      {/* Card content */}
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
          {link.icon ? (
            <img
              src={link.icon}
              alt=""
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <Globe className={cn('w-6 h-6 text-gray-400 dark:text-gray-500', link.icon && 'hidden')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {link.title}
            </h3>
            <StatusBadge health={health} />
            <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>

          {link.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {link.description}
            </p>
          )}

          {/* Rating */}
          <div className="mb-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <StarRating
              average={rating?.average ?? 0}
              count={rating?.count ?? 0}
              userRating={rating?.userRating ?? null}
              onRate={handleRate}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
              {link.category}
            </span>
            {link.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {link.tags.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">+{link.tags.length - 3}</span>
            )}
            {link.clicks > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 ml-auto">
                <MousePointerClick className="w-3 h-3" />
                {link.clicks}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.a>
  );
}
