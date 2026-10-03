import React, { createContext, useContext, useState } from 'react';
import { ImageLightbox, type LightboxImage } from '../components/ImageLightbox';

interface LightboxContextType {
  openLightbox: (images: (string | LightboxImage)[], initialIndex?: number, title?: string) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export const LightboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (
    newImages: (string | LightboxImage)[],
    initialIndex: number = 0,
    title?: string
  ) => {
    const normalized: LightboxImage[] = newImages.map((img) => {
      if (typeof img === 'string') {
        return { src: img, title: title || 'The Inner Circle' };
      }
      return { ...img, title: img.title || title || 'The Inner Circle' };
    });

    setImages(normalized);
    setCurrentIndex(Math.max(0, Math.min(initialIndex, normalized.length - 1)));
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      <ImageLightbox
        isOpen={isOpen}
        images={images}
        currentIndex={currentIndex}
        onClose={closeLightbox}
        onNavigate={setCurrentIndex}
      />
    </LightboxContext.Provider>
  );
};

export const useLightbox = (): LightboxContextType => {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
};
