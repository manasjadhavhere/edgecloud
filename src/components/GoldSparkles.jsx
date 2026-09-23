import React from "react";

export default function GoldSparkles() {
  // Memoize random positions so they don't jump around on re-renders
  // Increased count to 350 for an extremely dense sparkling effect
  const sparkles = React.useMemo(() => {
    return Array.from({ length: 350 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 4 + 2}s`,
      size: `${Math.random() * 10 + 4}px`, // slightly smaller on average due to high density
      rotation: `${Math.random() * 90}deg`
    }));
  }, []);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {sparkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: "#FFD700", // Solid gold
            /* Creates a beautiful 4-point star/sparkle shape */
            clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
            animation: `sparkle-shine ${s.duration} ease-in-out infinite alternate`,
            animationDelay: s.delay,
            opacity: 0,
            transform: `rotate(${s.rotation})`
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-shine {
          0% { transform: translateY(0) scale(0) rotate(0deg); opacity: 0; filter: drop-shadow(0 0 2px #FFD700); }
          50% { opacity: 0.9; transform: translateY(-10px) scale(1) rotate(45deg); filter: drop-shadow(0 0 10px #FFD700); }
          100% { transform: translateY(-20px) scale(0) rotate(90deg); opacity: 0; filter: drop-shadow(0 0 2px #FFD700); }
        }
      `}</style>
    </div>
  );
}
