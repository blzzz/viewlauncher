define [],->
    
    transitionStates:
        
        final: position:'static' # , background:'red'
    
    transition: (curr, next, done, duration=900) ->
        
        curr.to 'before', duration/3 if curr        
        @$el.animate height:next.size().height, duration/3
        .promise().done -> 
            next.to 'after', duration/3                 
            .done done