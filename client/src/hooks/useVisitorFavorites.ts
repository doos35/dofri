import { useState, useCallback } from 'react';

const STORAGE_KEY = 'dofri_visitor_favorites';

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favs]));
}

export function useVisitorFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);

  const toggleFavorite = useCallback((linkId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(linkId)) {
        next.delete(linkId);
      } else {
        next.add(linkId);
      }
      saveFavorites(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback((linkId: string) => favorites.has(linkId), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
