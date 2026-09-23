import React from "react";

export default function GoldSparkles() {
  // Memoize random positions so they don't jump around on re-renders
  const sparkles = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 3 + 3}s`,
      size: `${Math.random() * 4 + 3}px` // 3px to 7px
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
            background: "#FFD700",
            borderRadius: "50%",
            boxShadow: "0 0 10px 2px rgba(255, 215, 0, 0.8)",
            animation: `sparkle-float ${s.duration} ease-in-out infinite alternate`,
            animationDelay: s.delay,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes sparkle-float {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          50% { opacity: 0.9; transform: translateY(-15px) scale(1.3); }
          100% { transform: translateY(-30px) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
