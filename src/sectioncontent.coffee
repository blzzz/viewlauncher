SectionContent = Backbone.View.extend	

	sections: null
	
	views: null
	
	states: null

	useClassTransitions: false

	initialize: (@config) -> 
		
		@states = @config.section.transitionStates
		@useClassTransitions = _.isArray( @states )
		@$el.html @config.html


# SETTER METHODS


	to: (stateName, duration=0) ->					
		
		state = @states[ stateName ]
		
		if not state then return

		if not @toStateClass( state )

			if duration is 0
				@$el.css state
				@
			else
				@$el.animate(state, duration).promise()

	toStateClass: (state) ->

		return false if not @useClassTransitions
		@$el.removeClass @states.join(' ')
		.addClass state
		true


# GETTER METHODS	


	findSynced: (path, view) ->

		@$(path).add(view.$(path))

	hasBodyClass: ( className ) ->

		@config.page.is( className )	


	size: -> 
		
		width: @$el.width(), height: @$el.height()
	
	pos: -> 

		top: @$el.position().top, left: @$el.position().left
	
	off: -> 

		top: @$el.offset().top, left: @$el.offset().left
	
