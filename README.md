findAndLoad.js
==============


# The idea

Not every web or website project is driven by a complex clientside business logic. If, for example, content is provided by the a page-based Content Management System, the role of JavaScript is more the one of a "supportive overlay" to the application – the use of a web framework isn't very practical here. But how to prevent a mess (aka "spaghetti code") if the coding structure a web framework normaly offers is missing?

__findAndLoad.js__ follows a modular and easy-to-use architecture that enables to load _Views_ and _Sections_ on demand, namely whenever predefined selectors are found inside of new loaded markup. Technically all of this relies on Backbone.js and provides three new components:

 - To begin, a __Launcher__ gets configured and starts looking for expected contents inside the documents markup to load all the available ones. The two types of contents are _Sections_ and _Views_ (both extending the basic Backbone View).
 - Every loaded __Section__ will now, like the Launcher which extends from the Section class too, find and load its own sub-_Sections_ and its own _Views_. Loaded Sections will again look for sub-Sections and recursively load these. Whenever a hyperlink inside a Section gets clicked, by default only that Sections sub-Sections will be updated with the fetched pages content.
 - A __View__ extends the normal Backbone View by providing four "life cycle" handlers which are called whenever the view is instructed to either get loaded, launched, updated or removed. Whenever a view is found in a Section, it gets loaded and, if done successfully, launched right after. The Views update handler gets called whenever the parent Sections content gets reloaded where as the remove handler gets called when any parent Section totally refreshes.

# The configuration

Usually in Backbone.js Views are provided with Models or Collections and hence need to be rendered by the help of generic templates. In __findAndLoad.js__ Sections and Views do not need to be rendered but are associated directly with matching selectors defined in the Launchers _launchable hash_. Like the Launcher, every Section has a _launchables_ configuration property defining potential selectors and their corresponding "launch description". While the key of a launchable hash property is always interpreted as a selector, the value can either be a path (means it's a __View___) or a _section hash_ (means it's a __Section__). Besides the _launchable_ property, a section hash needs to have a _section_ property containing either a path (to extend a Section with an external module) or a _transition hash_ (to use presets for transition animations).

The following scheme represents a _launchable hashs_ property which can be repeated recursively by using a Section with launchables:  

`   
 Selector:
    String "my/path/to/view" => path to View
        --or--
    Section Hash {
        section: 
            String "my/path/to/section" => path to Section 
                --or--
            Transition Hash { transition: "cut" } => use of preset Section     
        launchables: 
            Launchable Hash { ... }           
    } => section hash for Section
`

Here's an example for the _launchable hash_ written in CoffeeScript: 

`
launchables:
    '#header': 'example/views/header-nav'
    '#left':
        section: transition:'cut'
        launchables:
            '.fancybox-gallery': 'example/views/gallery'
    '#main':
        section: 'example/transitions/main'
        launchables:
            '#contact-form': 'example/views/contact-form'
            '#sub-section':
                   section: 'example/transitions/main'
                   launchables:
                        '.fancybox-gallery': 'example/views/gallery'
`

We can find two section levels in the _launchable hash_ above: On the first level, `#left` and `#main` are Sections whereas `#header` is a View defined by its value type which is a string. Looking at the launchables of the Section `#main` we can find the second section level as `#sub-section` again describes a Section.








