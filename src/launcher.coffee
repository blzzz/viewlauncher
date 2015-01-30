Launcher = exports.Section.extend
	
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
		minLoadingTime: 0

	initialize: (config) ->

		@config = _.extend @config, config, sectionSelector: ''

	start: ->

		# instantiate backbone router and start history
		launcher = @
		Router = Backbone.Router.extend				
			routes: '':'request', '*path':'request'
			request: (href) -> launcher.requestPage(href, 'navigated')
		@router = new Router()	
		Backbone.history.start pushState: @config.pushState, root: @config.root, silent: on
		@trigger 'historyStarted', @router

		href = Backbone.history.fragment
		@pages = new PageCollection @config.pages, 
			root: @config.root 
			initialHref: href
			initialHtml: $('html').html()
		@requestPage(href, 'called')
		@

	requestClickedLink: (e,section = @) ->

		e.stopPropagation()
		$a = $ e.currentTarget
		href = prop: ($a.prop 'href'), attr: ($a.attr 'href')
		root = location.protocol + '//' + location.host + @config.root
		if href.prop.slice(0, root.length) is root  
			if e.preventDefault then e.preventDefault() else e.returnValue = false
			if @requestPage(href.attr, 'linked', {section}) then Backbone.history.navigate( href.attr, silent: yes)

	getSectionToRefresh: (type, opts)->
		
		{section,href} = opts
		{getSectionByHrefChange} = @config

		switch type
			
			# called – launcher section gets initialized
			when 'called'
				@
			
			# linked – a sub-section to feed with content is needed
			#          otherwise the launcher section is used
			when 'linked'
				if section and section.sections.length > 0 then section else @
			
			# navigated – a section is to be determined by source and target hrefs
			when 'navigated'
				if getSectionByHrefChange then getSectionByHrefChange.call(@, @currPage.get('href'), href) else @
			
			else throw new Error('invalid request type')

	requestPage: (href, type, opts = {} ) -> # byRoute = false, activeSection = null) ->

		return false if @loading and @loading.state() is 'pending' or @currPage?.get('href') is href

		# determine section responsible for the display of new content
		section = @getSectionToRefresh( type, _.extend(opts,{href}) )

		# request the page and replace the target section's content
		launcher = @
		@trigger 'pageRequested', {href, type, section, sections:section?.sections}
		@pages.byHref href, @, (page) -> 

			@trigger 'pageFetched', page				
			loading = @loading = new $.Deferred()	

			@nextPage = page

			section.reload( page, ->
				
				@nextPage = null
				@currPage = page
				@trigger 'transitionDone', @el
				loading.resolve launcher
			
			,@)	
		
		return true

