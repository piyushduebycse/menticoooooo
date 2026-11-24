import confetti from 'canvas-confetti';
export function celebratePurchase() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#66301c', '#b85b2b', '#dca95a', '#edcf9a', '#8d9b75'];
  confetti({ particleCount: 100, spread: 85, startVelocity: 38, origin: { y: .65 }, colors, disableForReducedMotion: true, zIndex: 1000 });
  for (const [x, angle] of [[0, 60], [1, 120]]) {
    confetti({ particleCount: 65, angle, spread: 55, origin: { x, y: .65 }, colors, disableForReducedMotion: true, zIndex: 1000 });
  }
}
