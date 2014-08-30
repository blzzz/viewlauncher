define([
    'jquery',
    'underscore',
    'backbone',
    'core/vendor'
],
function($, _, Backbone, vendor ) {


    var subdir = typeof SUBDIRPATH === 'undefined' ? '' : SUBDIRPATH; 
    var root = '/dynamizr/' + subdir;


    var website = /** @lends Website */{
       

        logConfigOptions: {
            
            enableLogs: true,
            showTags: '*',//'main moduleloader',
            showDeltaTime: true,
            showExtraInfos: false,
            
        },
        
        /**
         * Root-Pfad unter welchem die Webseite läuft
         * @type {string}
         */
        root: root,
                
        /**
         * Zonen mit Bildschirmbreiten für responsive Design
         * @type {object[]}
         * @property {string} from - unterer Grenzwert in Pixel 
         * @property {string} to - oberer Grenzwert in Pixel
         */
        widthZones: {
            'mobile': {
                to: 768
            },
            'tablet': {
                from: 768,
                to: 1024
            },
            'desktop_small': {
                from: 1024,
            }
        },
        
       
        /**
         * Frontend Module die beim initialen Start der Webseite einmal instanziert werden
         * @type {object[]}
         * @property {string} module - Modul Name mit Pfad
         * @property {string} options - Zusätzliche Optionen die dem Modul beim Instanzieren an den Konstruktor übergeben werden
         */
        frontendModules: {            
            '#header': {
                module: subdir + 'modules-fe/header-nav',
                options: {}
            }
        },
        


        /**
         * Sektionen als Array mit jQuery Selektoren welche bei einem Seitenwechsel mit den neuen Inhalten geladen werden
         * @type {string[]}
         */
        dynamicSections: {         
            '#main': {
                transition: subdir + 'transitions/main',
                options: {
                  speed: 500,
                    avoidOutro:true,
                    condition: function( isInitial ){
                      return true;
                    }
                }
            },
            '#header nav': {
                options: {
                    speed: 500
                }
            }                       
        },
        
        

        /**
         * Page Module welche beim Laden jeder neuen Seite neu instanziert werden
         * @type {object[]}
         * @property {string} module - Modul Name mit Pfad
         * @property {string} options - Zusätzliche Optionen die dem Modul beim Instanzieren an den Konstruktor übergeben werden
         */
        pageModules: {           
            '.fancybox-gallery': {
                module: subdir + 'modules-pg/gallery'
            } 
        },
        
        
        /**
         * FancyBox2 Eigenschaften: [Dokumentation]{@link http://fancyapps.com/fancybox/#docs}
         */
        fancyboxOptions: {
            openEffect: 'elastic',
            closeEffect: 'elastic'
        },
        
        
    };


    // Mix Backbone.Events, modules, and layout management into the app object.
    return _.extend(website, Backbone.Events);
   
   
});