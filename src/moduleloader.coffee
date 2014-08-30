define ['require','underscore','backbone','jquery'], (require,_,Backbone,$) ->
	
	class ModuleLoader
		
		moduleBlueprint: {}

		moduleInstances: []

		modulePrototype: 
			
			Backbone.View.extend
				remotes: {
					load: (next) -> next.call @
					unload: (next) -> next.call @
				}

		constructor: (@moduleBlueprint) ->

			@moduleInstances = []

		detectAndLoad: ($html, next, context = @) ->

			availableModules = for selector of @moduleBlueprint
				if $html.is ":has(#{selector})"
					module = @moduleBlueprint[ selector ]
					opts = if module.options then module.options else {}
					opts.selector = selector
					module.options = opts
					module
			
			requirePaths = for moduleObj in availableModules
				if not moduleObj or not moduleObj.module then continue
				moduleObj.module

			loader = @
			if requirePaths.length is 0
				loader.loadInstances next, context	
			else
				require requirePaths, () ->
					for prototype, i in arguments
						availableModules[ i ].prototype = prototype
					for module in availableModules
						selector = module.options.selector
						$html.find(module.options.selector).each (i) -> 	
							opts = module.options or {}
							opts.el = $ @
							prototype = loader.modulePrototype.extend module.prototype
							instance = new prototype(opts)
							loader.moduleInstances.push instance
					loader.loadInstances next, context	
			@
		
		loadInstances: (next, context = @) ->
			
			deferreds = []
			loader = @
			@foreachInstance (instance) ->
				deferreds.push dfd = new $.Deferred()
				instance.remotes.load dfd.resolve
			$.when.apply($, deferreds).done ->
				# console.log loader.moduleBlueprint
				# console.log loader.moduleInstances
				next.call context, loader.moduleInstances

		foreachInstance: (fnc, instances = @moduleInstances) ->

			_.each instances, fnc
			@

		filterInstancesOf: (selector) ->

            _.filter @moduleInstances, (instance) -> instance.options.selector is selector

        findInstanceOf: (selector) ->

            _.find @moduleInstances, (instance) -> instance.options.selector is selector

        $: (selector) ->

            $return = $ [];
            instances = @filterInstancesOf(selector);
            if instances.length > 0 then @foreachInstance ((instance) -> $return = $return.add instance.$el ), instances
            $return
