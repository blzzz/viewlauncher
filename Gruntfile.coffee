# Create a new configuration function that Grunt can
# consume.
module.exports = ->

  # Initialize the configuration.
  @initConfig
    appDir: '.'
    coffeeDir: '<%= appDir %>/src'
    watch:
      coffee:
        files: ['<%= coffeeDir %>/*']
        tasks: 'coffee'
    coffee:
      compile:
        files: {
          'dynamizr.js':'<%= coffeeDir %>/*.coffee'
        }
    
  

  # Load external Grunt task plugins.
  @loadNpmTasks "grunt-contrib-coffee"
  @loadNpmTasks "grunt-contrib-watch"

  # Default task.
  @registerTask "default", ["watch"]