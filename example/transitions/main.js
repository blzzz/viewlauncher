(function() {
  define([], function() {
    return {
      transitionStates: {
        final: {
          position: 'static'
        }
      },
      transition: function(curr, next, done, duration) {
        if (duration == null) {
          duration = 900;
        }
        if (curr) {
          curr.to('before', duration / 3);
        }
        return this.$el.animate({
          height: next.size().height
        }, duration / 3).promise().done(function() {
          return next.to('after', duration / 3).done(done);
        });
      },
      cycle: {
        launch: function() {
          return console.log('Main transition launched');
        }
      }
    };
  });

}).call(this);
