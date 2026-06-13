import confetti from "canvas-confetti";

export function fireCertificateConfetti(): void {
  const duration = 3500;
  const end = Date.now() + duration;
  const colors = ["#2dd4bf", "#22d3ee", "#fbbf24", "#34d399", "#ffffff"];

  function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }

  // Opening burst
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.55 },
    colors,
    zIndex: 9999,
  });

  confetti({
    particleCount: 60,
    spread: 160,
    startVelocity: 35,
    scalar: 1.1,
    origin: { y: 0.4 },
    colors,
    zIndex: 9999,
  });

  frame();
}
