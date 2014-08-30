define ['jquery','underscore','backbone','cs!src/moduleloader','cs!src/pagecollection','cs!src/section', 'cs!src/viewcollection'], ($,_,Backbone,ModuleLoader,PageCollection,Section, ViewCollection) ->
	
	Backbone.View.extend
		
		el: 'body'

		loading: no

		pages: null

		moduleLoader: null

		router: null
		
		config:

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
			
			@config = _.extend @config,config
			
		run: ->

			# ROUTER
			wrapper = @
			Router = Backbone.Router.extend				
				routes: '':'request', ':href':'request'
				request: (href) -> wrapper.requestPage href, false, true
			@router = new Router()	
			Backbone.history.start pushState: @config.pushState, root: @config.root, silent: on

			# SECTIONS
			@launchSections @config.sections

			# WRAPPER MODULES
			@loading = yes
			@launchWrapperModules ->

				# PAGES & SECTION MODULES
				href = Backbone.history.fragment
				@pages = new PageCollection( @config.pages, 
					root: @config.root 
					sections: @sections
					initialHref: href
					initialHtml: @$el.html()
				)
				@loading = no
				@requestPage href, true		


		# MODULES

		launchWrapperModules: (next) ->
			
			@moduleLoader = new ModuleLoader( @config.modules )
			.detectAndLoad @$el, next, @
			

		# SECTIONS

		launchSections: (sectionBlueprint) ->
			
			@sections = new ViewCollection(
				for selector,config of sectionBlueprint
					new Section el: selector, modules: @config.sectionModules, selector: selector, transition: config.transition
			)

		launchSectionModules: (next) ->
			
			@loading = yes
			deferreds = []
			@sections.each (section,i) ->
				deferreds.push (dfd = new $.Deferred())
				section.launchModules dfd.resolve			
			if next
				wrapper = @
				$.when.apply($, deferreds).done ->
					next.call wrapper
					wrapper.loading = no


		# PAGES

		requestPage: (href = '', byCall = false, byRoute = false, byClick = not byCall and not byRoute) ->
			
			if @loading then return
			
			if byClick then	Backbone.history.navigate href, silent: yes
			@pages.byHref href, (page) -> 
				if not byCall
					contents = page.get 'content'
					@sections.each (section,i) ->
						section.render contents[ i ]						
				@launchSectionModules ->
					@sections.each (section) ->
						section.play()
			,@


