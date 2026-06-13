
(function () {
    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function initImageFallback() {
        document.querySelectorAll('img').forEach(function (img) {
            img.addEventListener('error', function () {
                img.style.display = 'none';
                var parent = img.closest('.poster-frame, .hero-poster');
                if (parent) {
                    parent.classList.add('image-fallback');
                }
            });
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function initPlayer() {
        var video = document.getElementById('videoPlayer');
        if (!video) {
            return;
        }
        var source = video.getAttribute('data-src') || video.currentSrc || '';
        var startButton = document.querySelector('[data-player-start]');
        var loaded = false;

        function loadPlayer() {
            if (loaded || !source) {
                return Promise.resolve();
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = source;
            } else {
                video.src = source;
            }
            return Promise.resolve();
        }

        if (startButton) {
            startButton.addEventListener('click', function () {
                loadPlayer().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === 'function') {
                        playPromise.catch(function () {});
                    }
                    startButton.classList.add('hidden');
                });
            });
        }

        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('hidden');
            }
        });

        loadPlayer();
    }

    function createResultCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '' +
            '<article class="movie-card">' +
                '<a class="poster-frame" href="' + escapeHtml(movie.url) + '">' +
                    '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" />' +
                    '<span class="poster-title">' + escapeHtml(movie.title) + '</span>' +
                    '<span class="poster-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span>' +
                '</a>' +
                '<div class="movie-card-body">' +
                    '<div class="movie-card-top">' +
                        '<a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>' +
                        '<span class="score">热度</span>' +
                    '</div>' +
                    '<p class="movie-one-line">' + escapeHtml(movie.oneLine || '') + '</p>' +
                    '<div class="movie-tags">' + tags + '</div>' +
                    '<div class="movie-meta">' +
                        '<span>' + escapeHtml(movie.region || '') + '</span>' +
                        '<span>' + escapeHtml(movie.genre || '') + '</span>' +
                        '<span>' + escapeHtml(movie.category || '') + '</span>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[match];
        });
    }

    function initSearch() {
        var results = document.getElementById('searchResults');
        var summary = document.getElementById('searchSummary');
        var input = document.getElementById('searchInput');
        if (!results || !summary || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
            var haystack = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' ').toLowerCase();
            return haystack.indexOf(lower) !== -1;
        }).slice(0, 120);
        summary.textContent = '关键词“' + query + '”的匹配结果';
        results.innerHTML = matched.map(createResultCard).join('');
        initImageFallback();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initImageFallback();
        initHero();
        initPlayer();
        initSearch();
    });
})();
