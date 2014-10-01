(function() {
  require(['jquery', 'cs!launcher'], function($, Launcher) {
    return $(document).ready(function() {
      require.config({
        baseUrl: '../'
      });
      new Launcher({
        el: 'body',
        root: '/' + location.pathname.split('/').slice(1, 3).join('/') + '/',
        launchables: {
          '#header': 'example/views/header-nav',
          '#left': {
            section: {
              transition: 'cut'
            },
            launchables: {
              '.fancybox-gallery': 'example/views/gallery'
            }
          },
          '#main': {
            section: 'example/transitions/main',
            launchables: {
              '.fancybox-gallery': 'example/views/gallery',
              '#myWidget': 'example/views/mywidget',
              '#test-section': {
                section: 'example/transitions/main',
                launchables: {
                  '.fancybox-gallery': 'example/views/gallery'
                }
              }
            }
          }
        }
      }).bind('all', function(event, params1, params2) {
        var args;
        args = ['>>> ' + event, params1];
        if (params2) {
          args.push(params2);
        }
        return console.log.apply(console, args);
      }).start();
      return $('body > *').css('visibility', 'visible');
    });
  });

}).call(this);
