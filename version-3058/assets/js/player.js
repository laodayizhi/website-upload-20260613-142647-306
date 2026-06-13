(function () {
  function setupPlayer(card) {
    var video = card.querySelector('video');
    var cover = card.querySelector('.player-cover');
    var src = card.getAttribute('data-hls');
    var started = false;
    var hls = null;

    function attach() {
      if (started || !video || !src) {
        return;
      }
      started = true;
      if (cover) {
        cover.classList.add('hidden');
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = src;
      }
      var play = video.play();
      if (play && play.catch) {
        play.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', attach);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          attach();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(setupPlayer);
  });
}());
