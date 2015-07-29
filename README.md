ViewlauncherJS
==============
ViewlauncherJS allows to automatically launch Backbone Views and thus to extend HTML elements with client-side user interaction. Comparable with CSS definitions, Views get initialized whenever corresponding selectors are detected in a documents mark-up. As the user navigates by following internal links, mark-up will asynchronously be requested and, once loaded, be scanned for matching View definitions again. Furthermore ViewlauncherJS provides Section Views for custom transitions allowing partial page reload.

## Use Case

If you're creating CMS-based websites mostly rendering SEO-friendly HTML pages, ViewlauncherJS provides you with some helpful mechanics to increase the site's user experience. Based on the framework BackboneJS, it offers a way to meaningfully structure your code and provides a straightforward API for transitions.

You are free to use all of the advantages of BackboneJS, but the primar goal behind ViewlauncherJS is to improve websites rather than web applications. Instead of rendering Backbone Views according to a Model, ViewlauncherJS associates them with exisiting elements (which have been rendered on server-side already)  

## Launch Configuration

There are three types of Views available in ViewlauncherJS:
 - *Backbone View* (augmented by the _cycle_ property)
 - *Section View* (extending Backbone View)
 - *Launcher View* (extending Section View)

Views in ViewlauncherJS are associated directly with matching selectors. The definitions are configured in the _launchable hash_ of the *Launcher View*, which starts up things and by default belongs to the body element. Every Section View inherits a _launchables_ configuration property (assigned by the Launcher View) defining potential selectors and its corresponding Views. 

Keys of a launchable hash property need to be selectors, whereas values are a reference to their Views (being objects to extend Backbone Views). If a View contains a `section` property, this value is going to represent the View (being a Section View in this case)

Assuming the Views _Header_, _Gallery_, _ContactForm_ and the Section View _MainSection_ are defined already as objects, here's an example for a _launchable hash_ in CoffeeScript: 

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

## View Configuration

You can configure a View's life cycle by defining its _cycle_ methods being _load_, _launch_, _update_ and _unload_.

## Section View Configuration

You can configure a Section View's transition states by defining its _transitionStates_ properties being _before_, _after_ and _final_ by default. Furthermore a set of transition preset is provided. Alternatively you can set its _transition_ method to fully customize the Section Views reload.








