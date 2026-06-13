(function () {
    var root = document.body ? document.body.getAttribute('data-base') || '.' : '.';

    function joinPath(path) {
        if (root === '..') {
            return '../' + path;
        }
        return path;
    }

    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            toggle.classList.toggle('open');
            nav.classList.toggle('open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function move(step) {
            show(current + step);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                move(1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                move(-1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                move(1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupGlobalSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        var data = window.SEARCH_MOVIES || [];
        forms.forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            var panel = form.querySelector('[data-search-results]');
            if (!input || !panel) {
                return;
            }

            function render() {
                var keyword = input.value.trim().toLowerCase();
                if (!keyword) {
                    panel.innerHTML = '';
                    panel.classList.remove('open');
                    return;
                }
                var matches = data.filter(function (item) {
                    var text = [item.title, item.region, item.type, item.year, (item.tags || []).join(' ')].join(' ').toLowerCase();
                    return text.indexOf(keyword) !== -1;
                }).slice(0, 8);
                if (!matches.length) {
                    panel.innerHTML = '<div class="empty-result">暂无匹配影片</div>';
                    panel.classList.add('open');
                    return;
                }
                panel.innerHTML = matches.map(function (item) {
                    return '<a class="search-result" href="' + joinPath(item.url) + '">' +
                        '<img src="' + joinPath(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                        '<span><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</em></span>' +
                        '<b>' + escapeHtml(item.rating) + '</b>' +
                        '</a>';
                }).join('');
                panel.classList.add('open');
            }

            input.addEventListener('input', render);
            input.addEventListener('focus', render);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var first = panel.querySelector('a');
                if (first) {
                    window.location.href = first.getAttribute('href');
                }
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove('open');
                }
            });
        });
    }

    function setupLocalFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var section = panel.closest('section') || document;
            var list = section.querySelector('[data-movie-list]');
            if (!list) {
                return;
            }
            var items = Array.prototype.slice.call(list.children);
            var input = panel.querySelector('[data-local-filter]');
            var state = {
                type: '',
                year: ''
            };

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                items.forEach(function (item) {
                    var title = (item.getAttribute('data-title') || '').toLowerCase();
                    var tags = (item.getAttribute('data-tags') || '').toLowerCase();
                    var region = (item.getAttribute('data-region') || '').toLowerCase();
                    var type = item.getAttribute('data-type') || '';
                    var year = item.getAttribute('data-year') || '';
                    var passKeyword = !keyword || (title + ' ' + tags + ' ' + region + ' ' + type + ' ' + year).toLowerCase().indexOf(keyword) !== -1;
                    var passType = !state.type || type.indexOf(state.type) !== -1;
                    var passYear = !state.year || year === state.year;
                    item.hidden = !(passKeyword && passType && passYear);
                });
            }

            panel.querySelectorAll('[data-filter-group]').forEach(function (group) {
                var key = group.getAttribute('data-filter-group');
                group.querySelectorAll('button').forEach(function (button) {
                    button.addEventListener('click', function () {
                        group.querySelectorAll('button').forEach(function (other) {
                            other.classList.remove('active');
                        });
                        button.classList.add('active');
                        state[key] = button.getAttribute('data-filter-value') || '';
                        apply();
                    });
                });
            });

            if (input) {
                input.addEventListener('input', apply);
            }
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (wrap) {
            var video = wrap.querySelector('video');
            var trigger = wrap.querySelector('[data-play-trigger]');
            if (!video) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            var ready = false;

            function prepare() {
                if (ready || !stream) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
                ready = true;
            }

            function play() {
                prepare();
                if (trigger) {
                    trigger.classList.add('hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        if (trigger) {
                            trigger.classList.remove('hidden');
                        }
                    });
                }
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('hidden');
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupGlobalSearch();
        setupLocalFilters();
        setupPlayers();
    });
})();
