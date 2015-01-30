define([
    'jquery',
    '../node_modules/fancybox/dist/js/jquery.fancybox.pack',
    '../node_modules/fancybox/dist/css/jquery.fancybox.css'
],

function($) {
    
    return {
        
        events: {
            'click a': 'open'
        },

        cycle: {
            perform: function(){
                console.log("PERFORM GALLERY!")
            }
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
        
    }
});