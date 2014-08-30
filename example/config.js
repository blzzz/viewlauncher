var SUBDIRPATH = 'example/';

// Set the require.js configuration for your application.
require.config({
  baseUrl: '../',
  deps: [
    'cs!main'
  ],
  paths: {
    website: 'example/website',
    main: 'example/main',
    module: 'prototypes/module',
    transition: 'prototypes/transition',
    noconflict: 'core/noconflict',
    backbone: 'bower_components/backbone/backbone',
    jquery: 'bower_components/jquery/dist/jquery',
    spin: 'bower_components/spin.js/spin',
    underscore: 'bower_components/underscore/underscore',
    waitForImages: 'bower_components/waitForImages/dist/jquery.waitforimages',
    fancybox: 'bower_components/fancybox/source/jquery.fancybox.pack'
  },
  shim: {
    backbone: {
      deps: [
        'jquery',
        'underscore'
      ]
    },
    waitforimages: {
      deps: [
        'jquery'
      ]
    },
    'spin-js': {
      deps: [
        'jquery'
      ]
    }
  },
  map: {
    '*': {
      'css': 'bower_components/require-css/css', // or whatever the path to require-css is
      'cs': 'bower_components/require-cs/cs',
      'coffee-script': 'bower_components/coffeescript/extras/coffee-script'
    }
  },
  urlArgs: 't=1408526801832',

  packages: [
    {
      name: 'cs',
      location: 'bower_components/require-cs',
      main: 'cs'
    },
    {
      name: 'coffee-script',
      location: 'bower_components',
      main: 'index'
    }
  ]

});
