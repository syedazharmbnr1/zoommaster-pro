import { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useConfig } from "../context/ConfigContext";

/**
 * Hook for managing particle animations for galactic theme
 */
export function useParticleEffect() {
  const { theme } = useTheme();
  const { particles, setParticles } = useConfig();

  useEffect(() => {
    if (theme !== "galactic") {
      setParticles([]);
      return;
    }
    
    const initParticles = () => {
      const newParticles = Array.from({ length: 150 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
      }));
      setParticles(newParticles);
    };

    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y > window.innerHeight ? 0 : p.y + p.speed,
          x: p.x + Math.sin(p.y * 0.01) * 3,
        }))
      );
      requestAnimationFrame(animateParticles);
    };

    initParticles();
    const animationId = requestAnimationFrame(animateParticles);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [theme]);

  return particles;
}
