ViewlauncherJS
==============
ViewlauncherJS allows to automatically launch Backbone Views and thus to extend HTML elements with user interaction. Comparable with CSS definitions,  Views get initialized whenever corresponding selectors are detected in a documents mark-up. As the user navigates by following internal links,  mark-up will asynchronously be requested and, once loaded, be scanned for matching View definitions again. Furthermore ViewlauncherJS provides Section Views for custom transitions and allowing to reload pages partially.

# Use Case

If you're creating CMS-based websites mostly rendering SEO-friendly HTML pages, ViewlauncherJS provides you with some helpful mechanics to increase the site's user experience. Based on the framework BackboneJS, it offers a way to meaningfully structure your code and provides a straightforward API for transitions.
You are free to use all of the advantages of BackboneJS, but the primar goal behind ViewlauncherJS is to improve websites rather than web applications. Instead of rendering Backbone Views according to a Model, ViewlauncherJS (uncommonly) associates them to exisiting elements (which have been rendered server-side)  

# Launch Configuration

Views launched by ViewlauncherJS are associated directly with the matching selectors configured in the Launcher View's _launchable hash_. Like the Launcher View, every Section View itself has a _launchables_ configuration property defining potential selectors and their corresponding "launch description". While every key of a launchable hash property is handled as a selector, the value represents the corresponding View. If a View contains a `section` property its value is used as the View actuylly being a Section View.

Here's an example for the _launchable hash_ written in CoffeeScript: 

```
launchables:
    '#header': Header
    '#left':
        section: transition:'cut'
        launchables:
            '.fancybox-gallery': Gallery
    '#main':
        section: MainSection
        launchables:
            '#contact-form': ContactForm
            '#sub-section':
                   section: MainSection
                   launchables:
                        '.fancybox-gallery': Gallery
```

We can find two section levels in the _launchable hash_ above: On the first level, `#left` and `#main` are Sections whereas `#header` is a View. Looking at the launchables of the Section `#main` we can find the second section level as `#sub-section` again describes a Section.

# View Configuration

You can configure a View's life cycle by defining its _cycle_ methods being _load_, _launch_, _update_ and _unload_.

# Section View Configuration

You can configure a Section View's transition states by defining its _transitionStates_ properties being _before_, _after_ and _final_ by default. Furthermore a set of transition preset is provided. Alternatively you can set its _transition_ method to fully customize the Sections reload.








