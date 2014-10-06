(function() {
  define([], function() {
    return {
      cycle: {
        load: function(next) {
          console.log("Widget says: LOAD");
          return next();
        },
        launch: function() {
          return console.log("Widget says: LAUNCH");
        },
        unload: function(next) {
          console.log("Widget says: UNLOAD");
          return next();
        }
      },
      events: {
        'click *': function() {
          return console.log("Widget says: You clicked the Widget!");
        }
      }
    };
  });

}).call(this);
