exports = exports or {}
exports.Section = 

	Backbone.View.extend
			
		# this sections current sub-sections [ViewCollection]
		sections: null

		# this sections current views [ViewLoader]
		views: null

		# this sections current contents used for transitions [ViewCollection]
		contents: null

		transitionStates:
			
			before: display:'block', opacity:0, position:'absolute', top:0, left:0
			after: position:'absolute', opacity: 1
			final: position:'static'

		transitionPresets:

			cut: (curr, next, done) -> 				
				if curr then curr.to 'after'
				next.to 'after'
				done()
			fadein: (curr, next, done, duration=1000) -> 
				if curr then curr.to 'after'
				next.to 'after', duration
				.done done
			whitefade: (curr, next, done, duration=1000) -> 
				if not curr then return next.to 'after', duration/2, done
				curr.to('after').to('before', duration/2) 
				.done next.to 'after', duration/2
				.done done
			crossfade: (curr, next, done, duration=1000) ->
				if curr then curr.to('after').to('before', duration, done)
				next.to 'after', duration
				.done done

		events: 'click a[href]': (e) -> @getLauncher().requestClickedLink e, @


	# INITIALIZING THIS SECTIONS CHILDREN SECTIONS AND VIEWS:


		initialize: (@config) -> @config.launcher.trigger 'sectionAdded', @el, @config

		findAndLoad: (next, isTriggerSection) ->
			
			isLauncher = not @config.launcher
			launcher = @getLauncher()
			minLoadingTime = if isTriggerSection then launcher.config.minLoadingTime else 0


			# parse configuration hash for launchables
			sectionsLaunchables = { sections:[], views:[] }
			for selector, launchable of @config.launchables 
				{section,launchables} = launchable
				sectionSelector = _.compact([@config.sectionSelector,selector]).join ' '
				config = { section:@, selector, launchables, sectionSelector, launcher }
				switch
					when section
						if _.isString section then section = requirePath:section
						sectionsLaunchables.sections.push _.extend( config, type:'section', extension:section)	
					when launchable
						if _.isString launchable then launchable = requirePath:launchable
						sectionsLaunchables.views.push _.extend( config, type:'view', launchable)
					else
						throw new Error "Invalid Hash Type: Use either a string or a section hash as value for #{selector}"		

			# launcher.trigger 'launchablesRequested', @el, sectionsLaunchables
			

			# initialy render section
			if not @contents then @render()
			

			# recursively launch the sections launchables (sections and views)
			{sections, views} = sectionsLaunchables
			$el = @contents.last().$el
			@loadSections $el, sections, -> 

				@sections.waitFor 'findAndLoad', @, -> 

					@loadViews $el, views, minLoadingTime, -> 

						# launcher.trigger 'viewsLoaded', @views.views, @el
						
						if isTriggerSection is true
							@sections.waitFor 'playTransition', @, ->
								@views.launchInstances false
								launcher.trigger 'sectionReady', @sections.get('el'), @el
								next.call @
						else 
							launcher.trigger 'subSectionLoaded', @config.selector
							if @cycle and @cycle.launch then @cycle.launch.call @
							next.call @
		

	# ADDING AND SWITCHING BETWEEN SECTION CONTENTS:


		render: (page, $context) ->

			html = if page then page.sync(@config.selector,$context).html2()
			else @$el.html()

			launcher = @config.launcher or @
			page ?= launcher.currPage or launcher.nextPage

			
			isLauncher = not @config.launcher
			isInitialContent = not @contents
			if isInitialContent and not isLauncher then @$el.empty()

			# create new content for section
			sectionContent = new SectionContent
				section: @ 
				className: launcher.config.sectionContentClassName
				html: html
				page: page
			
			# reset content's transition state
			sectionContent.to(if @contents then 'before' else 'final')
			
			if isLauncher
				sectionContent.setElement(@el)
			else
				@$el.append(sectionContent.$el)
			
			if isInitialContent then @resetContent(sectionContent) else @contents.push(sectionContent)
			@

		resetContent: (sectionContent) ->

			@contents = new ViewCollection sectionContent
		
		playTransition: (next)->

			currContent = if @contents.length > 1 then @contents.first() else null
			nextContent = @contents.last()
			section = @
			done = -> 
				if currContent 
					section.unloadLaunchables -> currContent.remove()
				section.launchViews()
				section.resetContent nextContent.to 'final'
				next.call section 
			
			transitionFnc = if _.isString @transition then @transitionPresets[@transition] else @transition or @transitionPresets['cut']
			transitionFnc.call @, currContent, nextContent, done, @config.duration		

		launchViews: (launchSectionsViews = true) ->

			@views.launchInstances()
			if launchSectionsViews then @sections.each (section) -> section.launchViews()

		unloadLaunchables: (next) ->	

			sectionContent = @contents.first()
			sectionContent.views.unloadInstances @, ->
				sectionContent.sections.waitFor 'unloadLaunchables', @, next


	# LOADING SECTIONS, VIEWS AND ASSETS:


		loadSections: ($el, sections, next) ->

			detectedSections = _.filter sections, (section) -> $el.is ":has(#{section.selector})"

			requiredSections = _.filter detectedSections, (section) ->  _.isString section.requirePath

			launcher = @config.launcher or @
				
			@sections = @contents.last().sections = new ViewCollection().reset( 
				for section in detectedSections
					
					# conserve section properties
					{transitionStates} = section.extension
					if transitionStates
						transitionStates = _.extend {}, transitionStates
						delete section.extension.transitionStates
					
					# instantiate extended section 
					ExtendedSection = exports.Section.extend( section.extension )
					section = new ExtendedSection(
						el: $el.find section.selector
						launchables: section.launchables
						selector: section.selector
						sectionSelector: section.sectionSelector
						section: section.section
						launcher: launcher
						imagesToLoad: launcher.config.imagesToLoad
					)

					# extend section with conserved properties
					if transitionStates
					 	_.extend section.transitionStates, transitionStates 

					section
			)
			next.call @

		
		loadViews: ($el, views, minLoadingTime, next) ->
			
			@views = @contents.last().views = new ViewLoader()
			@views.findAndLoad views, $el, @, minLoadingTime, ->
				section = @
				@loadContentAssets -> next.call section
		
		loadContentAssets: (next) ->

			# if @contents then @contents.last().$(@config.imagesToLoad).imagesLoaded next 
			# else next.call @
			next.call @


	# RELOADING SECTIONS AND UPDATING VIEW INSTANCES


		reload: (page, next, context) ->

			return @findAndLoad( next, true ) if not @getLauncher().currPage

			@reloadSections page, ->
				@views.updateInstances page, @$el
				@sections.waitFor 'playTransition', context, next
			
		reloadSections: (page, next) ->

			$el = @$el
			@sections.each (section) -> section.render(page, $el)
			@sections.waitFor 'findAndLoad', @, next, [true]


	# GETTER METHODS

		getLauncher: ->

			@config.launcher or @
