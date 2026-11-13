(function () {
  var root = document.documentElement;
  function load(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  var theme = load('sd_theme');
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  root.setAttribute('data-theme', theme);

  var langs = root.getAttribute('data-translations');
  var lang = (load('sd_lang') || navigator.language || 'en').toLowerCase().split('-')[0];
  if (langs && langs.split(' ').indexOf(lang) !== -1) {
    window._langEarly = { code: lang, res: fetch('/lang/' + lang + '.json') };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try {
          sessionStorage.setItem('sd_theme', next);
        } catch (e) {}
      });
    }
    if (location.hostname.endsWith('.onion')) {
      document.querySelectorAll('a[data-onion-href]').forEach(function (link) {
        link.href = link.dataset.onionHref;
      });
    }
  });
})();
