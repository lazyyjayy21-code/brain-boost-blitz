import { useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Hook that provides satisfying micro-animations for correct/wrong answers.
 * Correct = particle burst. Wrong = screen shake + red flash.
 */
export function useAnswerFeedback() {
  const flashRef = useRef<HTMLDivElement | null>(null);

  const correctBurst = useCallback(() => {
    // Particle burst from center
    confetti({
      particleCount: 30,
      spread: 50,
      startVelocity: 25,
      gravity: 1.2,
      ticks: 40,
      origin: { x: 0.5, y: 0.5 },
      colors: ['#7c3aed', '#2563eb', '#16a34a', '#ea580c', '#e11d48'],
      scalar: 0.7,
      disableForReducedMotion: true,
    });
  }, []);

  const wrongShake = useCallback(() => {
    // Red flash overlay
    if (flashRef.current) {
      flashRef.current.style.opacity = '1';
      setTimeout(() => {
        if (flashRef.current) flashRef.current.style.opacity = '0';
      }, 150);
    }
  }, []);

  const triggerFeedback = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      correctBurst();
    } else {
      wrongShake();
    }
  }, [correctBurst, wrongShake]);

  // The red flash overlay element — mount this in your game wrapper
  const RedFlashOverlay = () => (
    <div
      ref={flashRef}
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-150"
      style={{
        background: 'radial-gradient(circle, hsl(0 84% 60% / 0.15), hsl(0 84% 60% / 0.08))',
        opacity: 0,
      }}
    />
  );

  return { triggerFeedback, RedFlashOverlay };
}
