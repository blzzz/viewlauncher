(function() {
  require(['jquery', 'cs!sectionwrapper'], function($, SectionWrapper) {
    return $(document).ready(function() {
      require.config({
        baseUrl: '../'
      });
      new SectionWrapper({
        el: 'body',
        root: '/' + location.pathname.split('/').slice(1, 3).join('/') + '/',
        modules: {
          '#header': 'example/modules-fe/header-nav',
          '#footer': 'example/modules-fe/footer-nav'
        },
        sections: {
          '#main': 'example/transitions/main',
          '#header nav': {
            transition: 'cut'
          }
        },
        sectionModules: {
          '.fancybox-gallery': 'example/modules-pg/gallery'
        }
      }).bind('all', function(event, params1, params2) {
        console.log("______________ " + event + " ______________");
        console.log(params1);
        if (params2) {
          return console.log(params2);
        }
      }).run();
      return $('body > *').css('visibility', 'visible');
    });
  });

}).call(this);
