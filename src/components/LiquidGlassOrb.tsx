import { useEffect, useRef } from 'react';

interface LiquidGlassOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  size?: number;
}

const LiquidGlassOrb = ({ isListening = false, isSpeaking = false, size = 360 }: LiquidGlassOrbProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size * 0.38;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      timeRef.current += 0.008;
      const t = timeRef.current;

      const intensity = isSpeaking ? 1.3 : isListening ? 1.15 : 1;
      const pulseSpeed = isSpeaking ? 4 : isListening ? 3 : 1.5;

      // Soft breathing scale
      const breathScale = 1 + Math.sin(t * pulseSpeed) * 0.02 * intensity;

      // Main orb - soft blue sphere like reference
      ctx.save();
      
      // Draw the main sphere with soft blue gradient
      const sphereGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.35,
        centerY - baseRadius * 0.35,
        0,
        centerX,
        centerY,
        baseRadius * breathScale
      );
      
      // Soft blue gradient like the reference image
      sphereGradient.addColorStop(0, 'hsla(200, 85%, 75%, 0.95)');
      sphereGradient.addColorStop(0.15, 'hsla(210, 80%, 65%, 0.9)');
      sphereGradient.addColorStop(0.35, 'hsla(220, 75%, 55%, 0.85)');
      sphereGradient.addColorStop(0.55, 'hsla(225, 70%, 45%, 0.9)');
      sphereGradient.addColorStop(0.75, 'hsla(230, 65%, 35%, 0.95)');
      sphereGradient.addColorStop(1, 'hsla(235, 60%, 25%, 1)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale, 0, Math.PI * 2);
      ctx.fillStyle = sphereGradient;
      ctx.fill();

      // Inner flowing curve effect (like the reference wave)
      const waveY = centerY + Math.sin(t * 0.8) * baseRadius * 0.15;
      const curveGradient = ctx.createLinearGradient(
        centerX - baseRadius,
        waveY - baseRadius * 0.3,
        centerX + baseRadius,
        waveY + baseRadius * 0.3
      );
      curveGradient.addColorStop(0, 'hsla(200, 90%, 70%, 0)');
      curveGradient.addColorStop(0.3, 'hsla(195, 95%, 65%, 0.6)');
      curveGradient.addColorStop(0.5, 'hsla(190, 100%, 60%, 0.8)');
      curveGradient.addColorStop(0.7, 'hsla(195, 95%, 65%, 0.6)');
      curveGradient.addColorStop(1, 'hsla(200, 90%, 70%, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale * 0.98, 0, Math.PI * 2);
      ctx.clip();

      // Draw the flowing wave curve
      ctx.beginPath();
      ctx.moveTo(centerX - baseRadius, waveY);
      
      const waveAmplitude = baseRadius * 0.25;
      const curveOffset = Math.sin(t * 0.5) * 20;
      
      ctx.bezierCurveTo(
        centerX - baseRadius * 0.5, waveY - waveAmplitude + curveOffset,
        centerX, waveY + waveAmplitude * 0.5 + curveOffset,
        centerX + baseRadius, waveY - waveAmplitude * 0.3 + curveOffset
      );
      ctx.lineTo(centerX + baseRadius, centerY + baseRadius);
      ctx.lineTo(centerX - baseRadius, centerY + baseRadius);
      ctx.closePath();
      
      ctx.fillStyle = curveGradient;
      ctx.globalAlpha = 0.5 + Math.sin(t * 0.7) * 0.15;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      // Top highlight (soft shine)
      const highlightGradient = ctx.createRadialGradient(
        centerX - baseRadius * 0.25,
        centerY - baseRadius * 0.3,
        0,
        centerX - baseRadius * 0.1,
        centerY - baseRadius * 0.15,
        baseRadius * 0.6
      );
      highlightGradient.addColorStop(0, 'hsla(200, 100%, 95%, 0.5)');
      highlightGradient.addColorStop(0.3, 'hsla(210, 90%, 85%, 0.25)');
      highlightGradient.addColorStop(0.6, 'hsla(220, 80%, 80%, 0.1)');
      highlightGradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale, 0, Math.PI * 2);
      ctx.fillStyle = highlightGradient;
      ctx.fill();

      // Subtle rim light
      const rimGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.85 * breathScale,
        centerX,
        centerY,
        baseRadius * breathScale
      );
      rimGradient.addColorStop(0, 'transparent');
      rimGradient.addColorStop(0.5, 'hsla(210, 80%, 70%, 0.15)');
      rimGradient.addColorStop(1, 'hsla(220, 70%, 50%, 0.05)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * breathScale, 0, Math.PI * 2);
      ctx.fillStyle = rimGradient;
      ctx.fill();

      ctx.restore();

      // Outer soft glow (blends with background)
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.7,
        centerX, centerY, baseRadius * 2
      );
      outerGlow.addColorStop(0, `hsla(210, 70%, 55%, ${0.15 * intensity})`);
      outerGlow.addColorStop(0.3, `hsla(220, 60%, 50%, ${0.08 * intensity})`);
      outerGlow.addColorStop(0.6, `hsla(225, 50%, 45%, ${0.04 * intensity})`);
      outerGlow.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // Speaking/listening aura effect
      if (isSpeaking || isListening) {
        const auraPhase = (Math.sin(t * pulseSpeed * 2) + 1) / 2;
        const hue = isSpeaking ? 200 : 210;
        
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = baseRadius * (1.15 + ring * 0.1 + auraPhase * 0.05) * breathScale;
          const ringAlpha = (0.25 - ring * 0.07) * auraPhase;
          
          const auraGradient = ctx.createRadialGradient(
            centerX, centerY, baseRadius * breathScale,
            centerX, centerY, ringRadius
          );
          auraGradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${ringAlpha})`);
          auraGradient.addColorStop(0.5, `hsla(${hue + 10}, 70%, 55%, ${ringAlpha * 0.5})`);
          auraGradient.addColorStop(1, 'transparent');
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
          ctx.fillStyle = auraGradient;
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [size, isListening, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      style={{ 
        width: size, 
        height: size,
        animation: 'float-gentle 8s ease-in-out infinite'
      }}
    />
  );
};

export default LiquidGlassOrb;