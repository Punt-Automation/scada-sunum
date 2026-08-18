(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var themeToggle = document.querySelector('.theme-toggle');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link[data-section]'));

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function updateThemeControls() {
    if (!themeToggle) return;
    var isLight = currentTheme() === 'light';
    var isEnglish = document.documentElement.lang === 'en';
    var label = isEnglish
      ? (isLight ? 'Switch to dark theme' : 'Switch to light theme')
      : (isLight ? 'Koyu temaya geç' : 'Açık temaya geç');
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.setAttribute('aria-pressed', String(isLight));
  }

  function applyTheme(theme, remember) {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.backgroundColor = theme === 'light' ? '#f3f6f8' : '#0b0f19';
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f3f6f8' : '#0b0f19');
    if (remember) {
      try { localStorage.setItem('punt-theme', theme); } catch (error) {}
    }
    updateThemeControls();
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      applyTheme(currentTheme() === 'light' ? 'dark' : 'light', true);
    });
  }

  updateThemeControls();

  if (window.matchMedia) {
    var themeMedia = window.matchMedia('(prefers-color-scheme: light)');
    if (themeMedia.addEventListener) {
      themeMedia.addEventListener('change', function (event) {
        var hasSavedTheme = false;
        try { hasSavedTheme = Boolean(localStorage.getItem('punt-theme')); } catch (error) {}
        if (!hasSavedTheme) applyTheme(event.matches ? 'light' : 'dark', false);
      });
    }
  }

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      var isOpen = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      if (header) header.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && header) {
      header.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }
  });

  var sections = navLinks.map(function (link) {
    return document.getElementById(link.getAttribute('data-section'));
  }).filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var active = link.getAttribute('data-section') === entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'page');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-28% 0px -62% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  var lightbox = document.getElementById('image-lightbox');
  if (lightbox) {
    lightbox.setAttribute('aria-modal', 'true');
    Array.prototype.slice.call(document.querySelectorAll('img.screenshot')).forEach(function (image) {
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          image.click();
        }
      });
    });
  }
})();
