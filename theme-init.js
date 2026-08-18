(function () {
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('punt-theme'); } catch (error) {}

  var systemPrefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  var theme = savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : (systemPrefersLight ? 'light' : 'dark');

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.backgroundColor = theme === 'light' ? '#f3f6f8' : '#0b0f19';

  var themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f3f6f8' : '#0b0f19');
})();
