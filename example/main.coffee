require ['jquery','cs!sectionwrapper'], ( $, SectionWrapper ) ->

	$(document).ready ->

		require.config({
			baseUrl:'../'
		})
		new SectionWrapper
			
			el: 'body'
			
			root: '/'+location.pathname.split('/').slice(1,3).join('/')+'/'

			modules:
				'#header': 'example/modules-fe/header-nav'
				'#footer': 'example/modules-fe/footer-nav'

			sections:
				'#main': 'example/transitions/main'
				'#header nav':
					transition: 'cut'

			sectionModules:				
				'.fancybox-gallery': 'example/modules-pg/gallery'

			# pages: Pages
			# 	[
			# 		href: 'preloadedPage.html'
			# 		meta: isCool: true
			# 		content: ['test für main','test für header nav']
			# 	]
		
		# DEBUGGING
		.bind 'all', (event, params1, params2 )->
			console.log "______________ #{event} ______________"
			console.log params1
			console.log params2 if params2
		
		# RUN WRAPPER
		.run 'pages.json'
		# .done -> alert "READY"
		

		$ 'body > *'
			.css 'visibility','visible'