define ['backbone','cs!src/moduleloader','cs!src/viewcollection'], (Backbone,ModuleLoader,ViewCollection) ->

	Backbone.View.extend

		config: {}

		moduleLoader: null

		contentPrototype:
			
			Backbone.View.extend
				
				className:'section-content'
				
				initialize: (@config) ->
					
					if @config.html then @$el.html @config.html
				
				to: (stateName, duration=0) ->
					state = @config.states?[ stateName ]
					if duration is 0
						@$el.css state
						@
					else
						@$el.animate state, duration
						.promise()

				size: ->

					width: @$el.width(), height: @$el.height()

				pos: ->
					
					top: @$el.position().top, left: @$el.position().left
					
				off: ->

					top: @$el.offset().top, left: @$el.offset().left

		transitions:

			cssStates:
				before: display:'block', opacity:0, position:'absolute', top:0, left:0
				after: opacity: 1
				final: position:'static'

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

		transition: (curr, next, done, duration=900) ->

			if curr then curr.to 'before', duration/3		
			@$el.animate height:next.size().height, duration/3
			.promise().done -> 
				next.to 'after', duration/3					
				.done done

		initialize: (@config) ->
			
			# content = @$el.html()
			$wrapper = $ '<div class="section-content" />'
			@$el.children().wrapAll $wrapper
			# @render content	
			content = new @contentPrototype el:@$el.children().first(), states: @transitions.cssStates
			@setActive content
			@

		addSectionContent: (content) ->

			content = new @contentPrototype html:content, states: @transitions.cssStates
			@contents.push content
			content

		render: (content) ->

			content = @addSectionContent(content).to 'before'
			@$el.append content.$el
			@

		launchModules: (next)->
			
			@moduleLoader = new ModuleLoader( @config.modules )
			.detectAndLoad @$el, next, @

		play: ->

			currContent = if @contents.length > 1 then @contents.first()
			nextContent = @contents.last()
			section = @
			done = -> 
				if currContent then currContent.remove()
				section.setActive nextContent.to 'final'
			
			transition = @transition
			if @config.transition and @config.transition[0] is ':' then transition = @transitions[@config.transition[1..]]

			transition.call @, currContent, nextContent, done, @config.duration
		
		setActive: (sectionContent) ->

			@contents = new ViewCollection sectionContent
