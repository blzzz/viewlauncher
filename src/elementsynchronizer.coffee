ElementSynchronizer = class ElementSynchronizer


# PROPERTIES


	$el1: null
	$el2: null
	path: ''


# CONSTRUCTOR


	constructor: (@$el1, @$el2, @path) -> return @
	

# GETTER METHODS


	getAttributesOf: ($target, allowedAttrs = false) ->
	
		attrs = []
		$target.each -> 
			props = {}
			for a in @attributes
				doCollectAttribute = not allowedAttrs or _.indexOf(allowedAttrs, a.name) >= 0
				if doCollectAttribute then props[ a.name ] = a.value
			attrs.push props
		attrs	

	find: (path) -> 

		@find1(path).add( @find2(path) )
	
	find1: (path = '') -> 

		@$el1.find path
	
	find2: (path = '') -> 

		@$el2.find path

	html1: (path='') ->

		@$el1.html()

	html2: (path='') ->

		@$el2.html()

	sameSize: (path, filter='*') -> 

		@find1(path).filter(filter).length is @find2(path).filter(filter).length


# HYBRID METHOD


	$: (path = '', opts = { sync:'none' }) -> 
		
		return false unless @sameSize path
		{filter,sync} = opts
		$el1 = if path isnt '' then @find1(path) else @$el1
		$el2 = if path isnt '' then @find2(path) else @$el2
		$bothElements = @find(path).filter(filter || '*')
		if not sync then return $bothElements
		self = @
		$bothElements.each () -> 
			
			index = $(@).index()
			$target = $el1.eq index
			$source = $el2.eq index
			
			if sync is 'content' or sync is 'all' 
				self.syncContent $target, $source
			
			if sync is 'attributes' or sync is 'all' 
				self.syncAttributes $target, self.getAttributesOf $source					


# CONTENT SYNC METHODS


	syncHtmlOf: (path) -> 

		@syncContentOf path, 'html'
	
	syncTextOf: (path) -> 

		@syncContentOf path, 'text'
	
	syncContentOf: (path = '', method) -> 
	
		return false unless @sameSize path
		@syncContent @find1(path), @find2(path), method
		true
	
	syncContent: ($target, $source, method = 'html') -> 

		$target.each (i) -> $(@)[ method ]( $source.eq(i)[ method ]() )


# ATTRIBUTE SYNC METHODS


	classesOf: (path) -> 

		@syncAttributesOf path,['class']
	
	idsOf: (path) -> 

		@syncAttributesOf path,['id']
	
	stylesOf: (path) -> 

		@syncAttributesOf path,['style']

	syncAttributesOf: (path = '', allowedAttrs) ->
	
		return false unless @sameSize path
		@syncAttributes @find1(path), @getAttributesOf( @find2(path), allowedAttrs)
		true
	
	syncAttributes: ($target, attrs) -> 

		$target.each (i) -> $(@).removeAttr(_.keys(attrs[i]).join(' ')).attr(attrs[i])	

	
