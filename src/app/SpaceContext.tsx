import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Space = 'naturopathie' | 'malandrinerie';

interface SpaceContextType {
  currentSpace: Space;
  setCurrentSpace: (space: Space) => void;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const SpaceProvider = ({ children }: { children: ReactNode }) => {
  const [currentSpace, setCurrentSpaceState] = useState<Space>(() => {
    // Récupérer l'espace depuis localStorage ou défaut à 'naturopathie'
    const saved = localStorage.getItem('brewsy-current-space');
    return (saved as Space) || 'naturopathie';
  });

  const setCurrentSpace = (space: Space) => {
    setCurrentSpaceState(space);
    localStorage.setItem('brewsy-current-space', space);

    // Appliquer le thème CSS
    if (space === 'naturopathie') {
      document.body.classList.add('theme-drogue');
      document.body.classList.remove('theme-malandrinerie');
    } else {
      document.body.classList.add('theme-malandrinerie');
      document.body.classList.remove('theme-drogue');
    }
  };

  // Appliquer le thème au chargement initial
  useEffect(() => {
    if (currentSpace === 'naturopathie') {
      document.body.classList.add('theme-drogue');
      document.body.classList.remove('theme-malandrinerie');
    } else {
      document.body.classList.add('theme-malandrinerie');
      document.body.classList.remove('theme-drogue');
    }
  }, [currentSpace]);

  return (
    <SpaceContext.Provider value={{ currentSpace, setCurrentSpace }}>
      {children}
    </SpaceContext.Provider>
  );
};

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (context === undefined) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};
