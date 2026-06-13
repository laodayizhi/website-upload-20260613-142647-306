const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

function setupNavigation() {
  const toggle = $('[data-nav-toggle]');
  const links = $('[data-nav-links]');
  if (!toggle || !links) {
    return;
  }
  toggle.addEventListener('click', () => {
    links.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const carousel = $('[data-hero-carousel]');
  if (!carousel) {
    return;
  }
  const slides = $$('[data-hero-slide]', carousel);
  const dots = $$('[data-hero-dot]', carousel);
  const previous = $('[data-hero-prev]', carousel);
  const next = $('[data-hero-next]', carousel);
  if (!slides.length) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  function render(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => render(activeIndex + 1), 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  previous?.addEventListener('click', () => {
    render(activeIndex - 1);
    start();
  });
  next?.addEventListener('click', () => {
    render(activeIndex + 1);
    start();
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      render(Number(dot.dataset.heroDot || 0));
      start();
    });
  });
  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  render(0);
  start();
}

function setupCardFilters() {
  const input = $('[data-card-filter]');
  const grid = $('[data-filter-grid]');
  const count = $('[data-filter-count]');
  if (!input || !grid) {
    return;
  }
  const cards = Array.from(grid.children);

  function applyFilter() {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const haystack = (card.dataset.search || card.textContent || '').toLowerCase();
      const match = !query || haystack.includes(query);
      card.classList.toggle('is-hidden-by-filter', !match);
      if (match) {
        visible += 1;
      }
    });
    if (count) {
      count.textContent = query ? `匹配 ${visible} 条` : `共 ${cards.length} 条`;
    }
  }

  input.addEventListener('input', applyFilter);
  applyFilter();
}

async function setupPlayer(shell) {
  const button = $('[data-play-button]', shell);
  const video = $('video', shell);
  const message = $('[data-player-message]', shell);
  const source = shell.dataset.video;
  if (!button || !video || !source) {
    return;
  }

  let initialized = false;

  async function startPlayback() {
    if (initialized) {
      await video.play().catch(() => undefined);
      shell.classList.add('is-playing');
      return;
    }
    initialized = true;
    message.textContent = '正在加载播放源...';

    try {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        await video.play();
      } else {
        const module = await import('./hls-vendor-dru42stk.js');
        const Hls = module.H;
        if (!Hls || !Hls.isSupported()) {
          throw new Error('当前浏览器不支持 HLS 播放');
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        await new Promise((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error('播放源加载超时')), 15000);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            window.clearTimeout(timeout);
            resolve();
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data?.fatal) {
              window.clearTimeout(timeout);
              reject(new Error(data.details || '播放源加载失败'));
            }
          });
        });
        await video.play();
      }
      shell.classList.add('is-playing');
      message.textContent = '';
    } catch (error) {
      initialized = false;
      shell.classList.remove('is-playing');
      message.textContent = `播放器提示：${error.message || '播放失败，请稍后重试'}`;
    }
  }

  button.addEventListener('click', startPlayback);
}

function setupPlayers() {
  $$('[data-video]').forEach((shell) => {
    setupPlayer(shell);
  });
}

setupNavigation();
setupHeroCarousel();
setupCardFilters();
setupPlayers();
