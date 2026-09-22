// src/pages/QRPage.jsx
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

export default function QRPage() {
  const { gameId } = useParams();
  const joinUrl = `${window.location.origin}/join/${gameId}`;

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #901b1e 0%, #4a0000 100%)",
      padding: "2rem"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        padding: "3rem",
        borderRadius: "24px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2rem",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <h1 style={{
          color: "#ffffff",
          fontSize: "2rem",
          fontWeight: 800,
          margin: 0,
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }}>
          Scan to Join
        </h1>
        
        <div style={{
          background: "#ffffff",
          padding: "1.5rem",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
        }}>
          <QRCodeSVG
            value={joinUrl}
            size={300}
            bgColor="#ffffff"
            fgColor="#901b1e"
            level="H"
            includeMargin={false}
          />
        </div>

        <div style={{
          background: "rgba(0,0,0,0.3)",
          padding: "1rem 2rem",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <span style={{ 
            color: "#fca5a5", 
            fontSize: "1rem", 
            fontWeight: 600, 
            textTransform: "uppercase", 
            letterSpacing: "0.1em" 
          }}>
            Game ID
          </span>
          <span style={{ 
            color: "#ffffff", 
            fontSize: "2rem", 
            fontWeight: 800, 
            letterSpacing: "0.15em",
            fontFamily: "monospace"
          }}>
            {gameId}
          </span>
        </div>
      </div>
    </div>
  );
}
