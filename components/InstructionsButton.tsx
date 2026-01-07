import React from 'react';

interface InstructionsButtonProps {
  onClick: () => void;
}

const InstructionsButton: React.FC<InstructionsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        absolute top-1/2 right-2 md:right-4 lg:right-8 z-20 transform -translate-y-1/2
        w-10 h-10 md:w-12 md:h-12
        bg-slate-800 hover:bg-slate-700
        text-slate-300 text-2xl md:text-3xl font-bold
        border-2 border-slate-600 rounded-full
        flex items-center justify-center
        transition-all hover:scale-110 active:scale-95
        shadow-lg
      "
      aria-label="Mostrar instrucciones"
    >
      ?
    </button>
  );
};

export default InstructionsButton;
