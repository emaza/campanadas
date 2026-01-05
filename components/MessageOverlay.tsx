import React from 'react';

interface MessageOverlayProps {
  message: string;
  isVisible: boolean;
}

const MessageOverlay: React.FC<MessageOverlayProps> = ({ message, isVisible }) => {
  return (
    <div
      className={`
        absolute inset-0 z-30 flex items-center justify-center p-4
        transition-opacity duration-300 ease-in-out
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
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
        <p className="drop-shadow-lg text-2xl md:text-3xl uppercase">{message}</p>
        {/* Decorative elements for comic style */}
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-300 rounded-full border-2 border-black opacity-50"></div>
        <div className="absolute -bottom-4 -right-2 w-12 h-12 bg-orange-400 rounded-full border-2 border-black opacity-50"></div>
      </div>
    </div>
  );
};

export default MessageOverlay;
