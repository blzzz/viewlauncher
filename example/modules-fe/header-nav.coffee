define [], ->
	
	controls:

		load: (next) ->
			setTimeout ->
				alert("DONE!!")
				next();
			,2000

	events:

		'click li':'sayHi'
	
	getRandomColor: ->

	    letters = '0123456789ABCDEF'.split('')
	    color = '#'
	    for i in [0..5]
	        color += letters[Math.floor(Math.random() * 16)]
	    color	

	sayHi: ->

		@$el.css 'background-color', @getRandomColor()