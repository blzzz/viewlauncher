define([    
    'prototypes/transition'
],
function(Transition) {
    
    var undef;
    return Transition.extend({
        
        prepare: function( fromPage, toPage, $from, $to, func ){
            var conditions = {}
            if( fromPage != undef )
            {
                conditions.isFirst = true
            };
            return conditions;
        },

        playIntro: function( o, callback ){
            var self = this;
            self.$toContent.show();
            callback();
        },

        playTransition: function( o, callback ){
           var self = this;
           self.crossfade( callback );            
        },

        playOutro: function( o, callback ){
            var self = this;
            self.crossfade( callback );        
        }

    });
    
});