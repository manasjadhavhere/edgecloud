// src/components/Top10Table.jsx
import { useEffect, useState } from "react";

export default function Top10Table({ words }) {
  const [visible, setVisible] = useState(0);
  const top10  = words.slice(0, 10);
  const maxVal = top10[0]?.value || 1;

  useEffect(() => {
    setVisible(0);
    if (top10.length === 0) return;
    let i = 0;
    const timer = setInterval(() => { i += 1; setVisible(i); if (i >= top10.length) clearInterval(timer); }, 100);
    return () => clearInterval(timer);
  }, [words.length]);

  if (top10.length === 0) return null;

  return (
    <table className="rank-table">
      <thead>
        <tr>
          <th style={{ width: 50 }}>#</th>
          <th>Word</th>
          <th style={{ width: 220 }}>Frequency</th>
          <th style={{ width: 64, textAlign: "right" }}>Count</th>
        </tr>
      </thead>
      <tbody>
        {top10.map((item, i) => {
          const pct = Math.round((item.value / maxVal) * 100);
          const isTop3 = i < 3;
          return (
            <tr
              key={item.text}
              style={{
                opacity: i < visible ? 1 : 0,
                transform: i < visible ? "translateX(0)" : "translateX(-16px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
              }}
            >
              <td>
                <div className={`rank-num ${isTop3 ? "top" : ""}`}>
                  {i + 1}
                </div>
              </td>
              <td>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>
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
                <span className="badge badge-accent">{item.value}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
