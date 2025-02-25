import React from "react";
import { useParticleEffect } from "../../hooks/useParticleEffect";
import { useTheme } from "../../context/ThemeContext";

export function ParticleEffect() {
  const { theme } = useTheme();
  const particles = useParticleEffect();

  if (theme !== "galactic") return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: "rgba(0,255,255,0.6)",
            boxShadow: "0 0 12px rgba(0,255,255,0.8)",
            animation: `particleGlow ${p.speed * 2}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
