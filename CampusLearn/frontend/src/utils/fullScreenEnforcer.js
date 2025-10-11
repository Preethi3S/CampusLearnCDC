export default function fullScreenEnforcer() {
  document.documentElement.requestFullscreen?.();
  window.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) alert('You must stay in fullscreen to take the quiz!');
  });
}
