PageModel = Backbone.Model.extend				

	defaults:
		href: 'untitled-page'
		html: ''
		$html: null
		bodyClasses: ''
		title: 'untitled page'

	fetching: null

	fetch: (context, next) ->

		page = @
		url = page.collection.config.root + '/' + page.get 'href'
		@fetching = $.ajax type: 'GET', url: url
		.done (html) ->
			page.parseHtml html
			next.call context, page	
		.fail (error)->
			throw new Error "Couldn't load page #{url} (#{error.statusText})"				

	parseHtml: (html) ->

		@set 'html', html					
		@set '$html', $html = $(html)
		if matches = html.match /<body[^>]+class="\s*([^"]*)\s*"[^>]*>/
			@set 'bodyClasses', _.compact matches[1].split(' ')
		@set 'title', $html.filter('title').text()
		@

	is: (className) ->

		bodyClasses = @get 'bodyClasses'
		_.indexOf(bodyClasses,className) >= 0

	$: (path) ->

		@get('$html').find path

	sync: (path = '', $currContext = $('html')) -> 

		new ElementSynchronizer $currContext.find(path), @$(path), path