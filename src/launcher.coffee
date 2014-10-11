define [
	'cs!./section'	
	'cs!./pagecollection'
], 
(LaunchableSection, PageCollection) ->

	LaunchableSection.extend
		
		currPage: null

		nextPage: null

		pages: null

		router: null

		loading: false

		config:

			maxTransitionTime: 10000
			root: ''
			pushState: on
			sectionContentClassName: 'section-content'
			imagesToLoad: 'img:not(.dont-preload)'
			launchablesDir:'./'
			minLoadingTime: 0

		initialize: (config) ->

			@config = _.extend @config, config, sectionSelector: ''

		start: ->

			# instantiate backbone router and start history
			launcher = @
			Router = Backbone.Router.extend				
				routes: '':'request', '*path':'request'
				request: (href) -> launcher.requestPage href, true
			@router = new Router()	
			Backbone.history.start pushState: @config.pushState, root: @config.root, silent: on
			@trigger 'historyStarted', @router

			href = Backbone.history.fragment
			@pages = new PageCollection @config.pages, 
				root: @config.root 
				initialHref: href
				initialHtml: $('html').html()
			@requestPage href
			@

		requestClickedLink: (e,section = @) ->

			e.stopPropagation()
			$a = $ e.currentTarget
			href = prop: ($a.prop 'href'), attr: ($a.attr 'href')
			root = location.protocol + '//' + location.host + @config.root
			if href.prop.slice(0, root.length) is root  
				if e.preventDefault then e.preventDefault() else e.returnValue = false
				@requestPage href.attr, false, section

		requestPage: (href = '', byRoute = false, clickSection = null) ->

			if @loading and @loading.state() is 'pending' or @currPage?.get('href') is href then return

			byClick = not byRoute and clickSection isnt null
			byCall = not byRoute and not byClick
			getSectionByPageRoute = @config.getSectionByPageRoute
			launcher = @
			section = switch
				when byClick and clickSection.sections.length > 0 then clickSection
				when byRoute and getSectionByPageRoute then getSectionByPageRoute.call launcher, href
				else @
			console.log getSectionByPageRoute()
			if byClick then Backbone.history.navigate href, silent: yes

			@trigger 'pageRequested', {href, byCall, byClick, byRoute, section, sections:section?.sections}
			@pages.byHref href, @, (page) -> 

				@trigger 'pageFetched', page				
				loading = @loading = new $.Deferred()	

				$('html > head > title').text page.get('title')

				
				launcher.nextPage = page
				section.reload page, byCall, ->
					
					launcher.nextPage = null
					launcher.currPage = page
					launcher.trigger 'transitionDone', @el
					loading.resolve launcher
					

