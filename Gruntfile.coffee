# Create a new configuration function that Grunt can
# consume.
module.exports = ->

  # Initialize the configuration.
  @initConfig
    rootDir: '.'
    coffeeDir: '<%= rootDir %>/src'
    projectDir: '<%= rootDir %>/example'
    buildDir: '<%= rootDir %>/build'
    distDir: '<%= distDir %>/dist'
    watch:
      coffee:
        files: ['<%= projectDir %>/**/*.coffee']
        tasks: 'coffee:assets'
    coffee:
      assets:
        files:[
          expand: true,    # Enable dynamic expansion.
          cwd: '<%= projectDir %>/'      # Src matches are relative to this path.
          src: ['**/*.coffee'] # Actual pattern(s) to match.
          dest: '<%= projectDir %>/'   # Destination path prefix.
          ext: '.js'   # Dest filepaths will have this extension.
        ]
    requirejs:
      compile:
        options:
          # baseUrl: '<%= coffeeDir %>',
          mainConfigFile: '<%= rootDir %>/build.js',
          name: 'libs/require',
          include: ['cs!sectionwrapper','css'],
          
          # exclude: ['coffee-script'],
          # stubModules: ['cs'],

          out: '<%= buildDir %>/viewlauncher.js',
          optimize: 'none' #'uglify2',
          preserveLicenseComments: false
          # onBuildRead: ( name, path, contents ) ->
          #   console.log( 'Reading: ' + name )
          #   return contents
          # onBuildWrite: ( name, path, contents ) ->
          #   console.log( 'Writing: ' + name );
          #   return contents
    copy:
      dist:
        src: 'build/viewlauncher.js'
        dest: 'dist/viewlauncher.js'

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-coffee"
  @loadNpmTasks "grunt-contrib-watch"
  @loadNpmTasks "grunt-contrib-requirejs"
  @loadNpmTasks "grunt-contrib-copy"

  # Default task.
  @registerTask "default", ["requirejs:compile","copy:dist"]
  @registerTask "assets", ["coffee:assets"]
