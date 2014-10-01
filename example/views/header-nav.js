(function() {
  define([], function() {
    return {
      cycle: {
        load: function(next) {
          return setTimeout(function() {
            console.log("...header-nav testwise loaded with a short timeout");
            return next();
          }, 200);
        },
        launch: function() {
          return console.log("LAUNCH HEADER!");
        },
        update: function(sync) {
          return sync.$('li.active', false, true);
        }
      },
      events: {
        'click li': 'sayHi'
      },
      getRandomColor: function() {
        var color, i, letters, _i;
        letters = '0123456789ABCDEF'.split('');
        color = '#';
        for (i = _i = 0; _i <= 5; i = ++_i) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      },
      sayHi: function() {
        return this.$el.css('background-color', this.getRandomColor());
      }
    };
  });

}).call(this);
