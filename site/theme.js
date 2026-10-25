/* Sets the theme before the first paint, so the page never flashes the wrong colours.
   A saved choice wins; otherwise follow the system setting. app.js handles the toggle. */
(function () {
  var theme = null;
  try { theme = window.localStorage.getItem('dc-theme'); } catch (e) { theme = null; }
  if (theme !== 'light' && theme !== 'dark') {
    try { theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch (e) { theme = 'light'; }
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
