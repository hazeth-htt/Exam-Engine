"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Button } from "./button";

type ModalType = "alert" | "confirm" | "prompt";

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title?: string;
  message: string;
  defaultValue?: string;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}

interface ModalContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState | null>(null);
  const [inputValue, setInputValue] = useState("");

  const showAlert = (message: string, title?: string) => {
    return new Promise<void>((resolve) => {
      setModal({
        isOpen: true,
        type: "alert",
        message,
        title,
        onConfirm: () => {
          setModal(null);
          resolve();
        },
        onCancel: () => {
          setModal(null);
          resolve();
        }
      });
    });
  };

  const showConfirm = (message: string, title?: string) => {
    return new Promise<boolean>((resolve) => {
      setModal({
        isOpen: true,
        type: "confirm",
        message,
        title,
        onConfirm: () => {
          setModal(null);
          resolve(true);
        },
        onCancel: () => {
          setModal(null);
          resolve(false);
        }
      });
    });
  };

  const showPrompt = (message: string, defaultValue = "", title?: string) => {
    setInputValue(defaultValue);
    return new Promise<string | null>((resolve) => {
      setModal({
        isOpen: true,
        type: "prompt",
        message,
        title,
        defaultValue,
        onConfirm: (val) => {
          setModal(null);
          resolve(val || "");
        },
        onCancel: () => {
          setModal(null);
          resolve(null);
        }
      });
    });
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {modal?.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[20px] shadow-xl border border-black/5 w-full max-w-[400px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              {modal.title && <h3 className="text-[18px] font-semibold text-foreground mb-2">{modal.title}</h3>}
              <p className="text-[14px] text-muted-foreground mb-5 leading-relaxed">{modal.message}</p>
              
              {modal.type === "prompt" && (
                <input 
                  type="text" 
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-[12px] text-[14px] focus:outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)_inset] mb-2 text-foreground"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') modal.onConfirm(inputValue);
                    if (e.key === 'Escape') modal.onCancel();
                  }}
                />
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                {modal.type !== "alert" && (
                  <Button variant="outline" onClick={modal.onCancel} className="rounded-[12px] h-9 px-4 text-[13px]">Hủy</Button>
                )}
                <Button 
                  onClick={() => modal.onConfirm(modal.type === 'prompt' ? inputValue : undefined)}
                  className="rounded-[12px] h-9 px-4 text-[13px]"
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
