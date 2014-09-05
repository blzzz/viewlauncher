define [
	'backbone'
	'jquery'
	'cs!moduleloader'
	'cs!viewcollection'
	'imagesLoaded'
],
(Backbone,$,ModuleLoader,ViewCollection) ->

	Backbone.View.extend

		config: {}

		currPage: null
		nextPage: null

		moduleLoader: null

		contentClassName: 'section-content'

		contentPrototype:
			
			Backbone.View.extend
				
				initialize: (@config) ->
					
				to: (stateName, duration=0) ->
					
					state = @config.states?[ stateName ]
					if typeof state is 'string'
						@$el.removeClass @config.states.join ' '
						.addClass state
					else
						if duration is 0
							@$el.css state
							@
						else
							@$el.animate state, duration
							.promise()

				size: -> width: @$el.width(), height: @$el.height()					

				pos: -> top: @$el.position().top, left: @$el.position().left
					
				off: -> top: @$el.offset().top, left: @$el.offset().left

		transitionStates:
			
			before: display:'block', opacity:0, position:'absolute', top:0, left:0
			after: opacity: 1
			final: position:'static'

		transitionPresets:

			cut: (curr, next, done) -> 				
				next.to 'after'
				done()
			fadein: (curr, next, done, duration=1000) -> 
				next.to 'after', duration
				.done done
			whitefade: (curr, next, done, duration=1000) -> 
				curr.to 'before', duration/2 
				.done next.to 'after', duration/2
				.done done
			crossfade: (curr, next, done, duration=1000) ->
				curr.to 'before', duration
				next 'after', duration
				.done done

		initialize: (@config) ->
			
		render: (content, page) ->

			sectionContent = new @contentPrototype
				states: @transitionStates 
				className: @contentClassName

			@$el.append sectionContent.$el

			if content and page
				sectionContent.$el.html(content)
				@nextPage = @currPage
				@currPage = page
				@contents.push sectionContent
			else 
				@setCurrentContent sectionContent
				sectionContent.$el.append @$el.children()
			
			sectionContent.to 'before'
			@

		loadAssets: (next) ->

			$el = @contents.last().$el
			
			loadingImages = $el.find('img').imagesLoaded()
			launchingModules = new $.Deferred()
			@launchModules $el, launchingModules.resolve
			
			$.when.apply $, [ loadingImages, launchingModules ]
			.done next
			
		launchModules: ($el,next)->
			
			@moduleLoader = new ModuleLoader @config.modules
			.detectAndLoad $el, next, @

		playTransition: (next, context = @)->

			currContent = if @contents.length > 1 then @contents.first()
			nextContent = @contents.last()
			done = -> 
				if currContent 
					context.moduleLoader.unloadInstances -> currContent.remove()
				context.setCurrentContent nextContent.to 'final'
				next.call context 
			
			transitionFnc = if typeof @transition is 'string' then @transitionPresets[@transition] else @transition
			transitionFnc.call @, currContent, nextContent, done, @config.duration
		
		setCurrentContent: (sectionContent) ->

			@contents = new ViewCollection sectionContent

		getModuleInstances: ->

			@moduleLoader.moduleInstances

		