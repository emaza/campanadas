import React from 'react';

interface CheekyFaceProps {
  grapeCount: number; // 0 to 12
  isEating: boolean;  // Triggers mouth open animation
  isCelebrating?: boolean; // Triggers kissing animation and cheek reset
  mouthRef?: React.RefObject<SVGGElement>;
}

const CheekyFace: React.FC<CheekyFaceProps> = ({ grapeCount, isEating, isCelebrating, mouthRef }) => {
  // Cap the count visually at 12
  // If celebrating, reset cheeks to normal size (count 0)
  const safeCount = isCelebrating ? 0 : Math.min(Math.max(grapeCount, 0), 12);
  
  // Scale cheeks based on grapes eaten. 
  // Base scale 1. Reduced growth factor from 0.15 to 0.08 so they don't explode off the face at 12 grapes.
  const cheekScale = 1 + (safeCount * 0.08);

  // Mouth Configuration
  let mouthElement;
  let mouthScale = 1;

  if (isCelebrating) {
      // Kissing Face: Small heart-shaped mouth with animation class
      mouthElement = (
        <path 
          d="M 100 155 C 100 155 90 140 90 135 C 90 128 98 128 100 135 C 102 128 110 128 110 135 C 110 140 100 155 100 155 Z" 
          fill="#e11d48" 
          className="kiss-anim"
        />
      );
      mouthScale = 1.2; 
  } else if (isEating) {
      // Open Mouth (Eating): Big dark circle
      mouthElement = <circle cx="100" cy="140" r="15" fill="#3f0c18" />;
      mouthScale = 1.5;
  } else {
      // Normal/Stuffed Mouth: Ellipse that gets smaller as cheeks grow
      mouthElement = <ellipse cx="100" cy="140" rx="15" ry="8" fill="#be123c" />;
      // Shrink mouth as cheeks grow to look "full"
      mouthScale = Math.max(0.5, 1 - (safeCount * 0.05));
  }

  return (
    <div className="w-full h-full flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in">
      <style>{`
        @keyframes kiss {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .kiss-anim {
          animation: kiss 0.6s infinite ease-in-out;
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>

      {/* Head */}
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
        {/* Face Background - Semi transparent to blend with clock if needed, or opaque to cover */}
        <circle cx="100" cy="100" r="95" fill="#fcd34d" stroke="#b45309" strokeWidth="4" className="shadow-inner" />
        
        {/* Left Cheek */}
        <g style={{ transform: `translate(40px, 110px) scale(${cheekScale}) translate(-40px, -110px)` }} className="transition-transform duration-500 ease-in-out">
          <circle cx="40" cy="110" r="20" fill="#fb923c" opacity="0.6" />
        </g>
        
        {/* Right Cheek */}
        <g style={{ transform: `translate(160px, 110px) scale(${cheekScale}) translate(-160px, -110px)` }} className="transition-transform duration-500 ease-in-out">
           <circle cx="160" cy="110" r="20" fill="#fb923c" opacity="0.6" />
        </g>

        {/* Eyes */}
        {isEating ? (
            // Effort eyes (closed tight lines)
            <>
                <path d="M 55 75 L 75 75" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                <path d="M 125 75 L 145 75" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            </>
        ) : isCelebrating ? (
            // Happy Eyes (inverted arcs)
            <>
                 <path d="M 55 75 Q 65 60 75 75" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
                 <path d="M 125 75 Q 135 60 145 75" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
        ) : (
            // Normal eyes
            <>
                <circle cx="65" cy="75" r="10" fill="#1e293b" />
                <circle cx="135" cy="75" r="10" fill="#1e293b" />
            </>
        )}
        
        {/* Eyebrows */}
        <path d="M 50 55 Q 65 40 80 55" stroke="#1e293b" strokeWidth="4" fill="none" style={{ transform: `translateY(${safeCount * -2}px)` }} />
        <path d="M 120 55 Q 135 40 150 55" stroke="#1e293b" strokeWidth="4" fill="none" style={{ transform: `translateY(${safeCount * -2}px)` }} />

        {/* Mouth */}
         <g ref={mouthRef} style={{ transform: `translate(100px, 140px) scale(${mouthScale}) translate(-100px, -140px)` }} className="transition-transform duration-300">
           {mouthElement}
         </g>
      </svg>
    </div>
  );
};

export default CheekyFace;