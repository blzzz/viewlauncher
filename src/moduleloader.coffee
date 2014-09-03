define [
	'require'
	'underscore'
	'backbone'
	'jquery'
	'cs!viewcollection'
],
(require,_,Backbone,$,ViewCollection) ->
	
	class ModuleLoader extends ViewCollection
		
		moduleBlueprint: {}

		modulePrototype: 
			
			initialize: (@options) ->

			cycle:
				load: (next) -> next.call @ 					
				perform: ->	
				update: -> 					
				unload: (next) -> next.call @

		constructor: (@moduleBlueprint) ->

			super()

		detectAndLoad: ($html, next, context = @) ->

			availableModules = for selector,module of @moduleBlueprint
				if $html.is ":has(#{selector})"
					opts = if module.options then module.options else {}
					opts.selector = selector
					opts.source = if typeof module is 'string' then module else module.module
					options: opts

			requirePaths = for module in availableModules
				if not module or not module.options?.source then continue
				module.options.source

			loader = @
			if requirePaths.length is 0
				loader.loadInstances next, context	
			else
				require requirePaths, ->
					for prototype, i in arguments
						availableModules[ i ].prototype = prototype
					for module in availableModules
						selector = module.options.selector
						$html.find(selector).each (i) -> 	
							
							opts = _.extend el:$ @, module.options
							
							defaultModule = _.extend {}, loader.modulePrototype
							defaultCycle = _.extend {}, defaultModule.cycle
							
							extension = _.extend defaultModule, module.prototype
							extension.cycle = _.extend defaultCycle, extension.cycle
							Prototype = Backbone.View.extend extension
							
							loader.push new Prototype(opts)

					loader.loadInstances next, context	
			@
		
		loadInstances: (next, context = @) ->
			
			@waitFor ['cycle','load'], next, context

		performInstances: ->

			@each (instance) -> instance.cycle.perform.call instance
		
		updateInstances: ->

			@each (instance) -> instance.cycle.update.call instance

		unloadInstances: (next, context = @) ->

			@waitFor ['cycle','unload'], next, context
