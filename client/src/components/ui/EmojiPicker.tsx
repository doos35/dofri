import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗', '😋', '😛', '😜', '🤪', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '🤔', '🤗', '🫡', '🫠', '🤫', '🤭', '😴', '🤤', '🤢', '🤮', '🥴', '😵'],
  },
  {
    name: 'Cœurs',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  },
  {
    name: 'Gestes',
    emojis: ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤝', '🙏', '✍️', '💪', '✊', '👊', '🫶'],
  },
  {
    name: 'Symboles',
    emojis: ['🔥', '✨', '⭐', '🌟', '💫', '⚡', '☀️', '🌙', '🎉', '🎊', '🎈', '🎁', '💯', '💢', '💥', '💦', '💨', '💤', '🕳️', '🎯', '🏆', '🥇', '🚀', '⏰'],
  },
  {
    name: 'Animaux',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦄', '🐝', '🦋', '🐢', '🐳', '🐬'],
  },
  {
    name: 'Nourriture',
    emojis: ['🍕', '🍔', '🍟', '🌭', '🥪', '🌮', '🥗', '🍿', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍭', '🍦', '☕', '🍺', '🍻', '🍷', '🍸', '🥂', '🍓', '🍎'],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        title="Insérer un emoji"
      >
        <Smile className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="flex border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveCategory(i)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    i === activeCategory
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="p-2 max-h-56 overflow-y-auto grid grid-cols-8 gap-1">
              {CATEGORIES[activeCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelect(emoji);
                  }}
                  className="text-xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
