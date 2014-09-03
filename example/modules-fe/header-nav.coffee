define [], ->
	
	cycle:

		load: (next) ->
			setTimeout ->
				console.log("header-nav loaded with timeout")
				next()
			,200

		perform: -> console.log "PERFORM HEADER!"
		update: -> console.log "UPDATE HEADER!"

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