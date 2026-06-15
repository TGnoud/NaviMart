import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type DialogContextType = {
  showAlert: (message: string) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  // Alert State
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Confirm State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmMessage(message);
    setOnConfirmCallback(() => onConfirm);
    setIsConfirmOpen(true);
  };

  const handleCloseAlert = () => {
    setIsAlertOpen(false);
    setTimeout(() => setAlertMessage(''), 200); // clear after animation
  };

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setTimeout(() => {
      setConfirmMessage('');
      setOnConfirmCallback(null);
    }, 200);
  };

  const handleAcceptConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    handleCloseConfirm();
  };

  return (
    <DialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      
      {/* Alert Modal */}
      {isAlertOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30 text-center animate-in zoom-in-95 duration-200">
            <div className="mb-4 text-primary">
              <span className="material-symbols-outlined text-4xl">info</span>
            </div>
            <p className="font-body-lg text-on-surface mb-6 font-medium whitespace-pre-line">{alertMessage}</p>
            <button 
              onClick={handleCloseAlert}
              className="w-full bg-primary text-on-primary font-label-md py-3 rounded-xl hover:opacity-90 transition-opacity font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-xl border border-outline-variant/30 text-center animate-in zoom-in-95 duration-200">
            <div className="mb-4 text-error">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
            <h3 className="font-headline-sm text-on-surface font-bold mb-2">Xác nhận</h3>
            <p className="font-body-lg text-on-surface-variant mb-6">{confirmMessage}</p>
            <div className="flex gap-3">
              <button 
                onClick={handleCloseConfirm}
                className="flex-1 border border-outline-variant text-on-surface-variant font-label-md py-3 rounded-xl hover:bg-surface-container-low transition-colors font-bold"
              >
                Hủy
              </button>
              <button 
                onClick={handleAcceptConfirm}
                className="flex-1 bg-error text-on-error font-label-md py-3 rounded-xl hover:opacity-90 transition-opacity font-bold shadow-sm"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
