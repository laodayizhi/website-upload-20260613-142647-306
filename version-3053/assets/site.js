(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function next() {
      show((current + 1) % slides.length);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupSearch() {
    var input = document.querySelector('[data-search-input]');
    var status = document.querySelector('[data-search-status]');
    var cards = selectAll('[data-search-card]');
    if (!input || !cards.length) {
      return;
    }

    function filter() {
      var query = input.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          shown += 1;
        }
      });
      if (status) {
        status.textContent = '当前显示 ' + shown + ' 部影片';
      }
    }

    input.addEventListener('input', filter);
    filter();
  }

  function setupBackTop() {
    var button = document.createElement('button');
    button.className = 'back-top';
    button.type = 'button';
    button.setAttribute('aria-label', '回到顶部');
    button.textContent = '↑';
    document.body.appendChild(button);

    function refresh() {
      button.classList.toggle('is-visible', window.scrollY > 360);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', refresh);
    refresh();
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-player-overlay]');
    var source = player.getAttribute('data-video-url');
    var started = false;
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source || started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    player.addEventListener('click', function (event) {
      if (event.target === player) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayer();
    setupBackTop();
  });
})();
