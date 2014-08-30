require ['jquery','cs!src/sectionwrapper'], ( $, SectionWrapper ) ->
	
	$(document).ready ->
		
		wrapper = new SectionWrapper
			
			el: 'body'
			root: '/dynamizr2/example/'

			modules:
				'#header':
					module: 'cs!example/modules-fe/header-nav'
				# '#main':
				# 	module: 'example/modules-fe/header-nav'
				'#footer':
					module: 'example/modules-fe/footer-nav'

			sections:
				'#main':
					transition: 'example/transitions/main'
					#':fadein'
				'#header nav':
					transition: ':cut'

			sectionModules:
				'.fancybox-gallery':
					module: 'example/modules-pg/gallery'

			# pages: 
			# 	[
			# 		href: 'index.html'
			# 		meta: bla: 5
			# 		content: ['test für main','test für header nav']
			# 	]
		.run()

		#wrapper.detectFrontendModules()
		#wrapper.requestPage( 'index.html' )
		# wrapper.addPage( 'test.html' )

		

		$ 'body > *'
			.css 'visibility','visible'