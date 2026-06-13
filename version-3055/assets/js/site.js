const MovieSite = (() => {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#mainNav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", () => {
      const opened = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer = null;
    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
    };
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        show(index);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(() => show(current + 1), 5200);
      });
    });
    show(0);
    timer = setInterval(() => show(current + 1), 5200);
  }

  function setupLocalFilter() {
    const input = document.querySelector("[data-local-filter]");
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    if (!input || !cards.length) {
      return;
    }
    input.addEventListener("input", () => {
      const key = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = `${card.dataset.title || ""} ${card.dataset.genre || ""} ${card.dataset.year || ""}`.toLowerCase();
        card.style.display = haystack.includes(key) ? "" : "none";
      });
    });
  }

  function setupSearchPage() {
    const box = document.querySelector("#searchResults");
    if (!box || !window.SearchIndex) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    const input = document.querySelector("#searchInput");
    if (input) {
      input.value = q;
    }
    if (!q) {
      return;
    }
    const query = q.toLowerCase();
    const list = window.SearchIndex.filter((item) => {
      return `${item.title} ${item.year} ${item.genre} ${item.tags} ${item.region}`.toLowerCase().includes(query);
    }).slice(0, 80);
    if (!list.length) {
      box.innerHTML = '<div class="empty-state">没有找到匹配内容，可以换一个关键词继续搜索。</div>';
      return;
    }
    box.innerHTML = list.map((item) => `
<article class="movie-card grid" data-title="${escapeHtml(item.title)}" data-year="${item.year}" data-genre="${escapeHtml(item.genre)}">
  <a class="poster" href="${item.href}">
    <img src="${item.cover}" alt="${escapeHtml(item.title)}" loading="lazy">
    <span class="play-dot">▶</span>
  </a>
  <div class="card-body">
    <a class="card-title" href="${item.href}">${escapeHtml(item.title)}</a>
    <div class="card-meta">
      <span>${item.year}</span>
      <span>${escapeHtml(item.type)}</span>
      <span>${escapeHtml(item.region)}</span>
    </div>
    <p>${escapeHtml(item.text)}</p>
    <div class="card-tags">
      ${item.tags.split("，").slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  </div>
</article>`).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      };
      return map[char];
    });
  }

  function attachPlayer(source) {
    ready(() => {
      const video = document.querySelector("#moviePlayer");
      const layer = document.querySelector(".play-overlay");
      if (!video || !source) {
        return;
      }
      const begin = () => {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        if (layer) {
          layer.classList.add("is-hidden");
        }
        const result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      };
      if (layer) {
        layer.addEventListener("click", begin);
      }
      video.addEventListener("click", () => {
        if (video.paused) {
          begin();
        }
      });
    });
  }

  ready(() => {
    setupMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
  });

  return {
    attachPlayer
  };
})();
