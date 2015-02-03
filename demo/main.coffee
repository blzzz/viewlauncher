
Launcher = require('../dist/viewlauncher.js')



# HEADER VIEW

Header = 
	cycle:

		load: (next) ->

			setTimeout ->
				console.log("...header-nav testwise loaded with a short timeout")
				next()
			,200
		
		# launch: -> console.log "LAUNCH HEADER!"
		
		update: (syncer) -> 
			syncer.$( 'li', filter:'.active', sync:'attributes' )
			
	events:

		'click li':'changeBackgroundColor'

	getRandomColor: ->

		letters = '0123456789ABCDEF'.split('')
		color = '#'
		for i in [0..5]
			color += letters[Math.floor(Math.random() * 16)]
		color

	changeBackgroundColor: ->

		@$el.css 'background-color', @getRandomColor()


# MAIN VIEW

MainSection =

	transitionStates:
		
		final: position:'static', background:'red'

	transition: (curr, next, done, duration=900) ->

		curr.to 'before', duration/3 if curr        
		@$el.animate height:next.size().height, duration/3
		.promise().done -> 
		    next.to 'after', duration/3                 
		    .done done

	cycle:
		
		launch: ->
			console.log 'Main transition launched'


Widget = 
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


Gallery = require('./gallery.js')


$(document).ready ->

	new Launcher
		
		el: 'body'

		root: '/'+location.pathname.split('/').slice(1,3).join('/')+'/'

		getSectionByPageRoute: (href) ->
			
			# @sections.find(['config','selector'],'#main')
			@

		minLoadingTime: 0

		launchables:

			'#header': Header
			'#left':
				section: transition:'cut'
				launchables:
					'.fancybox-gallery': Gallery
			'#main':
				section: MainSection
				launchables:
					'.fancybox-gallery': Gallery
					'#myWidget': Widget
					'#test-section':
						section: MainSection
						launchables:
							'.fancybox-gallery': Gallery
							# '#another-div':
							# 	section: 'example/transitions/main'
							# 	launchables:
							# 		'.fancybox-gallery': 'example/views/gallery'

	# DEBUGGING

	.bind 'pageRequested', (params)-> 
		params.sections?.each (section) -> 
			$('<div class="loader"/>').append('<div class="throbber-container"><div class="throbber"/></div>')
			.appendTo(section.$el)
			.stop().fadeIn(400)
	
	.bind 'pageFetched', (page)-> 
		$('html > head > title').text page.get('title')
		
	# .bind 'sectionReady', (params)-> @$('.loader').stop().fadeOut 400, -> $(@).remove()
	.bind 'transitionDone', (params)->
		@$('.loader').stop().fadeOut 100, -> $(@).remove()

	.bind 'all', (event, params1, params2 )->
		args = ['>>> '+event, params1]
		if params2 then args.push params2
		console.log.apply console, args
	
	
	# START

	.start()

	$ 'body > *'
		.css 'visibility','visible'
