export default function antiCopy() {
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey && ['c','x','v'].includes(e.key.toLowerCase())) || e.key === 'F12') e.preventDefault();
  });
}
