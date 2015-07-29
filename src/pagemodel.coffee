PageModel = Backbone.Model.extend				

	defaults:
		href: 'untitled-page'
		html: ''
		$html: null
		bodyClasses: ''
		title: 'untitled page'

	fetching: null

	fetch: (context, next) ->

		url = @collection.config.loadRoot + '/' + @get 'href'
		@fetching = $.ajax type: 'GET', url: url
		.done _.bind (html) ->
			@parseHtml html
			next.call context, @	
		,@
		.fail (error)-> throw new Error "Couldn't load page #{url} (#{error.statusText})"				

	parseHtml: (html) ->

		@set 'html', html					
		@set '$html', $html = $(html)
		if matches = html.match /<body[^>]+class="\s*([^"]*)\s*"[^>]*>/
			@set 'bodyClasses', _.compact matches[1].split(' ')
		@set 'title', $html.filter('title').text()
		@

	is: (className) -> _.indexOf( @get('bodyClasses'), className) >= 0

	$: (path) -> @get('$html').find path

	sync: (path = '', $currContext = $('html')) ->  new ElementSynchronizer $currContext.find(path), @$(path), path