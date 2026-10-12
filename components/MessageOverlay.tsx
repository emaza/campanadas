import React, { useEffect } from 'react';

interface MessageOverlayProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

/** Bocadillo flotante que sale del reloj. */
const MessageOverlay: React.FC<MessageOverlayProps> = ({ message, duration = 0, onClose }) => {
  useEffect(() => {
    if (!message || duration <= 0) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  const visible = !!message;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-[max(1rem,env(safe-area-inset-top))] z-50 flex justify-center px-4 transition-all duration-300
        ${visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}
      role="status"
      aria-live="assertive"
    >
      {visible && (
        <button
          onClick={onClose}
          className="pointer-events-auto relative max-w-sm rounded-3xl bg-piedra px-5 py-4 text-left text-lg leading-snug font-bold text-tinta shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
        >
          {message}
          <span aria-hidden="true" className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 bg-piedra" />
        </button>
      )}
    </div>
  );
};

export default MessageOverlay;
