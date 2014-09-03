define ['jquery','underscore','backbone','cs!moduleloader','cs!pagecollection','cs!section', 'cs!viewcollection'], ($,_,Backbone,ModuleLoader,PageCollection,Section, ViewCollection) ->
	
	Backbone.View.extend
		
		el: 'body'

		loading: no

		pages: null

		moduleLoader: null

		router: null
		
		config:

			maxTransitionTime: 10000
			root: ''
			pushState: on

		events:

			'click a[href]': (e) ->				
				$a = $ e.currentTarget
				href = prop: ($a.prop 'href'), attr: ($a.attr 'href')
				root = location.protocol + '//' + location.host + @config.root
				if e.preventDefault then e.preventDefault() else e.returnValue = false
				if href.prop.slice(0, root.length) is root      
					@requestPage href.attr

		initialize: (config) ->
			
			@config = _.extend @config, config
			
		run: ->

			# ROUTER
			wrapper = @
			Router = Backbone.Router.extend				
				routes: '':'request', ':href':'request'
				request: (href) -> wrapper.requestPage href, false, true
			@router = new Router()	
			Backbone.history.start pushState: @config.pushState, root: @config.root, silent: on
			@trigger 'wrapperHistoryStarted', @router

			# SECTIONS
			initialHtml = @$el.html()
			@launchSections @config.sections, ->
				
				# WRAPPER MODULES
				@trigger 'sectionsLaunched', @sections
				@launchWrapperModules ->

					# PAGES & SECTION MODULES
					@trigger 'wrapperAssetsLoaded', @moduleLoader
					href = Backbone.history.fragment
					@pages = new PageCollection @config.pages, 
						root: @config.root 
						sections: @sections
						initialHref: href
						initialHtml: initialHtml
					@requestPage href, true		
				@

		launchWrapperModules: (next) ->
			
			@moduleLoader = new ModuleLoader( @config.modules )
			.detectAndLoad @$el, next, @
			
		launchSections: (sectionBlueprint, next, context = @) ->
			
			sections = for selector,extension of sectionBlueprint
				if _.isString extension then {selector,source:extension} else {selector,extension}
			sectionsLoaded = ->				
				if arguments
					for extension, i in arguments 
						sections[ i ].extension = extension					
				context.sections = new ViewCollection(
					for section in sections						
						if section.extension.transitionStates
							stateExtension = _.extend {}, section.extension.transitionStates
							delete section.extension.transitionStates
						section = new (Section.extend section.extension) 
							el: $ section.selector
							modules: context.config.sectionModules
							selector: section.selector
						if stateExtension
							section.transitionStates = _.extend {}, section.transitionStates, stateExtension 
							stateExtension = null
						section.render()
				)
				next.call context			
			toLoad = _.compact _.pluck sections, 'source'
			if toLoad.length is 0 then sectionsLoaded.call context else require toLoad, sectionsLoaded
			
		launchSectionModules: (next) ->
			
			@sections.waitFor 'launchModules', ->
				next.call @
				@loading = no
			,@
			
		requestPage: (href = '', byCall = false, byRoute = false, byClick = not byCall and not byRoute) ->

			if @loading then return			
			if byClick then	Backbone.history.navigate href, silent: yes
			
			@loading = yes
			@trigger 'pageRequested', {href, byCall, byClick, byRoute}
			@pages.byHref href, (page) -> 
				
				@trigger 'pageFetched', page				
				if byCall then @sections.set 'currPage', page else
					contents = page.get 'content'
					@sections.each (section,i) -> 
						section.render contents[ i ], page

				@trigger 'pageInjected', @sections					
				@sections.waitFor 'loadAssets', ->
					
					@trigger 'assetsLoaded', @moduleLoader, @sections.get 'moduleLoader',['config','selector']
					@sections.waitFor 'playTransition', ->
						@trigger 'transitionsDone', @sections
						@moduleLoader[if byCall then 'performInstances' else 'updateInstances'] page, @sections
						@sections.each (section) -> section.moduleLoader.performInstances()
						@loading = no

					,@, @config.maxTransitionTime
				,@
			,@
			