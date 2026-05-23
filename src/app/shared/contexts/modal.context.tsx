import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Modal, type ModalSize } from '@app/shared/components/common';

interface ModalConfig {
  title?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ModalConfig | null>(null);

  const openModal = useCallback((next: ModalConfig) => setConfig(next), []);
  const closeModal = useCallback(() => setConfig(null), []);

  const value = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        isOpen={!!config}
        onClose={closeModal}
        title={config?.title}
        footer={config?.footer}
        size={config?.size}
      >
        {config?.content}
      </Modal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
};
