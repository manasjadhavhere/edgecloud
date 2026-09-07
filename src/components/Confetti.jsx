// src/components/Confetti.jsx
import { useEffect } from "react";

const COLORS = ["#3B82F6","#8B5CF6","#F97316","#10B981","#EC4899","#F59E0B","#06B6D4"];

export default function Confetti({ active }) {
  useEffect(() => {
    if (!active) return;

    const pieces = [];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        animation-duration: ${2 + Math.random() * 3}s;
        animation-delay: ${Math.random() * 2}s;
        transform: rotate(${Math.random() * 360}deg);
      `;
      document.body.appendChild(el);
      pieces.push(el);
    }

    const cleanup = setTimeout(() => {
      pieces.forEach((el) => el.remove());
    }, 6000);

    return () => {
      clearTimeout(cleanup);
      pieces.forEach((el) => el.remove());
    };
  }, [active]);

  return null;
}
