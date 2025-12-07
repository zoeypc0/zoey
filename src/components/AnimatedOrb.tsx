import { useEffect, useRef } from 'react';
import { ColorPalette } from '@/hooks/useColorPalette';

interface AnimatedOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: number;
  colorPalette?: ColorPalette;
}

const palettes = {
  'rose-blue': {
    core: [{ h: 320, s: 70, l: 65 }, { h: 280, s: 65, l: 60 }, { h: 210, s: 80, l: 60 }, { h: 195, s: 75, l: 55 }],
    glow: { h: 280, s: 70, l: 60 }, accent: { h: 320, s: 75, l: 70 },
  },
  'ocean': {
    core: [{ h: 200, s: 85, l: 55 }, { h: 180, s: 75, l: 50 }, { h: 160, s: 70, l: 55 }, { h: 220, s: 80, l: 60 }],
    glow: { h: 190, s: 80, l: 55 }, accent: { h: 170, s: 75, l: 60 },
  },
  'aurora': {
    core: [{ h: 280, s: 70, l: 55 }, { h: 160, s: 75, l: 50 }, { h: 200, s: 80, l: 55 }, { h: 320, s: 65, l: 60 }],
    glow: { h: 160, s: 75, l: 55 }, accent: { h: 280, s: 70, l: 65 },
  },
  'sunset': {
    core: [{ h: 20, s: 85, l: 55 }, { h: 340, s: 75, l: 55 }, { h: 45, s: 80, l: 55 }, { h: 280, s: 60, l: 50 }],
    glow: { h: 30, s: 80, l: 55 }, accent: { h: 350, s: 75, l: 60 },
  },
};

const AnimatedOrb = ({ isListening = false, isSpeaking = false, size = 340, colorPalette = 'rose-blue' }: AnimatedOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.32;
    const palette = palettes[colorPalette];

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      timeRef.current += 0.006;
      const t = timeRef.current;
      const intensity = isSpeaking ? 1.4 : isListening ? 1.2 : 1;
      const pulseSpeed = isSpeaking ? 3 : isListening ? 2.5 : 1.2;
      const breathScale = 1 + Math.sin(t * pulseSpeed) * 0.025 * intensity;

      // Outer glow
      for (let i = 4; i >= 0; i--) {
        const glowRadius = baseRadius * (1.8 + i * 0.4) * breathScale;
        const alpha = 0.04 - i * 0.006;
        const { h, s, l } = palette.glow;
        const glowGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, glowRadius);
        glowGrad.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, ${alpha * intensity})`);
        glowGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      }

      // Flowing color blobs
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale, 0, Math.PI * 2);
      ctx.clip();
      palette.core.forEach((color, index) => {
        const angle = t * 0.3 + (index * Math.PI / 2);
        const offsetX = Math.cos(angle) * baseRadius * 0.35;
        const offsetY = Math.sin(angle) * baseRadius * 0.35;
        const blobRadius = baseRadius * (0.7 + Math.sin(t * 0.8 + index) * 0.15);
        const blobGrad = ctx.createRadialGradient(centerX + offsetX, centerY + offsetY, 0, centerX + offsetX, centerY + offsetY, blobRadius);
        blobGrad.addColorStop(0, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.8)`);
        blobGrad.addColorStop(0.5, `hsla(${color.h}, ${color.s}%, ${color.l}%, 0.4)`);
        blobGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(centerX + offsetX, centerY + offsetY, blobRadius, 0, Math.PI * 2);
        ctx.fillStyle = blobGrad;
        ctx.fill();
      });
      ctx.restore();

      // Highlight
      const highlightGrad = ctx.createRadialGradient(centerX - baseRadius * 0.35, centerY - baseRadius * 0.4, 0, centerX, centerY, baseRadius * 0.5);
      highlightGrad.addColorStop(0, 'hsla(0, 0%, 100%, 0.5)');
      highlightGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale, 0, Math.PI * 2);
      ctx.fillStyle = highlightGrad;
      ctx.fill();

      // Animated rings when active
      if (isSpeaking || isListening) {
        for (let ring = 0; ring < 3; ring++) {
          const phase = (t * pulseSpeed * 1.5 + ring * 0.5) % 1;
          const ringRadius = baseRadius * (1 + phase * 0.4) * breathScale;
          const ringAlpha = (1 - phase) * 0.2 * intensity;
          const ringColor = palette.accent;
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${ringColor.h}, ${ringColor.s}%, ${ringColor.l}%, ${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [size, isListening, isSpeaking, colorPalette]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, animation: 'float-gentle 8s ease-in-out infinite' }} />;
};

export default AnimatedOrb;