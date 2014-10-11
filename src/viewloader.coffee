define [
	'require'
	'underscore'
	'backbone'
	'jquery'
	'cs!viewcollection'
],
(require,_,Backbone,$,ViewCollection) ->
	
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

			detectedViews = for view in views 
				if $html.is ":has(#{view.selector})" then view else continue	

			requirePaths = _.pluck detectedViews, 'source'
			loader = @
			if requirePaths.length is 0 then loader.loadInstances context, next, minLoadingTime	
			else
				require requirePaths, ->
					for view, i in detectedViews
						Prototype = arguments[i]
						$html.find(view.selector).each (i) -> 	
							
							config = _.extend el:$(@), view
							
							defaultModule = _.extend {}, loader.ViewPrototype
							defaultCycle = _.extend {}, defaultModule.cycle
							
							extension = _.extend defaultModule, Prototype
							extension.cycle = _.extend defaultCycle, extension.cycle
							Prototype = Backbone.View.extend extension
							
							loader.push new Prototype(config)

					loader.loadInstances context, next, minLoadingTime	
			@
		
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
