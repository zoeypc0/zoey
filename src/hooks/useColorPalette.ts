import { useState, useEffect, useCallback } from 'react';

export type ColorPalette = 'rose-blue' | 'ocean' | 'aurora' | 'sunset';

export const useColorPalette = () => {
  const [palette, setPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('zoey-color-palette');
    return (saved as ColorPalette) || 'rose-blue';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply palette-specific CSS variables
    switch (palette) {
      case 'rose-blue':
        root.style.setProperty('--primary', '210 80% 60%');
        root.style.setProperty('--secondary', '320 70% 60%');
        root.style.setProperty('--accent', '280 65% 60%');
        break;
      case 'ocean':
        root.style.setProperty('--primary', '200 85% 55%');
        root.style.setProperty('--secondary', '180 75% 50%');
        root.style.setProperty('--accent', '160 70% 55%');
        break;
      case 'aurora':
        root.style.setProperty('--primary', '160 75% 50%');
        root.style.setProperty('--secondary', '280 70% 55%');
        root.style.setProperty('--accent', '200 80% 55%');
        break;
      case 'sunset':
        root.style.setProperty('--primary', '20 85% 55%');
        root.style.setProperty('--secondary', '340 75% 55%');
        root.style.setProperty('--accent', '45 80% 55%');
        break;
    }
    
    localStorage.setItem('zoey-color-palette', palette);
  }, [palette]);

  const setPaletteValue = useCallback((newPalette: ColorPalette) => {
    setPalette(newPalette);
  }, []);

  return { palette, setPalette: setPaletteValue };
};