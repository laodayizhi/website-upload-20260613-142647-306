(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var searchResults = document.getElementById("search-results");
    var searchTitle = document.getElementById("search-title");
    var searchInput = document.getElementById("search-input");
    if (searchResults && window.SEARCH_ITEMS) {
      var params = new URLSearchParams(window.location.search);
      var query = (params.get("q") || "").trim();
      if (searchInput) {
        searchInput.value = query;
      }
      renderSearch(query);
    }

    function renderSearch(query) {
      var words = query.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        searchResults.innerHTML = "";
        return;
      }
      var results = window.SEARCH_ITEMS.filter(function (item) {
        var haystack = item.text.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 80);

      if (searchTitle) {
        searchTitle.textContent = "“" + query + "” 的搜索结果（" + results.length + "）";
      }

      searchResults.innerHTML = results.map(function (item) {
        return [
          '<article class="movie-card">',
          '<a class="poster-link" href="' + item.url + '">',
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
          '<span class="play-hover">▶</span>',
          '<span class="duration-badge">' + escapeHtml(item.duration) + '</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<div class="movie-meta-line"><span>' + item.year + '</span><span>' + escapeHtml(item.category) + '</span></div>',
          '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
          '<p>' + escapeHtml(item.oneLine) + '</p>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
})();
