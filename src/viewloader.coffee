class ViewLoader extends ViewCollection
		
	constructor: (views) -> super views

	ViewPrototype: 
		
		initialize: (@config) ->

		cycle:
			load: (next) -> next.call @ 					
			launch: ->	
			update: -> 					
			unload: (next) -> next.call @

	findAndLoad: (views, $html, context, minLoadingTime, next ) ->

		detectedViews = _.filter views, (view) -> $html.is ":has(#{view.selector})"

		requirePaths = for view, i in detectedViews
			if view.requirePath then view.requirePath
			else @createViewInstances($html,view,view)
		
		# if requirePaths.length and typeof require is 'function'
		# 	loader = @
		# 	require requirePaths, ->
		# 		for view, i in detectedViews
		# 			loader.createViewInstances($html,view,arguments[i])

		# 		loader.loadInstances context, next, minLoadingTime	
		# else
		# 	@loadInstances context, next, minLoadingTime
		@loadInstances context, next, minLoadingTime
		@
	

	createViewInstances: ($html,viewLoader,viewPrototype)->

		loader = @
		$html.find(viewLoader.selector).each (i) -> 	
						
			defaultModule = _.extend {}, loader.ViewPrototype
			defaultCycle = _.extend {}, defaultModule.cycle
			
			extension = _.extend defaultModule, viewPrototype
			extension.cycle = _.extend defaultCycle, extension.cycle
			viewPrototype = Backbone.View.extend extension
			
			loader.push new viewPrototype(_.extend el:$(@), viewLoader)

	loadInstances: (context, next, minLoadingTime = 0) ->
		
		@waitFor ['cycle','load'], context, next, null, minLoadingTime

	launchInstances: ->

		@each (instance) -> instance.cycle.launch.call instance
	
	updateInstances: (nextPage, $el) ->

		@each (instance) -> 
			pageSync = nextPage.sync instance.config.selector, $el
			instance.cycle.update.call instance, pageSync

	unloadInstances: (context, next) ->

		@waitFor ['cycle','unload'], @, ->
			@reset()
			next.call context
