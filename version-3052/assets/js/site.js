(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (navButton && navLinks) {
    navButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener('click', function () {
      showSlide(dotIndex);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.js-video-player'));

    players.forEach(function (video) {
      var source = video.getAttribute('data-src');
      var box = video.closest('.player-box');
      var overlay = box ? box.querySelector('.player-overlay') : null;
      var started = false;
      var hlsInstance = null;

      function startPlayer() {
        if (!source) {
          return;
        }

        if (!started) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }
          started = true;
        }

        if (overlay) {
          overlay.classList.add('is-hidden');
        }

        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener('click', startPlayer);
      }

      video.addEventListener('click', function () {
        if (!started) {
          startPlayer();
        }
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">'
      + '<a class="poster" href="' + escapeHTML(movie.url) + '" title="' + escapeHTML(movie.title) + '">'
      + '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy" onerror="this.classList.add(\'is-missing\')">'
      + '<span class="poster-shade"></span>'
      + '<span class="poster-play">立即观看</span>'
      + '</a>'
      + '<div class="movie-card-body">'
      + '<div class="movie-meta-line"><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.type) + '</span></div>'
      + '<h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>'
      + '<p>' + escapeHTML(movie.oneLine) + '</p>'
      + '<div class="tag-row">' + tags + '</div>'
      + '</div>'
      + '</article>';
  }

  function setupSearch() {
    var searchPage = document.querySelector('[data-search-page]');
    if (!searchPage || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = searchPage.querySelector('[data-search-input]');
    var typeSelect = searchPage.querySelector('[data-type-filter]');
    var yearSelect = searchPage.querySelector('[data-year-filter]');
    var results = searchPage.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function getText(movie) {
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
    }

    function applySearch() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var items = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var matchesQuery = !query || getText(movie).indexOf(query) !== -1;
        var matchesType = !typeValue || movie.type.indexOf(typeValue) !== -1;
        var matchesYear = !yearValue || String(movie.year) === yearValue;
        return matchesQuery && matchesType && matchesYear;
      }).slice(0, 60);

      if (!items.length) {
        results.innerHTML = '<div class="copy-card"><h2>没有找到匹配影片</h2><p>可以尝试更换关键词、年份或类型继续搜索。</p></div>';
        return;
      }

      results.innerHTML = items.map(renderSearchCard).join('');
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    applySearch();
  }

  setupPlayers();
  setupSearch();
})();
