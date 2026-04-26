import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (popupRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-xl text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
        title="Insérer un emoji"
      >
        <Smile className="w-5 h-5" />
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-[60]"
                onClick={() => setOpen(false)}
              />
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.95 }}
                animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
                exit={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed left-1/2 top-1/2 w-[min(20rem,calc(100vw-2rem))] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[70]"
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
                <div className="p-2 max-h-72 overflow-y-auto grid grid-cols-8 gap-1">
                  {CATEGORIES[activeCategory].emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => onSelect(emoji)}
                      className="text-xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
