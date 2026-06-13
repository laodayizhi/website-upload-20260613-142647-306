(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function textValue(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMenu() {
    var toggle = document.querySelector('.mobile-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = all('.hero-slide');
    var dots = all('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupLocalFilter() {
    var list = document.getElementById('movie-list');
    if (!list) {
      return;
    }
    var search = document.getElementById('local-search');
    var type = document.getElementById('local-type');
    var chips = all('.filter-chip');
    var selected = '';
    function apply() {
      var q = textValue(search ? search.value : '');
      var t = type ? type.value : '';
      all('[data-search]', list).forEach(function (card) {
        var hay = textValue(card.getAttribute('data-search'));
        var cardType = card.getAttribute('data-type') || '';
        var matchQuery = !q || hay.indexOf(q) !== -1;
        var matchType = !t || cardType === t;
        var matchChip = !selected || hay.indexOf(selected) !== -1;
        card.classList.toggle('is-hidden', !(matchQuery && matchType && matchChip));
      });
    }
    if (search) {
      search.addEventListener('input', apply);
    }
    if (type) {
      type.addEventListener('change', apply);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        selected = textValue(chip.getAttribute('data-filter'));
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
  }

  function setupSearchPage() {
    var target = document.getElementById('search-results');
    var input = document.getElementById('search-page-input');
    if (!target || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    input.value = q;
    function render(value) {
      var query = textValue(value);
      var result = window.SEARCH_INDEX.filter(function (item) {
        return !query || textValue(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags.join(' ')).indexOf(query) !== -1;
      }).slice(0, 120);
      target.innerHTML = result.map(function (item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
          return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card">' +
          '<a class="card-media" href="' + escapeHtml(item.url) + '">' +
          '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="card-badge">' + escapeHtml(item.category) + '</span>' +
          '</a>' +
          '<div class="card-body">' +
          '<a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
          '<div class="card-tags">' + tags + '</div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
    render(q);
    input.addEventListener('input', function () {
      render(input.value);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });
}());
