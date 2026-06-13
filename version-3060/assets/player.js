(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1";
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  ready(function () {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    panels.forEach(function (panel) {
      var video = panel.querySelector("video");
      var button = panel.querySelector("[data-play-button]");
      var stream = panel.getAttribute("data-stream");
      var started = false;

      function begin() {
        if (!video || !stream) {
          return;
        }
        if (button) {
          button.classList.add("is-hidden");
        }
        if (started) {
          video.play().catch(function () {});
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
          return;
        }
        loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        }).catch(function () {
          video.src = stream;
          video.play().catch(function () {});
        });
      }

      if (button) {
        button.addEventListener("click", begin);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            begin();
          }
        });
      }
    });
  });
})();
