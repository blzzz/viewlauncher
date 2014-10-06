define [], ->
	
	cycle:

		load: (next) ->
			
			setTimeout ->
				console.log("...header-nav testwise loaded with a short timeout")
				next()
			,200

		launch: -> console.log "LAUNCH HEADER!"
		update: (sync) -> 
			# sync.htmlOf( 'ul' )
			sync.$( 'li','.active', false, true )
			# sync.classesOf( 'li' )
			
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