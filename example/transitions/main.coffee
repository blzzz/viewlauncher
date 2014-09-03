define [],->
    
    transitionStates:
        
        final: background:'red', position:'static'
    
    transition: (curr, next, done, duration=900) ->
        # console.log next.size().height
        curr.to 'before', duration/3 if curr        
        @$el.animate height:next.size().height, duration/3
        .promise().done -> 
            next.to 'after', duration/3                 
            .done done