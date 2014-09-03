(function() {
  define([], function() {
    return {
      cycle: {
        load: function(next) {
          return setTimeout(function() {
            console.log("header-nav loaded with timeout");
            return next();
          }, 200);
        },
        perform: function() {
          return console.log("PERFORM HEADER!");
        },
        update: function() {
          return console.log("UPDATE HEADER!");
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
