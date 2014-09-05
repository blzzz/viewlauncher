require.config({
  baseUrl: '../src',
  deps: ['cs!sectionwrapper','cs!../example/main'],
  paths: {
    backbone: '../bower_components/backbone/backbone',
    jquery: '../bower_components/jquery/dist/jquery',
    underscore: '../bower_components/underscore/underscore',
    imagesLoaded: '../bower_components/imagesloaded/imagesloaded.pkgd'
  },
  shim: {
    backbone: {
      deps: [
        'jquery',
        'underscore'
      ]
    },
    imagesLoaded: {
      deps: ['jquery']
    }
  },
  map: {
    '*': {
      'css': 'bower_components/require-css/css',
      'cs': '../bower_components/require-cs/cs',
      'coffee-script': '../bower_components/coffeescript/extras/coffee-script'
    }
  },
  packages: [   
    { 
      name: 'cs',
      location: '../bower_components/require-cs', 
      main: 'cs' 
    },    
    { 
      name: 'coffee-script', 
      location: '../bower_components', 
      main: 'index' 
    }
  ]
});