import React from 'react';

// A purely aesthetic component to mimic the "Zen" feel. 
// A real visualizer requires AudioContext connection which is complex with pure HTMLAudioElement without crossing CORS issues locally sometimes.
// We will use a CSS animation to simulate life.
export const AmbientBackdrop: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-800/10 rounded-full blur-[100px] transition-all duration-[3000ms] ${isPlaying ? 'scale-110 opacity-60' : 'scale-90 opacity-20'}`} />
       <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neutral-700/10 rounded-full blur-[80px] transition-all duration-[2000ms] ${isPlaying ? 'scale-125 opacity-50' : 'scale-100 opacity-20'}`} />
    </div>
  );
};