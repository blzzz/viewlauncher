require ['jquery','cs!launcher'], ( $, Launcher ) ->

	$(document).ready ->

		require.config baseUrl:'../'

		new Launcher
			
			el: 'body'

			root: '/'+location.pathname.split('/').slice(1,3).join('/')+'/'

			getSectionByPageRoute: (href) ->
				
				# @sections.find(['config','selector'],'#main')
				@

			minLoadingTime: 0

			launchablesDir: 'example/launchables/'
			launchables:

				'#header': 'header-nav'
				'#left':
					section: transition:'cut'
					launchables:
						'.fancybox-gallery': 'gallery'
				'#main':
					section: 'main'
					launchables:
						'.fancybox-gallery': 'gallery'
						'#myWidget': 'mywidget'
						'#test-section':
							section: 'main'
							launchables:
								'.fancybox-gallery': 'gallery'
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
		
		# .bind 'sectionReady', (params)-> @$('.loader').stop().fadeOut 400, -> $(@).remove()
		.bind 'transitionDone', (params)-> @$('.loader').stop().fadeOut 100, -> $(@).remove()

		.bind 'all', (event, params1, params2 )->
			args = ['>>> '+event, params1]
			if params2 then args.push params2
			console.log.apply console, args
		
		# START
		.start()

		$ 'body > *'
			.css 'visibility','visible'