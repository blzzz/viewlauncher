define ['backbone','underscore','jquery'], (Backbone,_,$) ->

	Backbone.Collection.extend
		
		config: {}

		model: 

			Backbone.Model.extend				

				defaults:
					href: 'untitled'
					html: ''
					content: []
					meta:
						title: 'untitled'

				deffered: null

				fetch: (next, context) ->

					# if @deffered.state()
					# 	@deffered.abort()
					# 	@unbind 'fetched'
					page = @
					@deffered = $.ajax
						type: 'GET'
						url: page.collection.config.root + page.get 'href'
					.done (html) ->
						page.parseHtml html
						next.call context, page					

				parseHtml: (html) ->

					config = @collection.config					
					@set 'html', html					
					
					if config.sections
						$html = $ html
						content = config.sections.each (section) -> $html.find(section.config.selector).html()
						@set 'content', content
					
					meta = @get 'meta'
					matches = html.match /<body[^>]+class="\s*([^"]*)\s*"[^>]*>/
					meta.bodyClasses = if matches then _.compact matches[1].split(' ') else []
					@set 'meta', meta
					@

		initialize: (models = [], config) ->

			@config = config
			
			# add inital page model to collection if there is none
			if models.length is 0
				@add new @model href: @config.initialHref
				.parseHtml @config.initialHtml
		
		byHref: (href, next, context = @) ->

			page = @findWhere href:href
			if page
				next.call context, page
			else
				@add href: href	
				.fetch next, context