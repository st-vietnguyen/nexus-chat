import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ImagePreviewModal } from '@app/shared/components/common/ImagePreviewModal';

export interface PreviewImage {
  id: string;
  url: string;
  alt?: string;
}

interface OpenPreviewOptions {
  images?: PreviewImage[];
}

interface ImagePreviewState {
  images: PreviewImage[];
  currentIndex: number;
}

interface ImagePreviewContextType {
  isOpen: boolean;
  images: PreviewImage[];
  currentIndex: number;
  currentImage: PreviewImage | null;
  openPreview: (image: PreviewImage, options?: OpenPreviewOptions) => void;
  closePreview: () => void;
  nextImage: () => void;
  previousImage: () => void;
}

const ImagePreviewContext = createContext<ImagePreviewContextType | null>(null);

export const ImagePreviewProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ImagePreviewState | null>(null);

  const openPreview = useCallback(
    (image: PreviewImage, options?: OpenPreviewOptions) => {
      const collection = options?.images?.length ? options.images : [image];
      const index = collection.findIndex((item) => item.id === image.id);
      setState({
        images: collection,
        currentIndex: index >= 0 ? index : 0,
      });
    },
    [],
  );

  const closePreview = useCallback(
    () => setState((prev) => (prev === null ? prev : null)),
    [],
  );

  const nextImage = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.images.length < 2) return prev;
      const nextIndex = (prev.currentIndex + 1) % prev.images.length;
      return { ...prev, currentIndex: nextIndex };
    });
  }, []);

  const previousImage = useCallback(() => {
    setState((prev) => {
      if (!prev || prev.images.length < 2) return prev;
      const prevIndex =
        (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: prevIndex };
    });
  }, []);

  const value = useMemo<ImagePreviewContextType>(() => {
    const images = state?.images ?? [];
    const currentIndex = state?.currentIndex ?? 0;
    const currentImage = state ? (images[currentIndex] ?? null) : null;
    return {
      isOpen: !!state,
      images,
      currentIndex,
      currentImage,
      openPreview,
      closePreview,
      nextImage,
      previousImage,
    };
  }, [state, openPreview, closePreview, nextImage, previousImage]);

  return (
    <ImagePreviewContext.Provider value={value}>
      {children}
      <ImagePreviewModal
        isOpen={value.isOpen}
        images={value.images}
        currentIndex={value.currentIndex}
        onClose={value.closePreview}
        onNext={value.nextImage}
        onPrevious={value.previousImage}
      />
    </ImagePreviewContext.Provider>
  );
};

export const useImagePreview = () => {
  const ctx = useContext(ImagePreviewContext);
  if (!ctx)
    throw new Error('useImagePreview must be used within ImagePreviewProvider');
  return ctx;
};
