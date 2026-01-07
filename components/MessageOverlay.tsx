import React, { useState, useEffect, useRef } from 'react';

interface MessageOverlayProps {
  message: string;
  duration?: number;
}

const MessageOverlay: React.FC<MessageOverlayProps> = ({ message, duration = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing timer if a new message comes in
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (message) {
      setCurrentMessage(message);
      setIsVisible(true);

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, duration);
      }
    } else {
      setIsVisible(false);
    }

    // Cleanup function to clear timeout if the component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [message, duration]);

  return (
    <div
      className={`
        absolute inset-0 z-30 flex items-center justify-center p-4
        transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      aria-live="assertive"
    >
      <div
        className="
          relative transform -rotate-3
          bg-gradient-to-br from-yellow-400 to-orange-500
          text-white font-extrabold text-center
          p-6 rounded-2xl
          shadow-2xl border-4 border-black
          max-w-md
        "
        style={{ fontFamily: "'Comic Sans MS', 'Comic Neue', cursive" }}
      >
        <p className="drop-shadow-lg text-2xl md:text-3xl uppercase">{currentMessage}</p>
        {/* Decorative elements for comic style */}
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-300 rounded-full border-2 border-black opacity-50"></div>
        <div className="absolute -bottom-4 -right-2 w-12 h-12 bg-orange-400 rounded-full border-2 border-black opacity-50"></div>
      </div>
    </div>
  );
};

export default MessageOverlay;
