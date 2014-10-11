define [
	'jquery'
	'underscore'
], 
($,_) ->
	
	class ViewCollection

		constructor: (views) ->

			@reset views

		reset: (views) ->

			if @views
				for view in @views
					view.remove()
			@views = []
			if views
				if not _.isArray(views) then views = [views]
				for view in views
					@push view
			@

		push: (view) ->

			@views.push view
			@length = @views.length

		each: (fnc, views = @views, context = @) ->

			isFnc = _.isFunction fnc
			isStr = not isFnc and _.isString fnc
			for view, i in views 
				if isFnc then fnc.call context, view, i 
				else if isStr then view[ fnc ].call context, view, i 

		find: (key,value) ->

			@where( key,value )[0]

		where: (key,value, limit) ->
			
			results = []
			isArray = _.isArray key
			@each (view) -> 
				val = if isArray then @resolveArrayPath(view, key) else view[ key ]
				if val is value then results.push view
			results

		first: ->

			@views.slice(0,1)[0]

		last: ->

			@views.slice(-1)[0]

		set: (property, value) ->

			if _.isObject property
				@each (view) -> 
					for prop, val of property
						view[ prop ] = val
			else
				@each (view) -> view[ property ] = value
					
			@

		get: (property1, property2) ->

			results = if property2 then {} else []
			@each (view) -> 
				val = switch
					when _.isArray property1 then @resolveArrayPath view, property1
					when _.isFunction view[property1] then view[property1].call view
					else view[property1]
				if property2
					key = switch
						when _.isArray property2 then @resolveArrayPath view, property2
						else property2
					results[ key ] = val
				else if val
					results.push val
			results

		waitFor: (fncName, context = @, next, options, minDuration = 0, maxDuration = 20000) ->

			# if @views.length is 0 then return next.call context

			isDone = no
			waitForMinDuration = minDuration > 0

			if waitForMinDuration
				setTimeout -> 
					if isDone then next.call(context) else waitForMinDuration = no
				,minDuration
			if maxDuration > 0 
				maxClock = setTimeout -> 
					throw Error "max wait duration of #{maxDuration} exceeded for function #{fncName}"
					next.call context
				,maxDuration
			useArray = _.isArray fncName
			actions = @each (view) ->
				dfd = new $.Deferred()
				fnc = if useArray then @resolveArrayPath(view,fncName) else	view[fncName]
				if _.isArray(options) then fnc.apply view, [dfd.resolve].concat(options)
				else fnc.call view, dfd.resolve
				dfd	
			$.when.apply $, actions
			.done -> 
				if maxClock then clearTimeout maxClock 
				if not waitForMinDuration then next.call(context)
				isDone = yes
			@

		resolveArrayPath: (obj, path) ->
			
			for chunk in path
				obj = obj[chunk]
			obj

		$: (selector) ->

			$return = $ [];
			views = _.filter @views, (view) -> view.$el.is selector
			if views.length > 0 then @each ((view) -> $return = $return.add view.$el ), views
			$return

