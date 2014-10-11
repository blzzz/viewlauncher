define [
	'backbone'
	'cs!viewcollection'
	'cs!viewloader'
	'exports'
	'require'
	'imagesLoaded'
], (Backbone, ViewCollection, ViewLoader, exports, require) ->
	
	exports.Section = Backbone.View.extend
		
		sections: null

		views: null

		contents: null

		ContentPrototype: Backbone.View.extend	

			sections: null
			views: null
			initialize: (@config) -> @$el.html @config.html					
			to: (stateName, duration=0) ->					
				state = @config.states?[ stateName ]
				if typeof state is 'string'
					@$el.removeClass @config.states.join ' '
					.addClass state
				else
					if duration is 0
						@$el.css state
						@
					else
						@$el.animate state, duration
						.promise()
			size: -> width: @$el.width(), height: @$el.height()
			pos: -> top: @$el.position().top, left: @$el.position().left
			off: -> top: @$el.offset().top, left: @$el.offset().left

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

		events: 'click a[href]': (e) -> (@config.launcher || @).requestClickedLink e, @
		

	# INITIALIZING THIS SECTIONS CHILDREN SECTIONS AND VIEWS:


		initialize: (@config) -> @config.launcher.trigger 'sectionAdded', @el, @config

		findAndLoad: (next, isTriggerSection) ->
			
			isLauncher = not @config.launcher
			launcher = if isLauncher then @ else @config.launcher 
			{launchablesDir} = launcher.config
			sectionsLaunchables = { sections:[], views:[] }

			for selector, launchable of @config.launchables 
				{section,launchables} = launchable
				sectionSelector = _.compact([@config.sectionSelector,selector]).join ' '
				config = { selector, launchables, sectionSelector, section:@, launcher }
				switch
					when section
						sectionsLaunchables.sections.push _.extend(config, type:'section', 
						if _.isString section then source:launchablesDir+section else extension:section)	
					when _.isString launchable
						sectionsLaunchables.views.push _.extend config, type:'view', source:launchablesDir+launchable
					else
						throw new Error "Invalid Hash Type: Use either a string or a section hash as value for #{selector}"		
						
			# load this sections sections
			launcher.trigger 'launchablesRequested', @el, sectionsLaunchables
			
			if not @contents then @render()
			$el = @contents.last().$el
			minLoadingTime = if isTriggerSection then launcher.config.minLoadingTime else 0

			@loadSections $el, sectionsLaunchables.sections, ->

				@sections.waitFor 'findAndLoad', @, -> 

					# load this sections views
					@loadViews $el, sectionsLaunchables.views, minLoadingTime, ->
						launcher.trigger 'viewsLoaded', @views.views, @el
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


		render: (content = @$el.html()) ->

			isLauncher = not @config.launcher
			isInitial = not @contents
			if isInitial and not isLauncher then @$el.empty()

			sectionContent = new @ContentPrototype
				states: @transitionStates 
				className: (@config.launcher or @).config.sectionContentClassName
				html:content
			
			sectionContent.to(if @contents then 'before' else 'final')
			
			if isLauncher then sectionContent.setElement @el else @$el.append sectionContent.$el
			
			if isInitial then @resetContent sectionContent else @contents.push sectionContent
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
			
			transitionFnc = if _.isString @transition then @transitionPresets[@transition] else @transition
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

			detectedSections = for section in sections
				if $el.is ":has(#{section.selector})" then section else continue	

			requiredSections = for section in detectedSections
				if _.isString section.source then section else continue					

			parentSection = @
			launcher = @config.launcher or @
			sectionsLoaded = ->

				if arguments then for extension, i in arguments 
					requiredSections[ i ].extension = extension	
				
				parentSection.sections = parentSection.contents.last().sections = new ViewCollection()
				.reset( 
					for section in detectedSections
					
						if section.extension.transitionStates
							stateExtension = _.extend {}, section.extension.transitionStates
							delete section.extension.transitionStates
						
						section = new (exports.Section.extend section.extension) 
							el: $el.find section.selector
							launchables: section.launchables
							selector: section.selector
							sectionSelector: section.sectionSelector
							section: section.section
							launcher: launcher
							imagesToLoad: launcher.config.imagesToLoad

						if stateExtension
							section.transitionStates = _.extend {}, section.transitionStates, stateExtension 
							stateExtension = null
						
						section
				)
				next.call parentSection

			if requiredSections.length is 0 then sectionsLoaded.call @ 
			else require _.pluck(requiredSections, 'source'), sectionsLoaded
		
		loadViews: ($el, views, minLoadingTime, next) ->
			
			@views = @contents.last().views = new ViewLoader()
			.findAndLoad views, $el, @, minLoadingTime, ->
				section = @
				@loadContentAssets -> next.call section
		
		loadContentAssets: (next) ->

			if @contents then @contents.last().$(@config.imagesToLoad).imagesLoaded next 
			else next.call @


	# RELOADING SECTIONS AND UPDATING VIEW INSTANCES


		reload: (page, doInitialize, next) ->

			if doInitialize then return @findAndLoad next, true

			@reloadSections page, ->
				@views.updateInstances page, @$el
				@sections.waitFor 'playTransition', @, next
			
		reloadSections: (page, next) ->

			$el = @$el
			@sections.each (section) -> section.render page.sync(section.config.selector,$el).html2()
			@sections.waitFor 'findAndLoad', @, next, [true]
