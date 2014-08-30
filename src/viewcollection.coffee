define [], ->
	class

		constructor: (views) ->

			@views = new Array()
			if views
				if not views.length then views = [views]
				for view in views
					@push view

		push: (view) ->

			@views.push view
			@length = @views.length

		each: (fnc, context = @) ->

			for view, i in @views 
				fnc.call context, view, i

		$: (selector) ->

			for view in @views
				if view.$el.is selector then view

		first: ->

			@views[0]

		last: ->

			@views[@length-1]

