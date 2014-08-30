define([
    'jquery',
    'backbone',
    'fancybox',
    'css!bower_components/fancybox/source/jquery.fancybox.css'
],

function($, Backbone) {
    
    return Backbone.View.extend({
        
        events: {
            'click a': 'open'
        },

        initialize: function(){
            var self = this;

        },
        
        open: function(e){
            var self = this;
            
            if(e.preventDefault){
                e.preventDefault();
            }else{
                e.returnValue = false;
            }
            
            var allHrefs = [];
            var currHref = $(e.currentTarget).attr('href');
            
            allHrefs.push(currHref);
            
            self.$('a').each(function(){
                
                var href = $(this).attr('href');                
                if (href != currHref){
                    allHrefs.push(href);
                }
                 
            });       
            fancyboxOptions = {
                openEffect: 'elastic',
                closeEffect: 'elastic'
            };
            $.fancybox.open(allHrefs, fancyboxOptions);
            
        }
        
    });
});