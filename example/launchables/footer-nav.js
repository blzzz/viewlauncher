define([
],function(){
	return {

		events: {
			'click li':'sayHi'
		},

		getRandomColor: function() {
		    var letters = '0123456789ABCDEF'.split('');
		    var color = '#';
		    for (var i = 0; i < 6; i++ ) {
		        color += letters[Math.floor(Math.random() * 16)];
		    }
		    return color;
		},

		sayHi: function(e){
			var self = this;
			self.$el.css('background-color',self.getRandomColor());
		}

	};
})