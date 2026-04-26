import { useState, useCallback } from 'react';

const NAME_KEY = 'dofri_pseudo';

export function usePseudo() {
  const [pseudo, setPseudoState] = useState<string>(() => localStorage.getItem(NAME_KEY) || '');

  const setPseudo = useCallback((value: string) => {
    const trimmed = value.trim().slice(0, 40);
    setPseudoState(trimmed);
    if (trimmed) {
      localStorage.setItem(NAME_KEY, trimmed);
    } else {
      localStorage.removeItem(NAME_KEY);
    }
  }, []);

  return { pseudo, setPseudo };
}
