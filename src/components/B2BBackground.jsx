// src/components/B2BBackground.jsx
import React from 'react';

export default function B2BBackground() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none',
      opacity: 0.6
    }}>
      <div className="b2b-shape shape-1"></div>
      <div className="b2b-shape shape-2"></div>
      <div className="b2b-shape shape-3"></div>
      
      <style>{`
        .b2b-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
          animation: floatShape 20s infinite alternate ease-in-out;
        }
        .shape-1 {
          width: 500px;
          height: 500px;
          background: rgba(197, 160, 89, 0.08); /* Gold accent */
          top: -100px;
          left: -100px;
        }
        .shape-2 {
          width: 600px;
          height: 600px;
          background: rgba(0, 174, 239, 0.05); /* Tech blue accent */
          bottom: -200px;
          right: -150px;
          animation-delay: -5s;
        }
        .shape-3 {
          width: 400px;
          height: 400px;
          background: rgba(139, 24, 24, 0.05); /* Dark red accent */
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -10s;
        }
        
        @keyframes floatShape {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        
        /* Grid overlay */
        .b2b-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(15, 23, 42, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
      `}</style>
      <div className="b2b-grid-overlay"></div>
    </div>
  );
}
