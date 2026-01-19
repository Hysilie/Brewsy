import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children, actions }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-soft-lg shadow-soft-lg border border-border max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-soft flex items-center justify-center hover:bg-surface transition-colors text-text-muted hover:text-text"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 text-text-secondary">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
