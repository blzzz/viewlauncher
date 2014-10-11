define [
	'jquery'
],
->
	
	cycle:
		load: (next)-> 
			console.log("Widget says: LOAD")
			next()
		launch: -> console.log("Widget says: LAUNCH")
		unload: (next) -> 
			console.log("Widget says: UNLOAD") 
			next()
	
	events:
		'click *': -> console.log "Widget says: You clicked the Widget!"

