define [
	'backbone'
	'underscore'
	'jquery'
], 
(Backbone,_,$) ->

	Backbone.Collection.extend
		
		config: {}

		SelectorSync: class

			constructor: (@$el1, @$el2) -> @
			html1: -> @$el1.html()
			html2: -> @$el2.html()
			find: (path) -> @$el1.find(path).add( @$el2.find(path) )
			find1: (path = '') -> @$el1.find path
			find2: (path = '') -> @$el2.find path
			sameSize: (path) -> @find1(path).length is @find2(path).length
			readAttributes: ($target, allowedAttrs) ->
				attrs = []
				$target.each -> 
					props = {}
					for a in @attributes
						if not allowedAttrs or _.indexOf(allowedAttrs, a.name) >= 0 then props[ a.name ] = a.value
					attrs.push props
				attrs
			manipulateContent: ($target, $source, type = 'html') -> $target.each (i) -> $(@)[ type ] $source.eq(i)[ type ]()
			manipulateAttributes: ($target, attrs) -> $target.each (i) -> $(@).removeAttr(_.keys(attrs[i]).join(' ')).attr(attrs[i])
			$: (path, replaceContent = true, replaceAttributes = false) -> 
				return false unless @sameSize path
				sync = @
				$el1 = @find1(path).parent().children()
				$el2 = @find2(path).parent().children()
				@find(path).each -> 
					$target = $el1.eq $(@).index()
					$source = $el2.eq $(@).index()
					if replaceContent then sync.manipulateContent $target, $source
					if replaceAttributes then sync.manipulateAttributes $target, sync.readAttributes $source					
			contentOf: (path = '', type) -> 
				return false unless @sameSize path
				@manipulateContent @find1(path), @find2(path), type
				true
			htmlOf: (path) -> @contentOf path
			textOf: (path) -> @contentOf path, 'text'
			attributesOf: (path = '', allowedAttrs) ->
				return false unless @sameSize path
				@manipulateAttributes @find1(path), @readAttributes $find2(path)
				true
			classesOf: (path) -> @attributesOf path,['class']
			idsOf: (path) -> @attributesOf path,['id']
			stylesOf: (path) -> @attributesOf path,['style']

		model: 

			Backbone.Model.extend				

				defaults:
					href: 'untitled-page'
					html: ''
					$html: null
					bodyClasses: ''
					title: 'untitled page'

				fetching: null

				fetch: (context, next) ->

					page = @
					url = page.collection.config.root + page.get 'href'
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

				$: (path) ->

					@get('$html').find path

				sync: (path = '', $el = $('html')) -> new @collection.SelectorSync $el.find(path), @$(path)



		initialize: (models = [], @config) ->

			if models.length is 0
				@add new @model href: @config.initialHref
				.parseHtml @config.initialHtml
		
		byHref: (href, context, next) ->

			if page = @findWhere(href:href)
				next.call context, page
			else
				@add href: href	
				.fetch context, next
				