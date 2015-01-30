PageCollection = Backbone.Collection.extend
		
	config: {}

	model: PageModel

	initialize: (models = [], @config) ->

		if models.length is 0
			@add new @model href: @config.initialHref
			.parseHtml @config.initialHtml
	
	byHref: (href, context, next) ->

		href = if href.slice(0,1) is '/' then href.slice(1) else href
		if page = @findWhere(href:href)
			next.call context, page
		else
			@add href: href	
			.fetch context, next
				