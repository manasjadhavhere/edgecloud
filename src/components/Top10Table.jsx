// src/components/Top10Table.jsx
import { useEffect, useState } from "react";

const RANK_COLORS = [
  { bg: "linear-gradient(135deg,#F59E0B,#EF4444)", color: "#fff" },  // 1 — gold
  { bg: "linear-gradient(135deg,#9CA3AF,#6B7280)", color: "#fff" },  // 2 — silver
  { bg: "linear-gradient(135deg,#B45309,#92400E)", color: "#fff" },  // 3 — bronze
];

export default function Top10Table({ words }) {
  const [visible, setVisible] = useState(0);
  const top10 = words.slice(0, 10);
  const maxVal = top10[0]?.value || 1;

  // Stagger rows appearing one by one
  useEffect(() => {
    setVisible(0);
    if (top10.length === 0) return;
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setVisible(i);
      if (i >= top10.length) clearInterval(timer);
    }, 120);
    return () => clearInterval(timer);
  }, [words.length]);

  if (top10.length === 0) return null;

  return (
    <table className="rank-table">
      <thead>
        <tr>
          <th style={{ width: 50 }}>#</th>
          <th>Word</th>
          <th style={{ width: 200 }}>Frequency</th>
          <th style={{ width: 60, textAlign: "right" }}>Count</th>
        </tr>
      </thead>
      <tbody>
        {top10.map((item, i) => {
          const pct = Math.round((item.value / maxVal) * 100);
          const rankStyle = RANK_COLORS[i] || {
            bg: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
            color: "#fff",
          };
          return (
            <tr
              key={item.text}
              style={{
                opacity: i < visible ? 1 : 0,
                transform: i < visible ? "translateX(0)" : "translateX(-20px)",
                transition: "opacity 0.4s ease, transform 0.4s ease",
              }}
            >
              <td>
                <div
                  className="rank-num"
                  style={{ background: rankStyle.bg, color: rankStyle.color }}
                >
                  {i + 1}
                </div>
              </td>
              <td>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  color: "var(--text)",
                }}>
                  {item.text}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-1">
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </td>
              <td style={{ textAlign: "right" }}>
                <span className="badge badge-blue">{item.value}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
