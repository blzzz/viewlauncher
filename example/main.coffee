require ['jquery','cs!launcher'], ( $, Launcher ) ->

	$(document).ready ->

		require.config({
			baseUrl:'../'
		})

		new Launcher
			
			el: 'body'

			root: '/'+location.pathname.split('/').slice(1,3).join('/')+'/'

			launchables:
				'#header': 'example/views/header-nav'
				'#left':
					section: transition:'cut'
					launchables:
						'.fancybox-gallery': 'example/views/gallery'
				'#main':
					section: 'example/transitions/main'
					launchables:
						'.fancybox-gallery': 'example/views/gallery'
						'#myWidget': 'example/views/mywidget'
						'#test-section':
							section: 'example/transitions/main'
							launchables:
								'.fancybox-gallery': 'example/views/gallery'
								# '#another-div':
								# 	section: 'example/transitions/main'
								# 	launchables:
								# 		'.fancybox-gallery': 'example/views/gallery'

			
		# DEBUGGING
		.bind 'all', (event, params1, params2 )->
			args = ['>>> '+event, params1]
			if params2 then args.push params2
			console.log.apply console, args			
		
		# START
		.start()

		$ 'body > *'
			.css 'visibility','visible'