import React from 'react';
import { TimeState } from '../types';

interface ClockProps {
  time: TimeState;
}

const Clock: React.FC<ClockProps> = ({ time }) => {
  // Calculate degrees
  const secondsDeg = (time.seconds / 60) * 360;
  const minutesDeg = ((time.minutes + time.seconds / 60) / 60) * 360;
  const hoursDeg = ((time.hours % 12 + time.minutes / 60) / 12) * 360;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 bg-white rounded-full shadow-[0_0_50px_rgba(255,215,0,0.3)] border-8 border-gray-800 flex items-center justify-center">
      {/* Clock Face Details */}
      <div className="absolute w-full h-full rounded-full border-4 border-yellow-600 box-border"></div>
      
      {/* Roman Numerals */}
      {[...Array(12)].map((_, i) => {
        const num = i + 1;
        const rotation = num * 30;
        const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][i];
        return (
          <div
            key={num}
            className="absolute w-full h-full text-center text-gray-900 font-serif font-bold text-xl md:text-3xl"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <span
              className="inline-block mt-2 md:mt-4"
              style={{ transform: `rotate(-${rotation}deg)` }}
            >
              {roman}
            </span>
          </div>
        );
      })}

      {/* Clock Hands */}
      {/* Note: left-1/2 and -translate-x-1/2 centers the hand horizontally. 
          bottom-1/2 places the bottom of the hand at the vertical center.
          origin-bottom ensures rotation happens around that bottom center point. 
      */}

      {/* Hour */}
      <div
        className="absolute w-2 md:w-3 h-16 md:h-24 bg-black origin-bottom rounded-full z-10 left-1/2 -translate-x-1/2 bottom-1/2"
        style={{ 
            transform: `translateX(-50%) rotate(${hoursDeg}deg)`,
        }}
      ></div>

      {/* Minute */}
      <div
        className="absolute w-1.5 md:w-2 h-24 md:h-36 bg-black origin-bottom rounded-full z-20 left-1/2 -translate-x-1/2 bottom-1/2"
        style={{ 
            transform: `translateX(-50%) rotate(${minutesDeg}deg)`,
        }}
      ></div>

      {/* Second */}
      <div
        className="absolute w-1 h-28 md:h-40 bg-red-600 origin-bottom rounded-full z-30 left-1/2 -translate-x-1/2 bottom-1/2"
        style={{ 
            transform: `translateX(-50%) rotate(${secondsDeg}deg)`,
        }}
      ></div>

      {/* Center Cap */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -mt-2 -ml-2 bg-yellow-600 rounded-full z-40 border-2 border-black"></div>
      
      {/* Puerta del Sol decorative top (simplified) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-12 bg-gray-800 rounded-t-full flex items-center justify-center border-b-4 border-yellow-600">
        <div className="w-24 h-1 bg-yellow-500/30"></div>
      </div>
    </div>
  );
};

export default Clock;