define ['jquery','underscore'], ($,_) ->
	
	class ViewCollection

		constructor: (views) ->

			@views = new Array()
			if views
				if not views.length then views = [views]
				for view in views
					@push view

		push: (view) ->

			@views.push view
			@length = @views.length

		each: (fnc, views = @views, context = @) ->

			for view, i in views 
				fnc.call context, view, i

		first: ->

			@views[0]

		last: ->

			@views[@length-1]

		set: (property, value) ->

			@each[ property ] = value

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
				else 
					results.push val
			results

		waitFor: (fncName, next, context = @, maxDuration = 0) ->

			if maxDuration > 0 
				clock = setTimeout -> 
					throw Error "max wait duration of #{maxDuration} exceeded for function #{fncName}"
					next.call context
				,maxDuration
			useArray = _.isArray fncName  
			actions = @each (view) ->
				dfd = new $.Deferred()
				fnc = if useArray then @resolveArrayPath(view,fncName) else	view[fncName]
				fnc.call view, dfd.resolve
				dfd	
			$.when.apply $, actions
			.done -> 
				clearTimeout clock if clock
				next.call context

		resolveArrayPath: (obj, path) ->
			
			for chunk in path
				obj = obj[chunk]  
			obj

		$: (selector) ->

            $return = $ [];
            views = _.filter @views, (view) -> view.$el.is selector
            if views.length > 0 then @each ((view) -> $return = $return.add view.$el ), views
            $return

