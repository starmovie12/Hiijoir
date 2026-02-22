'use client';

import React from 'react';

export const AuroraBackground = () => {
  return (
    <>
      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
          50% { transform: scale(1.2) rotate(45deg); opacity: 0.5; }
        }
        @keyframes aurora2 {
          0%, 100% { transform: scale(1.2) rotate(0deg); opacity: 0.2; }
          50% { transform: scale(1) rotate(-30deg); opacity: 0.4; }
        }
        @keyframes aurora3 {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.3); opacity: 0.3; }
        }
        .aurora1 { animation: aurora1 20s linear infinite; will-change: transform; }
        .aurora2 { animation: aurora2 25s linear infinite; will-change: transform; }
        .aurora3 { animation: aurora3 15s linear infinite; will-change: transform; }
      `}</style>
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#03060f]">
        <div className="aurora1 absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="aurora2 absolute top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="aurora3 absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-500/15 blur-[110px]" />
      </div>
    </>
  );
};
