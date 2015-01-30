(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'backbone', 'underscore', 'exports'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('$'), require('Backbone'), require('_'), require('exports'));
  } else {
    root.Viewlauncher = factory(root.$, root.Backbone, root._, root.exports);
  }
}(this, function($, Backbone, _, exports) {
var ElementSynchronizer, Launcher, PageCollection, PageModel, SectionContent, ViewCollection, ViewLoader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ElementSynchronizer = ElementSynchronizer = (function() {
  ElementSynchronizer.prototype.$el1 = null;

  ElementSynchronizer.prototype.$el2 = null;

  ElementSynchronizer.prototype.path = '';

  function ElementSynchronizer($el1, $el2, path) {
    this.$el1 = $el1;
    this.$el2 = $el2;
    this.path = path;
    return this;
  }

  ElementSynchronizer.prototype.getAttributesOf = function($target, allowedAttrs) {
    var attrs;
    if (allowedAttrs == null) {
      allowedAttrs = false;
    }
    attrs = [];
    $target.each(function() {
      var a, doCollectAttribute, props, _i, _len, _ref;
      props = {};
      _ref = this.attributes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        a = _ref[_i];
        doCollectAttribute = !allowedAttrs || _.indexOf(allowedAttrs, a.name) >= 0;
        if (doCollectAttribute) {
          props[a.name] = a.value;
        }
      }
      return attrs.push(props);
    });
    return attrs;
  };

  ElementSynchronizer.prototype.find = function(path) {
    return this.find1(path).add(this.find2(path));
  };

  ElementSynchronizer.prototype.find1 = function(path) {
    if (path == null) {
      path = '';
    }
    return this.$el1.find(path);
  };

  ElementSynchronizer.prototype.find2 = function(path) {
    if (path == null) {
      path = '';
    }
    return this.$el2.find(path);
  };

  ElementSynchronizer.prototype.html1 = function(path) {
    if (path == null) {
      path = '';
    }
    return this.$el1.html();
  };

  ElementSynchronizer.prototype.html2 = function(path) {
    if (path == null) {
      path = '';
    }
    return this.$el2.html();
  };

  ElementSynchronizer.prototype.sameSize = function(path, filter) {
    if (filter == null) {
      filter = '*';
    }
    return this.find1(path).filter(filter).length === this.find2(path).filter(filter).length;
  };

  ElementSynchronizer.prototype.$ = function(path, opts) {
    var $bothElements, $el1, $el2, filter, self, sync;
    if (path == null) {
      path = '';
    }
    if (opts == null) {
      opts = {
        sync: 'none'
      };
    }
    if (!this.sameSize(path)) {
      return false;
    }
    filter = opts.filter, sync = opts.sync;
    $el1 = path !== '' ? this.find1(path) : this.$el1;
    $el2 = path !== '' ? this.find2(path) : this.$el2;
    $bothElements = this.find(path).filter(filter || '*');
    if (!sync) {
      return $bothElements;
    }
    self = this;
    return $bothElements.each(function() {
      var $source, $target, index;
      index = $(this).index();
      $target = $el1.eq(index);
      $source = $el2.eq(index);
      if (sync === 'content' || sync === 'all') {
        self.syncContent($target, $source);
      }
      if (sync === 'attributes' || sync === 'all') {
        return self.syncAttributes($target, self.getAttributesOf($source));
      }
    });
  };

  ElementSynchronizer.prototype.syncHtmlOf = function(path) {
    return this.syncContentOf(path, 'html');
  };

  ElementSynchronizer.prototype.syncTextOf = function(path) {
    return this.syncContentOf(path, 'text');
  };

  ElementSynchronizer.prototype.syncContentOf = function(path, method) {
    if (path == null) {
      path = '';
    }
    if (!this.sameSize(path)) {
      return false;
    }
    this.syncContent(this.find1(path), this.find2(path), method);
    return true;
  };

  ElementSynchronizer.prototype.syncContent = function($target, $source, method) {
    if (method == null) {
      method = 'html';
    }
    return $target.each(function(i) {
      return $(this)[method]($source.eq(i)[method]());
    });
  };

  ElementSynchronizer.prototype.classesOf = function(path) {
    return this.syncAttributesOf(path, ['class']);
  };

  ElementSynchronizer.prototype.idsOf = function(path) {
    return this.syncAttributesOf(path, ['id']);
  };

  ElementSynchronizer.prototype.stylesOf = function(path) {
    return this.syncAttributesOf(path, ['style']);
  };

  ElementSynchronizer.prototype.syncAttributesOf = function(path, allowedAttrs) {
    if (path == null) {
      path = '';
    }
    if (!this.sameSize(path)) {
      return false;
    }
    this.syncAttributes(this.find1(path), this.getAttributesOf(this.find2(path), allowedAttrs));
    return true;
  };

  ElementSynchronizer.prototype.syncAttributes = function($target, attrs) {
    return $target.each(function(i) {
      return $(this).removeAttr(_.keys(attrs[i]).join(' ')).attr(attrs[i]);
    });
  };

  return ElementSynchronizer;

})();

PageModel = Backbone.Model.extend({
  defaults: {
    href: 'untitled-page',
    html: '',
    $html: null,
    bodyClasses: '',
    title: 'untitled page'
  },
  fetching: null,
  fetch: function(context, next) {
    var page, url;
    page = this;
    url = page.collection.config.root + '/' + page.get('href');
    return this.fetching = $.ajax({
      type: 'GET',
      url: url
    }).done(function(html) {
      page.parseHtml(html);
      return next.call(context, page);
    }).fail(function(error) {
      throw new Error("Couldn't load page " + url + " (" + error.statusText + ")");
    });
  },
  parseHtml: function(html) {
    var $html, matches;
    this.set('html', html);
    this.set('$html', $html = $(html));
    if (matches = html.match(/<body[^>]+class="\s*([^"]*)\s*"[^>]*>/)) {
      this.set('bodyClasses', _.compact(matches[1].split(' ')));
    }
    this.set('title', $html.filter('title').text());
    return this;
  },
  is: function(className) {
    var bodyClasses;
    bodyClasses = this.get('bodyClasses');
    return _.indexOf(bodyClasses, className) >= 0;
  },
  $: function(path) {
    return this.get('$html').find(path);
  },
  sync: function(path, $currContext) {
    if (path == null) {
      path = '';
    }
    if ($currContext == null) {
      $currContext = $('html');
    }
    return new ElementSynchronizer($currContext.find(path), this.$(path), path);
  }
});

PageCollection = Backbone.Collection.extend({
  config: {},
  model: PageModel,
  initialize: function(models, config) {
    if (models == null) {
      models = [];
    }
    this.config = config;
    if (models.length === 0) {
      return this.add(new this.model({
        href: this.config.initialHref
      })).parseHtml(this.config.initialHtml);
    }
  },
  byHref: function(href, context, next) {
    var page;
    href = href.slice(0, 1) === '/' ? href.slice(1) : href;
    if (page = this.findWhere({
      href: href
    })) {
      return next.call(context, page);
    } else {
      return this.add({
        href: href
      }).fetch(context, next);
    }
  }
});

ViewCollection = (function() {
  function ViewCollection(views) {
    this.reset(views);
  }

  ViewCollection.prototype.reset = function(views) {
    var view, _i, _j, _len, _len1, _ref;
    if (this.views) {
      _ref = this.views;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        view.remove();
      }
    }
    this.views = [];
    if (views) {
      if (!_.isArray(views)) {
        views = [views];
      }
      for (_j = 0, _len1 = views.length; _j < _len1; _j++) {
        view = views[_j];
        this.push(view);
      }
    }
    return this;
  };

  ViewCollection.prototype.push = function(view) {
    this.views.push(view);
    return this.length = this.views.length;
  };

  ViewCollection.prototype.each = function(fnc, views, context) {
    var i, isFnc, isStr, view, _i, _len, _results;
    if (views == null) {
      views = this.views;
    }
    if (context == null) {
      context = this;
    }
    isFnc = _.isFunction(fnc);
    isStr = !isFnc && _.isString(fnc);
    _results = [];
    for (i = _i = 0, _len = views.length; _i < _len; i = ++_i) {
      view = views[i];
      if (isFnc) {
        _results.push(fnc.call(context, view, i));
      } else if (isStr) {
        _results.push(view[fnc].call(context, view, i));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  ViewCollection.prototype.find = function(key, value) {
    return this.where(key, value)[0];
  };

  ViewCollection.prototype.where = function(key, value, limit) {
    var isArray, results;
    results = [];
    isArray = _.isArray(key);
    this.each(function(view) {
      var val;
      val = isArray ? this.resolveArrayPath(view, key) : view[key];
      if (val === value) {
        return results.push(view);
      }
    });
    return results;
  };

  ViewCollection.prototype.first = function() {
    return this.views.slice(0, 1)[0];
  };

  ViewCollection.prototype.last = function() {
    return this.views.slice(-1)[0];
  };

  ViewCollection.prototype.set = function(property, value) {
    if (_.isObject(property)) {
      this.each(function(view) {
        var prop, val, _results;
        _results = [];
        for (prop in property) {
          val = property[prop];
          _results.push(view[prop] = val);
        }
        return _results;
      });
    } else {
      this.each(function(view) {
        return view[property] = value;
      });
    }
    return this;
  };

  ViewCollection.prototype.get = function(property1, property2) {
    var results;
    results = property2 ? {} : [];
    this.each(function(view) {
      var key, val;
      val = (function() {
        switch (false) {
          case !_.isArray(property1):
            return this.resolveArrayPath(view, property1);
          case !_.isFunction(view[property1]):
            return view[property1].call(view);
          default:
            return view[property1];
        }
      }).call(this);
      if (property2) {
        key = (function() {
          switch (false) {
            case !_.isArray(property2):
              return this.resolveArrayPath(view, property2);
            default:
              return property2;
          }
        }).call(this);
        return results[key] = val;
      } else if (val) {
        return results.push(val);
      }
    });
    return results;
  };

  ViewCollection.prototype.waitFor = function(fncName, context, next, options, minDuration, maxDuration) {
    var actions, isDone, maxClock, useArray, waitForMinDuration;
    if (context == null) {
      context = this;
    }
    if (minDuration == null) {
      minDuration = 0;
    }
    if (maxDuration == null) {
      maxDuration = 20000;
    }
    isDone = false;
    waitForMinDuration = minDuration > 0;
    if (waitForMinDuration) {
      setTimeout(function() {
        if (isDone) {
          return next.call(context);
        } else {
          return waitForMinDuration = false;
        }
      }, minDuration);
    }
    if (maxDuration > 0) {
      maxClock = setTimeout(function() {
        throw Error("max wait duration of " + maxDuration + " exceeded for function " + fncName);
        return next.call(context);
      }, maxDuration);
    }
    useArray = _.isArray(fncName);
    actions = this.each(function(view) {
      var dfd, fnc;
      dfd = new $.Deferred();
      fnc = useArray ? this.resolveArrayPath(view, fncName) : view[fncName];
      if (_.isArray(options)) {
        fnc.apply(view, [dfd.resolve].concat(options));
      } else {
        fnc.call(view, dfd.resolve);
      }
      return dfd;
    });
    $.when.apply($, actions).done(function() {
      if (maxClock) {
        clearTimeout(maxClock);
      }
      if (!waitForMinDuration) {
        next.call(context);
      }
      return isDone = true;
    });
    return this;
  };

  ViewCollection.prototype.resolveArrayPath = function(obj, path) {
    var chunk, _i, _len;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      chunk = path[_i];
      obj = obj[chunk];
    }
    return obj;
  };

  ViewCollection.prototype.$ = function(selector) {
    var $return, views;
    $return = $([]);
    views = _.filter(this.views, function(view) {
      return view.$el.is(selector);
    });
    if (views.length > 0) {
      this.each((function(view) {
        return $return = $return.add(view.$el);
      }), views);
    }
    return $return;
  };

  return ViewCollection;

})();

ViewLoader = (function(_super) {
  __extends(ViewLoader, _super);

  function ViewLoader(views) {
    ViewLoader.__super__.constructor.call(this, views);
  }

  ViewLoader.prototype.ViewPrototype = {
    initialize: function(config) {
      this.config = config;
    },
    cycle: {
      load: function(next) {
        return next.call(this);
      },
      launch: function() {},
      update: function() {},
      unload: function(next) {
        return next.call(this);
      }
    }
  };

  ViewLoader.prototype.findAndLoad = function(views, $html, context, minLoadingTime, next) {
    var detectedViews, i, requirePaths, view;
    detectedViews = _.filter(views, function(view) {
      return $html.is(":has(" + view.selector + ")");
    });
    requirePaths = (function() {
      var _i, _len, _results;
      _results = [];
      for (i = _i = 0, _len = detectedViews.length; _i < _len; i = ++_i) {
        view = detectedViews[i];
        if (view.requirePath) {
          _results.push(view.requirePath);
        } else {
          _results.push(this.createViewInstances($html, view, view));
        }
      }
      return _results;
    }).call(this);
    this.loadInstances(context, next, minLoadingTime);
    return this;
  };

  ViewLoader.prototype.createViewInstances = function($html, viewLoader, viewPrototype) {
    var loader;
    loader = this;
    return $html.find(viewLoader.selector).each(function(i) {
      var defaultCycle, defaultModule, extension;
      defaultModule = _.extend({}, loader.ViewPrototype);
      defaultCycle = _.extend({}, defaultModule.cycle);
      extension = _.extend(defaultModule, viewPrototype);
      extension.cycle = _.extend(defaultCycle, extension.cycle);
      viewPrototype = Backbone.View.extend(extension);
      return loader.push(new viewPrototype(_.extend({
        el: $(this)
      }, viewLoader)));
    });
  };

  ViewLoader.prototype.loadInstances = function(context, next, minLoadingTime) {
    if (minLoadingTime == null) {
      minLoadingTime = 0;
    }
    return this.waitFor(['cycle', 'load'], context, next, null, minLoadingTime);
  };

  ViewLoader.prototype.launchInstances = function() {
    return this.each(function(instance) {
      return instance.cycle.launch.call(instance);
    });
  };

  ViewLoader.prototype.updateInstances = function(nextPage, $el) {
    return this.each(function(instance) {
      var pageSync;
      pageSync = nextPage.sync(instance.config.selector, $el);
      return instance.cycle.update.call(instance, pageSync);
    });
  };

  ViewLoader.prototype.unloadInstances = function(context, next) {
    return this.waitFor(['cycle', 'unload'], this, function() {
      this.reset();
      return next.call(context);
    });
  };

  return ViewLoader;

})(ViewCollection);

SectionContent = Backbone.View.extend({
  sections: null,
  views: null,
  states: null,
  useClassTransitions: false,
  initialize: function(config) {
    this.config = config;
    this.states = this.config.section.transitionStates;
    this.useClassTransitions = _.isArray(this.states);
    return this.$el.html(this.config.html);
  },
  to: function(stateName, duration) {
    var state;
    if (duration == null) {
      duration = 0;
    }
    state = this.states[stateName];
    if (!state) {
      return;
    }
    if (!this.toStateClass(state)) {
      if (duration === 0) {
        this.$el.css(state);
        return this;
      } else {
        return this.$el.animate(state, duration).promise();
      }
    }
  },
  toStateClass: function(state) {
    if (!this.useClassTransitions) {
      return false;
    }
    this.$el.removeClass(this.states.join(' ')).addClass(state);
    return true;
  },
  findSynced: function(path, view) {
    return this.$(path).add(view.$(path));
  },
  hasBodyClass: function(className) {
    return this.config.page.is(className);
  },
  size: function() {
    return {
      width: this.$el.width(),
      height: this.$el.height()
    };
  },
  pos: function() {
    return {
      top: this.$el.position().top,
      left: this.$el.position().left
    };
  },
  off: function() {
    return {
      top: this.$el.offset().top,
      left: this.$el.offset().left
    };
  }
});

exports.Section = Backbone.View.extend({
  sections: null,
  views: null,
  contents: null,
  transitionStates: {
    before: {
      display: 'block',
      opacity: 0,
      position: 'absolute',
      top: 0,
      left: 0
    },
    after: {
      position: 'absolute',
      opacity: 1
    },
    final: {
      position: 'static'
    }
  },
  transitionPresets: {
    cut: function(curr, next, done) {
      if (curr) {
        curr.to('after');
      }
      next.to('after');
      return done();
    },
    fadein: function(curr, next, done, duration) {
      if (duration == null) {
        duration = 1000;
      }
      if (curr) {
        curr.to('after');
      }
      return next.to('after', duration).done(done);
    },
    whitefade: function(curr, next, done, duration) {
      if (duration == null) {
        duration = 1000;
      }
      if (!curr) {
        return next.to('after', duration / 2, done);
      }
      return curr.to('after').to('before', duration / 2).done(next.to('after', duration / 2)).done(done);
    },
    crossfade: function(curr, next, done, duration) {
      if (duration == null) {
        duration = 1000;
      }
      if (curr) {
        curr.to('after').to('before', duration, done);
      }
      return next.to('after', duration).done(done);
    }
  },
  events: {
    'click a[href]': function(e) {
      return this.getLauncher().requestClickedLink(e, this);
    }
  },
  initialize: function(config) {
    this.config = config;
    return this.config.launcher.trigger('sectionAdded', this.el, this.config);
  },
  findAndLoad: function(next, isTriggerSection) {
    var $el, config, isLauncher, launchable, launchables, launcher, minLoadingTime, section, sectionSelector, sections, sectionsLaunchables, selector, views, _ref;
    isLauncher = !this.config.launcher;
    launcher = this.getLauncher();
    minLoadingTime = isTriggerSection ? launcher.config.minLoadingTime : 0;
    sectionsLaunchables = {
      sections: [],
      views: []
    };
    _ref = this.config.launchables;
    for (selector in _ref) {
      launchable = _ref[selector];
      section = launchable.section, launchables = launchable.launchables;
      sectionSelector = _.compact([this.config.sectionSelector, selector]).join(' ');
      config = {
        section: this,
        selector: selector,
        launchables: launchables,
        sectionSelector: sectionSelector,
        launcher: launcher
      };
      switch (false) {
        case !section:
          if (_.isString(section)) {
            section = {
              requirePath: section
            };
          }
          sectionsLaunchables.sections.push(_.extend(config, {
            type: 'section',
            extension: section
          }));
          break;
        case !launchable:
          if (_.isString(launchable)) {
            launchable = {
              requirePath: launchable
            };
          }
          sectionsLaunchables.views.push(_.extend(config, {
            type: 'view'
          }, launchable));
          break;
        default:
          throw new Error("Invalid Hash Type: Use either a string or a section hash as value for " + selector);
      }
    }
    if (!this.contents) {
      this.render();
    }
    sections = sectionsLaunchables.sections, views = sectionsLaunchables.views;
    $el = this.contents.last().$el;
    return this.loadSections($el, sections, function() {
      return this.sections.waitFor('findAndLoad', this, function() {
        return this.loadViews($el, views, minLoadingTime, function() {
          if (isTriggerSection === true) {
            return this.sections.waitFor('playTransition', this, function() {
              this.views.launchInstances(false);
              launcher.trigger('sectionReady', this.sections.get('el'), this.el);
              return next.call(this);
            });
          } else {
            launcher.trigger('subSectionLoaded', this.config.selector);
            if (this.cycle && this.cycle.launch) {
              this.cycle.launch.call(this);
            }
            return next.call(this);
          }
        });
      });
    });
  },
  render: function(page, $context) {
    var html, isInitialContent, isLauncher, launcher, sectionContent;
    html = page ? page.sync(this.config.selector, $context).html2() : this.$el.html();
    launcher = this.config.launcher || this;
    if (page == null) {
      page = launcher.currPage || launcher.nextPage;
    }
    isLauncher = !this.config.launcher;
    isInitialContent = !this.contents;
    if (isInitialContent && !isLauncher) {
      this.$el.empty();
    }
    sectionContent = new SectionContent({
      section: this,
      className: launcher.config.sectionContentClassName,
      html: html,
      page: page
    });
    sectionContent.to(this.contents ? 'before' : 'final');
    if (isLauncher) {
      sectionContent.setElement(this.el);
    } else {
      this.$el.append(sectionContent.$el);
    }
    if (isInitialContent) {
      this.resetContent(sectionContent);
    } else {
      this.contents.push(sectionContent);
    }
    return this;
  },
  resetContent: function(sectionContent) {
    return this.contents = new ViewCollection(sectionContent);
  },
  playTransition: function(next) {
    var currContent, done, nextContent, section, transitionFnc;
    currContent = this.contents.length > 1 ? this.contents.first() : null;
    nextContent = this.contents.last();
    section = this;
    done = function() {
      if (currContent) {
        section.unloadLaunchables(function() {
          return currContent.remove();
        });
      }
      section.launchViews();
      section.resetContent(nextContent.to('final'));
      return next.call(section);
    };
    transitionFnc = _.isString(this.transition) ? this.transitionPresets[this.transition] : this.transition;
    return transitionFnc.call(this, currContent, nextContent, done, this.config.duration);
  },
  launchViews: function(launchSectionsViews) {
    if (launchSectionsViews == null) {
      launchSectionsViews = true;
    }
    this.views.launchInstances();
    if (launchSectionsViews) {
      return this.sections.each(function(section) {
        return section.launchViews();
      });
    }
  },
  unloadLaunchables: function(next) {
    var sectionContent;
    sectionContent = this.contents.first();
    return sectionContent.views.unloadInstances(this, function() {
      return sectionContent.sections.waitFor('unloadLaunchables', this, next);
    });
  },
  loadSections: function($el, sections, next) {
    var ExtendedSection, detectedSections, launcher, requiredSections, section;
    detectedSections = _.filter(sections, function(section) {
      return $el.is(":has(" + section.selector + ")");
    });
    requiredSections = _.filter(detectedSections, function(section) {
      return _.isString(section.requirePath);
    });
    launcher = this.config.launcher || this;
    this.sections = this.contents.last().sections = new ViewCollection().reset((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = detectedSections.length; _i < _len; _i++) {
        section = detectedSections[_i];
        ExtendedSection = exports.Section.extend(section.extension);
        section = new ExtendedSection({
          el: $el.find(section.selector),
          launchables: section.launchables,
          selector: section.selector,
          sectionSelector: section.sectionSelector,
          section: section.section,
          launcher: launcher,
          imagesToLoad: launcher.config.imagesToLoad
        });
        _results.push(section);
      }
      return _results;
    })());
    return next.call(this);
  },
  loadViews: function($el, views, minLoadingTime, next) {
    return this.views = this.contents.last().views = new ViewLoader().findAndLoad(views, $el, this, minLoadingTime, function() {
      var section;
      section = this;
      return this.loadContentAssets(function() {
        return next.call(section);
      });
    });
  },
  loadContentAssets: function(next) {
    return next.call(this);
  },
  reload: function(page, next, context) {
    if (!this.getLauncher().currPage) {
      return this.findAndLoad(next, true);
    }
    return this.reloadSections(page, function() {
      this.views.updateInstances(page, this.$el);
      return this.sections.waitFor('playTransition', context, next);
    });
  },
  reloadSections: function(page, next) {
    var $el;
    $el = this.$el;
    this.sections.each(function(section) {
      return section.render(page, $el);
    });
    return this.sections.waitFor('findAndLoad', this, next, [true]);
  },
  getLauncher: function() {
    return this.config.launcher || this;
  }
});

Launcher = exports.Section.extend({
  currPage: null,
  nextPage: null,
  pages: null,
  router: null,
  loading: false,
  config: {
    maxTransitionTime: 10000,
    root: '',
    pushState: true,
    sectionContentClassName: 'section-content',
    imagesToLoad: 'img:not(.dont-preload)',
    minLoadingTime: 0
  },
  initialize: function(config) {
    return this.config = _.extend(this.config, config, {
      sectionSelector: ''
    });
  },
  start: function() {
    var Router, href, launcher;
    launcher = this;
    Router = Backbone.Router.extend({
      routes: {
        '': 'request',
        '*path': 'request'
      },
      request: function(href) {
        return launcher.requestPage(href, 'navigated');
      }
    });
    this.router = new Router();
    Backbone.history.start({
      pushState: this.config.pushState,
      root: this.config.root,
      silent: true
    });
    this.trigger('historyStarted', this.router);
    href = Backbone.history.fragment;
    this.pages = new PageCollection(this.config.pages, {
      root: this.config.root,
      initialHref: href,
      initialHtml: $('html').html()
    });
    this.requestPage(href, 'called');
    return this;
  },
  requestClickedLink: function(e, section) {
    var $a, href, root;
    if (section == null) {
      section = this;
    }
    e.stopPropagation();
    $a = $(e.currentTarget);
    href = {
      prop: $a.prop('href'),
      attr: $a.attr('href')
    };
    root = location.protocol + '//' + location.host + this.config.root;
    if (href.prop.slice(0, root.length) === root) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
      if (this.requestPage(href.attr, 'linked', {
        section: section
      })) {
        return Backbone.history.navigate(href.attr, {
          silent: true
        });
      }
    }
  },
  getSectionToRefresh: function(type, opts) {
    var getSectionByHrefChange, href, section;
    section = opts.section, href = opts.href;
    getSectionByHrefChange = this.config.getSectionByHrefChange;
    switch (type) {
      case 'called':
        return this;
      case 'linked':
        if (section && section.sections.length > 0) {
          return section;
        } else {
          return this;
        }
        break;
      case 'navigated':
        if (getSectionByHrefChange) {
          return getSectionByHrefChange.call(this, this.currPage.get('href'), href);
        } else {
          return this;
        }
        break;
      default:
        throw new Error('invalid request type');
    }
  },
  requestPage: function(href, type, opts) {
    var launcher, section, _ref;
    if (opts == null) {
      opts = {};
    }
    if (this.loading && this.loading.state() === 'pending' || ((_ref = this.currPage) != null ? _ref.get('href') : void 0) === href) {
      return false;
    }
    section = this.getSectionToRefresh(type, _.extend(opts, {
      href: href
    }));
    launcher = this;
    this.trigger('pageRequested', {
      href: href,
      type: type,
      section: section,
      sections: section != null ? section.sections : void 0
    });
    this.pages.byHref(href, this, function(page) {
      var loading;
      this.trigger('pageFetched', page);
      loading = this.loading = new $.Deferred();
      this.nextPage = page;
      return section.reload(page, function() {
        this.nextPage = null;
        this.currPage = page;
        this.trigger('transitionDone', this.el);
        return loading.resolve(launcher);
      }, this);
    });
    return true;
  }
});

//# sourceMappingURL=data:application/json;base64,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QTBCO0FBQUEsTUFBQyxNQUFBLElBQUQ7QUFBQSxNQUFPLE1BQUEsSUFBUDtBQUFBLE1BQWEsU0FBQSxPQUFiO0FBQUEsTUFBc0IsUUFBQSxvQkFBUyxPQUFPLENBQUUsaUJBQXhDO0tBQTFCLENBUEEsQ0FBQTtBQUFBLElBUUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsSUFBZCxFQUFvQixJQUFwQixFQUF1QixTQUFDLElBQUQsR0FBQTtBQUV0QixVQUFBLE9BQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELENBQVMsYUFBVCxFQUF3QixJQUF4QixDQUFBLENBQUE7QUFBQSxNQUNBLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBRCxHQUFlLElBQUEsQ0FBQyxDQUFDLFFBQUYsQ0FBQSxDQUR6QixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBSFosQ0FBQTthQUtBLE9BQU8sQ0FBQyxNQUFSLENBQWdCLElBQWhCLEVBQXNCLFNBQUEsR0FBQTtBQUVyQixRQUFBLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBWixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBRFosQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxnQkFBVCxFQUEyQixJQUFDLENBQUEsRUFBNUIsQ0FGQSxDQUFBO2VBR0EsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsUUFBaEIsRUFMcUI7TUFBQSxDQUF0QixFQU9DLElBUEQsRUFQc0I7SUFBQSxDQUF2QixDQVJBLENBQUE7QUF3QkEsV0FBTyxJQUFQLENBMUJZO0VBQUEsQ0ExRWI7Q0FGVSxDQXRzQlgsQ0FBQSIsImZpbGUiOiJ2aWV3bGF1bmNoZXIuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJFbGVtZW50U3luY2hyb25pemVyID0gY2xhc3MgRWxlbWVudFN5bmNocm9uaXplclxuXG5cbiMgUFJPUEVSVElFU1xuXG5cblx0JGVsMTogbnVsbFxuXHQkZWwyOiBudWxsXG5cdHBhdGg6ICcnXG5cblxuIyBDT05TVFJVQ1RPUlxuXG5cblx0Y29uc3RydWN0b3I6IChAJGVsMSwgQCRlbDIsIEBwYXRoKSAtPiByZXR1cm4gQFxuXHRcblxuIyBHRVRURVIgTUVUSE9EU1xuXG5cblx0Z2V0QXR0cmlidXRlc09mOiAoJHRhcmdldCwgYWxsb3dlZEF0dHJzID0gZmFsc2UpIC0+XG5cdFxuXHRcdGF0dHJzID0gW11cblx0XHQkdGFyZ2V0LmVhY2ggLT4gXG5cdFx0XHRwcm9wcyA9IHt9XG5cdFx0XHRmb3IgYSBpbiBAYXR0cmlidXRlc1xuXHRcdFx0XHRkb0NvbGxlY3RBdHRyaWJ1dGUgPSBub3QgYWxsb3dlZEF0dHJzIG9yIF8uaW5kZXhPZihhbGxvd2VkQXR0cnMsIGEubmFtZSkgPj0gMFxuXHRcdFx0XHRpZiBkb0NvbGxlY3RBdHRyaWJ1dGUgdGhlbiBwcm9wc1sgYS5uYW1lIF0gPSBhLnZhbHVlXG5cdFx0XHRhdHRycy5wdXNoIHByb3BzXG5cdFx0YXR0cnNcdFxuXG5cdGZpbmQ6IChwYXRoKSAtPiBcblxuXHRcdEBmaW5kMShwYXRoKS5hZGQoIEBmaW5kMihwYXRoKSApXG5cdFxuXHRmaW5kMTogKHBhdGggPSAnJykgLT4gXG5cblx0XHRAJGVsMS5maW5kIHBhdGhcblx0XG5cdGZpbmQyOiAocGF0aCA9ICcnKSAtPiBcblxuXHRcdEAkZWwyLmZpbmQgcGF0aFxuXG5cdGh0bWwxOiAocGF0aD0nJykgLT5cblxuXHRcdEAkZWwxLmh0bWwoKVxuXG5cdGh0bWwyOiAocGF0aD0nJykgLT5cblxuXHRcdEAkZWwyLmh0bWwoKVxuXG5cdHNhbWVTaXplOiAocGF0aCwgZmlsdGVyPScqJykgLT4gXG5cblx0XHRAZmluZDEocGF0aCkuZmlsdGVyKGZpbHRlcikubGVuZ3RoIGlzIEBmaW5kMihwYXRoKS5maWx0ZXIoZmlsdGVyKS5sZW5ndGhcblxuXG4jIEhZQlJJRCBNRVRIT0RcblxuXG5cdCQ6IChwYXRoID0gJycsIG9wdHMgPSB7IHN5bmM6J25vbmUnIH0pIC0+IFxuXHRcdFxuXHRcdHJldHVybiBmYWxzZSB1bmxlc3MgQHNhbWVTaXplIHBhdGhcblx0XHR7ZmlsdGVyLHN5bmN9ID0gb3B0c1xuXHRcdCRlbDEgPSBpZiBwYXRoIGlzbnQgJycgdGhlbiBAZmluZDEocGF0aCkgZWxzZSBAJGVsMVxuXHRcdCRlbDIgPSBpZiBwYXRoIGlzbnQgJycgdGhlbiBAZmluZDIocGF0aCkgZWxzZSBAJGVsMlxuXHRcdCRib3RoRWxlbWVudHMgPSBAZmluZChwYXRoKS5maWx0ZXIoZmlsdGVyIHx8ICcqJylcblx0XHRpZiBub3Qgc3luYyB0aGVuIHJldHVybiAkYm90aEVsZW1lbnRzXG5cdFx0c2VsZiA9IEBcblx0XHQkYm90aEVsZW1lbnRzLmVhY2ggKCkgLT4gXG5cdFx0XHRcblx0XHRcdGluZGV4ID0gJChAKS5pbmRleCgpXG5cdFx0XHQkdGFyZ2V0ID0gJGVsMS5lcSBpbmRleFxuXHRcdFx0JHNvdXJjZSA9ICRlbDIuZXEgaW5kZXhcblx0XHRcdFxuXHRcdFx0aWYgc3luYyBpcyAnY29udGVudCcgb3Igc3luYyBpcyAnYWxsJyBcblx0XHRcdFx0c2VsZi5zeW5jQ29udGVudCAkdGFyZ2V0LCAkc291cmNlXG5cdFx0XHRcblx0XHRcdGlmIHN5bmMgaXMgJ2F0dHJpYnV0ZXMnIG9yIHN5bmMgaXMgJ2FsbCcgXG5cdFx0XHRcdHNlbGYuc3luY0F0dHJpYnV0ZXMgJHRhcmdldCwgc2VsZi5nZXRBdHRyaWJ1dGVzT2YgJHNvdXJjZVx0XHRcdFx0XHRcblxuXG4jIENPTlRFTlQgU1lOQyBNRVRIT0RTXG5cblxuXHRzeW5jSHRtbE9mOiAocGF0aCkgLT4gXG5cblx0XHRAc3luY0NvbnRlbnRPZiBwYXRoLCAnaHRtbCdcblx0XG5cdHN5bmNUZXh0T2Y6IChwYXRoKSAtPiBcblxuXHRcdEBzeW5jQ29udGVudE9mIHBhdGgsICd0ZXh0J1xuXHRcblx0c3luY0NvbnRlbnRPZjogKHBhdGggPSAnJywgbWV0aG9kKSAtPiBcblx0XG5cdFx0cmV0dXJuIGZhbHNlIHVubGVzcyBAc2FtZVNpemUgcGF0aFxuXHRcdEBzeW5jQ29udGVudCBAZmluZDEocGF0aCksIEBmaW5kMihwYXRoKSwgbWV0aG9kXG5cdFx0dHJ1ZVxuXHRcblx0c3luY0NvbnRlbnQ6ICgkdGFyZ2V0LCAkc291cmNlLCBtZXRob2QgPSAnaHRtbCcpIC0+IFxuXG5cdFx0JHRhcmdldC5lYWNoIChpKSAtPiAkKEApWyBtZXRob2QgXSggJHNvdXJjZS5lcShpKVsgbWV0aG9kIF0oKSApXG5cblxuIyBBVFRSSUJVVEUgU1lOQyBNRVRIT0RTXG5cblxuXHRjbGFzc2VzT2Y6IChwYXRoKSAtPiBcblxuXHRcdEBzeW5jQXR0cmlidXRlc09mIHBhdGgsWydjbGFzcyddXG5cdFxuXHRpZHNPZjogKHBhdGgpIC0+IFxuXG5cdFx0QHN5bmNBdHRyaWJ1dGVzT2YgcGF0aCxbJ2lkJ11cblx0XG5cdHN0eWxlc09mOiAocGF0aCkgLT4gXG5cblx0XHRAc3luY0F0dHJpYnV0ZXNPZiBwYXRoLFsnc3R5bGUnXVxuXG5cdHN5bmNBdHRyaWJ1dGVzT2Y6IChwYXRoID0gJycsIGFsbG93ZWRBdHRycykgLT5cblx0XG5cdFx0cmV0dXJuIGZhbHNlIHVubGVzcyBAc2FtZVNpemUgcGF0aFxuXHRcdEBzeW5jQXR0cmlidXRlcyBAZmluZDEocGF0aCksIEBnZXRBdHRyaWJ1dGVzT2YoIEBmaW5kMihwYXRoKSwgYWxsb3dlZEF0dHJzKVxuXHRcdHRydWVcblx0XG5cdHN5bmNBdHRyaWJ1dGVzOiAoJHRhcmdldCwgYXR0cnMpIC0+IFxuXG5cdFx0JHRhcmdldC5lYWNoIChpKSAtPiAkKEApLnJlbW92ZUF0dHIoXy5rZXlzKGF0dHJzW2ldKS5qb2luKCcgJykpLmF0dHIoYXR0cnNbaV0pXHRcblxuXHRcblxuUGFnZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXHRcdFx0XHRcblxuXHRkZWZhdWx0czpcblx0XHRocmVmOiAndW50aXRsZWQtcGFnZSdcblx0XHRodG1sOiAnJ1xuXHRcdCRodG1sOiBudWxsXG5cdFx0Ym9keUNsYXNzZXM6ICcnXG5cdFx0dGl0bGU6ICd1bnRpdGxlZCBwYWdlJ1xuXG5cdGZldGNoaW5nOiBudWxsXG5cblx0ZmV0Y2g6IChjb250ZXh0LCBuZXh0KSAtPlxuXG5cdFx0cGFnZSA9IEBcblx0XHR1cmwgPSBwYWdlLmNvbGxlY3Rpb24uY29uZmlnLnJvb3QgKyAnLycgKyBwYWdlLmdldCAnaHJlZidcblx0XHRAZmV0Y2hpbmcgPSAkLmFqYXggdHlwZTogJ0dFVCcsIHVybDogdXJsXG5cdFx0LmRvbmUgKGh0bWwpIC0+XG5cdFx0XHRwYWdlLnBhcnNlSHRtbCBodG1sXG5cdFx0XHRuZXh0LmNhbGwgY29udGV4dCwgcGFnZVx0XG5cdFx0LmZhaWwgKGVycm9yKS0+XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IgXCJDb3VsZG4ndCBsb2FkIHBhZ2UgI3t1cmx9ICgje2Vycm9yLnN0YXR1c1RleHR9KVwiXHRcdFx0XHRcblxuXHRwYXJzZUh0bWw6IChodG1sKSAtPlxuXG5cdFx0QHNldCAnaHRtbCcsIGh0bWxcdFx0XHRcdFx0XG5cdFx0QHNldCAnJGh0bWwnLCAkaHRtbCA9ICQoaHRtbClcblx0XHRpZiBtYXRjaGVzID0gaHRtbC5tYXRjaCAvPGJvZHlbXj5dK2NsYXNzPVwiXFxzKihbXlwiXSopXFxzKlwiW14+XSo+L1xuXHRcdFx0QHNldCAnYm9keUNsYXNzZXMnLCBfLmNvbXBhY3QgbWF0Y2hlc1sxXS5zcGxpdCgnICcpXG5cdFx0QHNldCAndGl0bGUnLCAkaHRtbC5maWx0ZXIoJ3RpdGxlJykudGV4dCgpXG5cdFx0QFxuXG5cdGlzOiAoY2xhc3NOYW1lKSAtPlxuXG5cdFx0Ym9keUNsYXNzZXMgPSBAZ2V0ICdib2R5Q2xhc3Nlcydcblx0XHRfLmluZGV4T2YoYm9keUNsYXNzZXMsY2xhc3NOYW1lKSA+PSAwXG5cblx0JDogKHBhdGgpIC0+XG5cblx0XHRAZ2V0KCckaHRtbCcpLmZpbmQgcGF0aFxuXG5cdHN5bmM6IChwYXRoID0gJycsICRjdXJyQ29udGV4dCA9ICQoJ2h0bWwnKSkgLT4gXG5cblx0XHRuZXcgRWxlbWVudFN5bmNocm9uaXplciAkY3VyckNvbnRleHQuZmluZChwYXRoKSwgQCQocGF0aCksIHBhdGhcblBhZ2VDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmRcblx0XHRcblx0Y29uZmlnOiB7fVxuXG5cdG1vZGVsOiBQYWdlTW9kZWxcblxuXHRpbml0aWFsaXplOiAobW9kZWxzID0gW10sIEBjb25maWcpIC0+XG5cblx0XHRpZiBtb2RlbHMubGVuZ3RoIGlzIDBcblx0XHRcdEBhZGQgbmV3IEBtb2RlbCBocmVmOiBAY29uZmlnLmluaXRpYWxIcmVmXG5cdFx0XHQucGFyc2VIdG1sIEBjb25maWcuaW5pdGlhbEh0bWxcblx0XG5cdGJ5SHJlZjogKGhyZWYsIGNvbnRleHQsIG5leHQpIC0+XG5cblx0XHRocmVmID0gaWYgaHJlZi5zbGljZSgwLDEpIGlzICcvJyB0aGVuIGhyZWYuc2xpY2UoMSkgZWxzZSBocmVmXG5cdFx0aWYgcGFnZSA9IEBmaW5kV2hlcmUoaHJlZjpocmVmKVxuXHRcdFx0bmV4dC5jYWxsIGNvbnRleHQsIHBhZ2Vcblx0XHRlbHNlXG5cdFx0XHRAYWRkIGhyZWY6IGhyZWZcdFxuXHRcdFx0LmZldGNoIGNvbnRleHQsIG5leHRcblx0XHRcdFx0XG5jbGFzcyBWaWV3Q29sbGVjdGlvblxuXG5cdGNvbnN0cnVjdG9yOiAodmlld3MpIC0+XG5cblx0XHRAcmVzZXQgdmlld3NcblxuXHRyZXNldDogKHZpZXdzKSAtPlxuXG5cdFx0aWYgQHZpZXdzXG5cdFx0XHRmb3IgdmlldyBpbiBAdmlld3Ncblx0XHRcdFx0dmlldy5yZW1vdmUoKVxuXHRcdEB2aWV3cyA9IFtdXG5cdFx0aWYgdmlld3Ncblx0XHRcdGlmIG5vdCBfLmlzQXJyYXkodmlld3MpIHRoZW4gdmlld3MgPSBbdmlld3NdXG5cdFx0XHRmb3IgdmlldyBpbiB2aWV3c1xuXHRcdFx0XHRAcHVzaCB2aWV3XG5cdFx0QFxuXG5cdHB1c2g6ICh2aWV3KSAtPlxuXG5cdFx0QHZpZXdzLnB1c2ggdmlld1xuXHRcdEBsZW5ndGggPSBAdmlld3MubGVuZ3RoXG5cblx0ZWFjaDogKGZuYywgdmlld3MgPSBAdmlld3MsIGNvbnRleHQgPSBAKSAtPlxuXG5cdFx0aXNGbmMgPSBfLmlzRnVuY3Rpb24gZm5jXG5cdFx0aXNTdHIgPSBub3QgaXNGbmMgYW5kIF8uaXNTdHJpbmcgZm5jXG5cdFx0Zm9yIHZpZXcsIGkgaW4gdmlld3MgXG5cdFx0XHRpZiBpc0ZuYyB0aGVuIGZuYy5jYWxsIGNvbnRleHQsIHZpZXcsIGkgXG5cdFx0XHRlbHNlIGlmIGlzU3RyIHRoZW4gdmlld1sgZm5jIF0uY2FsbCBjb250ZXh0LCB2aWV3LCBpIFxuXG5cdGZpbmQ6IChrZXksdmFsdWUpIC0+XG5cblx0XHRAd2hlcmUoIGtleSx2YWx1ZSApWzBdXG5cblx0d2hlcmU6IChrZXksdmFsdWUsIGxpbWl0KSAtPlxuXHRcdFxuXHRcdHJlc3VsdHMgPSBbXVxuXHRcdGlzQXJyYXkgPSBfLmlzQXJyYXkga2V5XG5cdFx0QGVhY2ggKHZpZXcpIC0+IFxuXHRcdFx0dmFsID0gaWYgaXNBcnJheSB0aGVuIEByZXNvbHZlQXJyYXlQYXRoKHZpZXcsIGtleSkgZWxzZSB2aWV3WyBrZXkgXVxuXHRcdFx0aWYgdmFsIGlzIHZhbHVlIHRoZW4gcmVzdWx0cy5wdXNoIHZpZXdcblx0XHRyZXN1bHRzXG5cblx0Zmlyc3Q6IC0+XG5cblx0XHRAdmlld3Muc2xpY2UoMCwxKVswXVxuXG5cdGxhc3Q6IC0+XG5cblx0XHRAdmlld3Muc2xpY2UoLTEpWzBdXG5cblx0c2V0OiAocHJvcGVydHksIHZhbHVlKSAtPlxuXG5cdFx0aWYgXy5pc09iamVjdCBwcm9wZXJ0eVxuXHRcdFx0QGVhY2ggKHZpZXcpIC0+IFxuXHRcdFx0XHRmb3IgcHJvcCwgdmFsIG9mIHByb3BlcnR5XG5cdFx0XHRcdFx0dmlld1sgcHJvcCBdID0gdmFsXG5cdFx0ZWxzZVxuXHRcdFx0QGVhY2ggKHZpZXcpIC0+IHZpZXdbIHByb3BlcnR5IF0gPSB2YWx1ZVxuXHRcdFx0XHRcblx0XHRAXG5cblx0Z2V0OiAocHJvcGVydHkxLCBwcm9wZXJ0eTIpIC0+XG5cblx0XHRyZXN1bHRzID0gaWYgcHJvcGVydHkyIHRoZW4ge30gZWxzZSBbXVxuXHRcdEBlYWNoICh2aWV3KSAtPiBcblx0XHRcdHZhbCA9IHN3aXRjaFxuXHRcdFx0XHR3aGVuIF8uaXNBcnJheSBwcm9wZXJ0eTEgdGhlbiBAcmVzb2x2ZUFycmF5UGF0aCB2aWV3LCBwcm9wZXJ0eTFcblx0XHRcdFx0d2hlbiBfLmlzRnVuY3Rpb24gdmlld1twcm9wZXJ0eTFdIHRoZW4gdmlld1twcm9wZXJ0eTFdLmNhbGwgdmlld1xuXHRcdFx0XHRlbHNlIHZpZXdbcHJvcGVydHkxXVxuXHRcdFx0aWYgcHJvcGVydHkyXG5cdFx0XHRcdGtleSA9IHN3aXRjaFxuXHRcdFx0XHRcdHdoZW4gXy5pc0FycmF5IHByb3BlcnR5MiB0aGVuIEByZXNvbHZlQXJyYXlQYXRoIHZpZXcsIHByb3BlcnR5MlxuXHRcdFx0XHRcdGVsc2UgcHJvcGVydHkyXG5cdFx0XHRcdHJlc3VsdHNbIGtleSBdID0gdmFsXG5cdFx0XHRlbHNlIGlmIHZhbFxuXHRcdFx0XHRyZXN1bHRzLnB1c2ggdmFsXG5cdFx0cmVzdWx0c1xuXG5cdHdhaXRGb3I6IChmbmNOYW1lLCBjb250ZXh0ID0gQCwgbmV4dCwgb3B0aW9ucywgbWluRHVyYXRpb24gPSAwLCBtYXhEdXJhdGlvbiA9IDIwMDAwKSAtPlxuXG5cdFx0IyBpZiBAdmlld3MubGVuZ3RoIGlzIDAgdGhlbiByZXR1cm4gbmV4dC5jYWxsIGNvbnRleHRcblxuXHRcdGlzRG9uZSA9IG5vXG5cdFx0d2FpdEZvck1pbkR1cmF0aW9uID0gbWluRHVyYXRpb24gPiAwXG5cblx0XHRpZiB3YWl0Rm9yTWluRHVyYXRpb25cblx0XHRcdHNldFRpbWVvdXQgLT4gXG5cdFx0XHRcdGlmIGlzRG9uZSB0aGVuIG5leHQuY2FsbChjb250ZXh0KSBlbHNlIHdhaXRGb3JNaW5EdXJhdGlvbiA9IG5vXG5cdFx0XHQsbWluRHVyYXRpb25cblx0XHRpZiBtYXhEdXJhdGlvbiA+IDAgXG5cdFx0XHRtYXhDbG9jayA9IHNldFRpbWVvdXQgLT4gXG5cdFx0XHRcdHRocm93IEVycm9yIFwibWF4IHdhaXQgZHVyYXRpb24gb2YgI3ttYXhEdXJhdGlvbn0gZXhjZWVkZWQgZm9yIGZ1bmN0aW9uICN7Zm5jTmFtZX1cIlxuXHRcdFx0XHRuZXh0LmNhbGwgY29udGV4dFxuXHRcdFx0LG1heER1cmF0aW9uXG5cdFx0dXNlQXJyYXkgPSBfLmlzQXJyYXkgZm5jTmFtZVxuXHRcdGFjdGlvbnMgPSBAZWFjaCAodmlldykgLT5cblx0XHRcdGRmZCA9IG5ldyAkLkRlZmVycmVkKClcblx0XHRcdGZuYyA9IGlmIHVzZUFycmF5IHRoZW4gQHJlc29sdmVBcnJheVBhdGgodmlldyxmbmNOYW1lKSBlbHNlXHR2aWV3W2ZuY05hbWVdXG5cdFx0XHRpZiBfLmlzQXJyYXkob3B0aW9ucykgdGhlbiBmbmMuYXBwbHkgdmlldywgW2RmZC5yZXNvbHZlXS5jb25jYXQob3B0aW9ucylcblx0XHRcdGVsc2UgZm5jLmNhbGwgdmlldywgZGZkLnJlc29sdmVcblx0XHRcdGRmZFx0XG5cdFx0JC53aGVuLmFwcGx5ICQsIGFjdGlvbnNcblx0XHQuZG9uZSAtPiBcblx0XHRcdGlmIG1heENsb2NrIHRoZW4gY2xlYXJUaW1lb3V0IG1heENsb2NrIFxuXHRcdFx0aWYgbm90IHdhaXRGb3JNaW5EdXJhdGlvbiB0aGVuIG5leHQuY2FsbChjb250ZXh0KVxuXHRcdFx0aXNEb25lID0geWVzXG5cdFx0QFxuXG5cdHJlc29sdmVBcnJheVBhdGg6IChvYmosIHBhdGgpIC0+XG5cdFx0XG5cdFx0Zm9yIGNodW5rIGluIHBhdGhcblx0XHRcdG9iaiA9IG9ialtjaHVua11cblx0XHRvYmpcblxuXHQkOiAoc2VsZWN0b3IpIC0+XG5cblx0XHQkcmV0dXJuID0gJCBbXTtcblx0XHR2aWV3cyA9IF8uZmlsdGVyIEB2aWV3cywgKHZpZXcpIC0+IHZpZXcuJGVsLmlzIHNlbGVjdG9yXG5cdFx0aWYgdmlld3MubGVuZ3RoID4gMCB0aGVuIEBlYWNoICgodmlldykgLT4gJHJldHVybiA9ICRyZXR1cm4uYWRkIHZpZXcuJGVsICksIHZpZXdzXG5cdFx0JHJldHVyblxuXG5cbmNsYXNzIFZpZXdMb2FkZXIgZXh0ZW5kcyBWaWV3Q29sbGVjdGlvblxuXHRcdFxuXHRjb25zdHJ1Y3RvcjogKHZpZXdzKSAtPiBzdXBlciB2aWV3c1xuXG5cdFZpZXdQcm90b3R5cGU6IFxuXHRcdFxuXHRcdGluaXRpYWxpemU6IChAY29uZmlnKSAtPlxuXG5cdFx0Y3ljbGU6XG5cdFx0XHRsb2FkOiAobmV4dCkgLT4gbmV4dC5jYWxsIEAgXHRcdFx0XHRcdFxuXHRcdFx0bGF1bmNoOiAtPlx0XG5cdFx0XHR1cGRhdGU6IC0+IFx0XHRcdFx0XHRcblx0XHRcdHVubG9hZDogKG5leHQpIC0+IG5leHQuY2FsbCBAXG5cblx0ZmluZEFuZExvYWQ6ICh2aWV3cywgJGh0bWwsIGNvbnRleHQsIG1pbkxvYWRpbmdUaW1lLCBuZXh0ICkgLT5cblxuXHRcdGRldGVjdGVkVmlld3MgPSBfLmZpbHRlciB2aWV3cywgKHZpZXcpIC0+ICRodG1sLmlzIFwiOmhhcygje3ZpZXcuc2VsZWN0b3J9KVwiXG5cblx0XHRyZXF1aXJlUGF0aHMgPSBmb3IgdmlldywgaSBpbiBkZXRlY3RlZFZpZXdzXG5cdFx0XHRpZiB2aWV3LnJlcXVpcmVQYXRoIHRoZW4gdmlldy5yZXF1aXJlUGF0aFxuXHRcdFx0ZWxzZSBAY3JlYXRlVmlld0luc3RhbmNlcygkaHRtbCx2aWV3LHZpZXcpXG5cdFx0XG5cdFx0IyBpZiByZXF1aXJlUGF0aHMubGVuZ3RoIGFuZCB0eXBlb2YgcmVxdWlyZSBpcyAnZnVuY3Rpb24nXG5cdFx0IyBcdGxvYWRlciA9IEBcblx0XHQjIFx0cmVxdWlyZSByZXF1aXJlUGF0aHMsIC0+XG5cdFx0IyBcdFx0Zm9yIHZpZXcsIGkgaW4gZGV0ZWN0ZWRWaWV3c1xuXHRcdCMgXHRcdFx0bG9hZGVyLmNyZWF0ZVZpZXdJbnN0YW5jZXMoJGh0bWwsdmlldyxhcmd1bWVudHNbaV0pXG5cblx0XHQjIFx0XHRsb2FkZXIubG9hZEluc3RhbmNlcyBjb250ZXh0LCBuZXh0LCBtaW5Mb2FkaW5nVGltZVx0XG5cdFx0IyBlbHNlXG5cdFx0IyBcdEBsb2FkSW5zdGFuY2VzIGNvbnRleHQsIG5leHQsIG1pbkxvYWRpbmdUaW1lXG5cdFx0QGxvYWRJbnN0YW5jZXMgY29udGV4dCwgbmV4dCwgbWluTG9hZGluZ1RpbWVcblx0XHRAXG5cdFxuXG5cdGNyZWF0ZVZpZXdJbnN0YW5jZXM6ICgkaHRtbCx2aWV3TG9hZGVyLHZpZXdQcm90b3R5cGUpLT5cblxuXHRcdGxvYWRlciA9IEBcblx0XHQkaHRtbC5maW5kKHZpZXdMb2FkZXIuc2VsZWN0b3IpLmVhY2ggKGkpIC0+IFx0XG5cdFx0XHRcdFx0XHRcblx0XHRcdGRlZmF1bHRNb2R1bGUgPSBfLmV4dGVuZCB7fSwgbG9hZGVyLlZpZXdQcm90b3R5cGVcblx0XHRcdGRlZmF1bHRDeWNsZSA9IF8uZXh0ZW5kIHt9LCBkZWZhdWx0TW9kdWxlLmN5Y2xlXG5cdFx0XHRcblx0XHRcdGV4dGVuc2lvbiA9IF8uZXh0ZW5kIGRlZmF1bHRNb2R1bGUsIHZpZXdQcm90b3R5cGVcblx0XHRcdGV4dGVuc2lvbi5jeWNsZSA9IF8uZXh0ZW5kIGRlZmF1bHRDeWNsZSwgZXh0ZW5zaW9uLmN5Y2xlXG5cdFx0XHR2aWV3UHJvdG90eXBlID0gQmFja2JvbmUuVmlldy5leHRlbmQgZXh0ZW5zaW9uXG5cdFx0XHRcblx0XHRcdGxvYWRlci5wdXNoIG5ldyB2aWV3UHJvdG90eXBlKF8uZXh0ZW5kIGVsOiQoQCksIHZpZXdMb2FkZXIpXG5cblx0bG9hZEluc3RhbmNlczogKGNvbnRleHQsIG5leHQsIG1pbkxvYWRpbmdUaW1lID0gMCkgLT5cblx0XHRcblx0XHRAd2FpdEZvciBbJ2N5Y2xlJywnbG9hZCddLCBjb250ZXh0LCBuZXh0LCBudWxsLCBtaW5Mb2FkaW5nVGltZVxuXG5cdGxhdW5jaEluc3RhbmNlczogLT5cblxuXHRcdEBlYWNoIChpbnN0YW5jZSkgLT4gaW5zdGFuY2UuY3ljbGUubGF1bmNoLmNhbGwgaW5zdGFuY2Vcblx0XG5cdHVwZGF0ZUluc3RhbmNlczogKG5leHRQYWdlLCAkZWwpIC0+XG5cblx0XHRAZWFjaCAoaW5zdGFuY2UpIC0+IFxuXHRcdFx0cGFnZVN5bmMgPSBuZXh0UGFnZS5zeW5jIGluc3RhbmNlLmNvbmZpZy5zZWxlY3RvciwgJGVsXG5cdFx0XHRpbnN0YW5jZS5jeWNsZS51cGRhdGUuY2FsbCBpbnN0YW5jZSwgcGFnZVN5bmNcblxuXHR1bmxvYWRJbnN0YW5jZXM6IChjb250ZXh0LCBuZXh0KSAtPlxuXG5cdFx0QHdhaXRGb3IgWydjeWNsZScsJ3VubG9hZCddLCBALCAtPlxuXHRcdFx0QHJlc2V0KClcblx0XHRcdG5leHQuY2FsbCBjb250ZXh0XG5cblNlY3Rpb25Db250ZW50ID0gQmFja2JvbmUuVmlldy5leHRlbmRcdFxuXG5cdHNlY3Rpb25zOiBudWxsXG5cdFxuXHR2aWV3czogbnVsbFxuXHRcblx0c3RhdGVzOiBudWxsXG5cblx0dXNlQ2xhc3NUcmFuc2l0aW9uczogZmFsc2VcblxuXHRpbml0aWFsaXplOiAoQGNvbmZpZykgLT4gXG5cdFx0XG5cdFx0QHN0YXRlcyA9IEBjb25maWcuc2VjdGlvbi50cmFuc2l0aW9uU3RhdGVzXG5cdFx0QHVzZUNsYXNzVHJhbnNpdGlvbnMgPSBfLmlzQXJyYXkoIEBzdGF0ZXMgKVxuXHRcdEAkZWwuaHRtbCBAY29uZmlnLmh0bWxcblxuXG4jIFNFVFRFUiBNRVRIT0RTXG5cblxuXHR0bzogKHN0YXRlTmFtZSwgZHVyYXRpb249MCkgLT5cdFx0XHRcdFx0XG5cdFx0XG5cdFx0c3RhdGUgPSBAc3RhdGVzWyBzdGF0ZU5hbWUgXVxuXHRcdFxuXHRcdGlmIG5vdCBzdGF0ZSB0aGVuIHJldHVyblxuXG5cdFx0aWYgbm90IEB0b1N0YXRlQ2xhc3MoIHN0YXRlIClcblxuXHRcdFx0aWYgZHVyYXRpb24gaXMgMFxuXHRcdFx0XHRAJGVsLmNzcyBzdGF0ZVxuXHRcdFx0XHRAXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEAkZWwuYW5pbWF0ZShzdGF0ZSwgZHVyYXRpb24pLnByb21pc2UoKVxuXG5cdHRvU3RhdGVDbGFzczogKHN0YXRlKSAtPlxuXG5cdFx0cmV0dXJuIGZhbHNlIGlmIG5vdCBAdXNlQ2xhc3NUcmFuc2l0aW9uc1xuXHRcdEAkZWwucmVtb3ZlQ2xhc3MgQHN0YXRlcy5qb2luKCcgJylcblx0XHQuYWRkQ2xhc3Mgc3RhdGVcblx0XHR0cnVlXG5cblxuIyBHRVRURVIgTUVUSE9EU1x0XG5cblxuXHRmaW5kU3luY2VkOiAocGF0aCwgdmlldykgLT5cblxuXHRcdEAkKHBhdGgpLmFkZCh2aWV3LiQocGF0aCkpXG5cblx0aGFzQm9keUNsYXNzOiAoIGNsYXNzTmFtZSApIC0+XG5cblx0XHRAY29uZmlnLnBhZ2UuaXMoIGNsYXNzTmFtZSApXHRcblxuXG5cdHNpemU6IC0+IFxuXHRcdFxuXHRcdHdpZHRoOiBAJGVsLndpZHRoKCksIGhlaWdodDogQCRlbC5oZWlnaHQoKVxuXHRcblx0cG9zOiAtPiBcblxuXHRcdHRvcDogQCRlbC5wb3NpdGlvbigpLnRvcCwgbGVmdDogQCRlbC5wb3NpdGlvbigpLmxlZnRcblx0XG5cdG9mZjogLT4gXG5cblx0XHR0b3A6IEAkZWwub2Zmc2V0KCkudG9wLCBsZWZ0OiBAJGVsLm9mZnNldCgpLmxlZnRcblx0XG5cbmV4cG9ydHMuU2VjdGlvbiA9IFxuXG5cdEJhY2tib25lLlZpZXcuZXh0ZW5kXG5cdFx0XHRcblx0XHQjIHRoaXMgc2VjdGlvbnMgY3VycmVudCBzdWItc2VjdGlvbnMgW1ZpZXdDb2xsZWN0aW9uXVxuXHRcdHNlY3Rpb25zOiBudWxsXG5cblx0XHQjIHRoaXMgc2VjdGlvbnMgY3VycmVudCB2aWV3cyBbVmlld0xvYWRlcl1cblx0XHR2aWV3czogbnVsbFxuXG5cdFx0IyB0aGlzIHNlY3Rpb25zIGN1cnJlbnQgY29udGVudHMgdXNlZCBmb3IgdHJhbnNpdGlvbnMgW1ZpZXdDb2xsZWN0aW9uXVxuXHRcdGNvbnRlbnRzOiBudWxsXG5cblx0XHR0cmFuc2l0aW9uU3RhdGVzOlxuXHRcdFx0XG5cdFx0XHRiZWZvcmU6IGRpc3BsYXk6J2Jsb2NrJywgb3BhY2l0eTowLCBwb3NpdGlvbjonYWJzb2x1dGUnLCB0b3A6MCwgbGVmdDowXG5cdFx0XHRhZnRlcjogcG9zaXRpb246J2Fic29sdXRlJywgb3BhY2l0eTogMVxuXHRcdFx0ZmluYWw6IHBvc2l0aW9uOidzdGF0aWMnXG5cblx0XHR0cmFuc2l0aW9uUHJlc2V0czpcblxuXHRcdFx0Y3V0OiAoY3VyciwgbmV4dCwgZG9uZSkgLT4gXHRcdFx0XHRcblx0XHRcdFx0aWYgY3VyciB0aGVuIGN1cnIudG8gJ2FmdGVyJ1xuXHRcdFx0XHRuZXh0LnRvICdhZnRlcidcblx0XHRcdFx0ZG9uZSgpXG5cdFx0XHRmYWRlaW46IChjdXJyLCBuZXh0LCBkb25lLCBkdXJhdGlvbj0xMDAwKSAtPiBcblx0XHRcdFx0aWYgY3VyciB0aGVuIGN1cnIudG8gJ2FmdGVyJ1xuXHRcdFx0XHRuZXh0LnRvICdhZnRlcicsIGR1cmF0aW9uXG5cdFx0XHRcdC5kb25lIGRvbmVcblx0XHRcdHdoaXRlZmFkZTogKGN1cnIsIG5leHQsIGRvbmUsIGR1cmF0aW9uPTEwMDApIC0+IFxuXHRcdFx0XHRpZiBub3QgY3VyciB0aGVuIHJldHVybiBuZXh0LnRvICdhZnRlcicsIGR1cmF0aW9uLzIsIGRvbmVcblx0XHRcdFx0Y3Vyci50bygnYWZ0ZXInKS50bygnYmVmb3JlJywgZHVyYXRpb24vMikgXG5cdFx0XHRcdC5kb25lIG5leHQudG8gJ2FmdGVyJywgZHVyYXRpb24vMlxuXHRcdFx0XHQuZG9uZSBkb25lXG5cdFx0XHRjcm9zc2ZhZGU6IChjdXJyLCBuZXh0LCBkb25lLCBkdXJhdGlvbj0xMDAwKSAtPlxuXHRcdFx0XHRpZiBjdXJyIHRoZW4gY3Vyci50bygnYWZ0ZXInKS50bygnYmVmb3JlJywgZHVyYXRpb24sIGRvbmUpXG5cdFx0XHRcdG5leHQudG8gJ2FmdGVyJywgZHVyYXRpb25cblx0XHRcdFx0LmRvbmUgZG9uZVxuXG5cdFx0ZXZlbnRzOiAnY2xpY2sgYVtocmVmXSc6IChlKSAtPiBAZ2V0TGF1bmNoZXIoKS5yZXF1ZXN0Q2xpY2tlZExpbmsgZSwgQFxuXG5cblx0IyBJTklUSUFMSVpJTkcgVEhJUyBTRUNUSU9OUyBDSElMRFJFTiBTRUNUSU9OUyBBTkQgVklFV1M6XG5cblxuXHRcdGluaXRpYWxpemU6IChAY29uZmlnKSAtPiBAY29uZmlnLmxhdW5jaGVyLnRyaWdnZXIgJ3NlY3Rpb25BZGRlZCcsIEBlbCwgQGNvbmZpZ1xuXG5cdFx0ZmluZEFuZExvYWQ6IChuZXh0LCBpc1RyaWdnZXJTZWN0aW9uKSAtPlxuXHRcdFx0XG5cdFx0XHRpc0xhdW5jaGVyID0gbm90IEBjb25maWcubGF1bmNoZXJcblx0XHRcdGxhdW5jaGVyID0gQGdldExhdW5jaGVyKClcblx0XHRcdG1pbkxvYWRpbmdUaW1lID0gaWYgaXNUcmlnZ2VyU2VjdGlvbiB0aGVuIGxhdW5jaGVyLmNvbmZpZy5taW5Mb2FkaW5nVGltZSBlbHNlIDBcblxuXG5cdFx0XHQjIHBhcnNlIGNvbmZpZ3VyYXRpb24gaGFzaCBmb3IgbGF1bmNoYWJsZXNcblx0XHRcdHNlY3Rpb25zTGF1bmNoYWJsZXMgPSB7IHNlY3Rpb25zOltdLCB2aWV3czpbXSB9XG5cdFx0XHRmb3Igc2VsZWN0b3IsIGxhdW5jaGFibGUgb2YgQGNvbmZpZy5sYXVuY2hhYmxlcyBcblx0XHRcdFx0e3NlY3Rpb24sbGF1bmNoYWJsZXN9ID0gbGF1bmNoYWJsZVxuXHRcdFx0XHRzZWN0aW9uU2VsZWN0b3IgPSBfLmNvbXBhY3QoW0Bjb25maWcuc2VjdGlvblNlbGVjdG9yLHNlbGVjdG9yXSkuam9pbiAnICdcblx0XHRcdFx0Y29uZmlnID0geyBzZWN0aW9uOkAsIHNlbGVjdG9yLCBsYXVuY2hhYmxlcywgc2VjdGlvblNlbGVjdG9yLCBsYXVuY2hlciB9XG5cdFx0XHRcdHN3aXRjaFxuXHRcdFx0XHRcdHdoZW4gc2VjdGlvblxuXHRcdFx0XHRcdFx0aWYgXy5pc1N0cmluZyBzZWN0aW9uIHRoZW4gc2VjdGlvbiA9IHJlcXVpcmVQYXRoOnNlY3Rpb25cblx0XHRcdFx0XHRcdHNlY3Rpb25zTGF1bmNoYWJsZXMuc2VjdGlvbnMucHVzaCBfLmV4dGVuZCggY29uZmlnLCB0eXBlOidzZWN0aW9uJywgZXh0ZW5zaW9uOnNlY3Rpb24pXHRcblx0XHRcdFx0XHR3aGVuIGxhdW5jaGFibGVcblx0XHRcdFx0XHRcdGlmIF8uaXNTdHJpbmcgbGF1bmNoYWJsZSB0aGVuIGxhdW5jaGFibGUgPSByZXF1aXJlUGF0aDpsYXVuY2hhYmxlXG5cdFx0XHRcdFx0XHRzZWN0aW9uc0xhdW5jaGFibGVzLnZpZXdzLnB1c2ggXy5leHRlbmQoIGNvbmZpZywgdHlwZTondmlldycsIGxhdW5jaGFibGUpXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yIFwiSW52YWxpZCBIYXNoIFR5cGU6IFVzZSBlaXRoZXIgYSBzdHJpbmcgb3IgYSBzZWN0aW9uIGhhc2ggYXMgdmFsdWUgZm9yICN7c2VsZWN0b3J9XCJcdFx0XG5cblx0XHRcdCMgbGF1bmNoZXIudHJpZ2dlciAnbGF1bmNoYWJsZXNSZXF1ZXN0ZWQnLCBAZWwsIHNlY3Rpb25zTGF1bmNoYWJsZXNcblx0XHRcdFxuXG5cdFx0XHQjIGluaXRpYWx5IHJlbmRlciBzZWN0aW9uXG5cdFx0XHRpZiBub3QgQGNvbnRlbnRzIHRoZW4gQHJlbmRlcigpXG5cdFx0XHRcblxuXHRcdFx0IyByZWN1cnNpdmVseSBsYXVuY2ggdGhlIHNlY3Rpb25zIGxhdW5jaGFibGVzIChzZWN0aW9ucyBhbmQgdmlld3MpXG5cdFx0XHR7c2VjdGlvbnMsIHZpZXdzfSA9IHNlY3Rpb25zTGF1bmNoYWJsZXNcblx0XHRcdCRlbCA9IEBjb250ZW50cy5sYXN0KCkuJGVsXG5cdFx0XHRAbG9hZFNlY3Rpb25zICRlbCwgc2VjdGlvbnMsIC0+IFxuXG5cdFx0XHRcdEBzZWN0aW9ucy53YWl0Rm9yICdmaW5kQW5kTG9hZCcsIEAsIC0+IFxuXG5cdFx0XHRcdFx0QGxvYWRWaWV3cyAkZWwsIHZpZXdzLCBtaW5Mb2FkaW5nVGltZSwgLT4gXG5cblx0XHRcdFx0XHRcdCMgbGF1bmNoZXIudHJpZ2dlciAndmlld3NMb2FkZWQnLCBAdmlld3Mudmlld3MsIEBlbFxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiBpc1RyaWdnZXJTZWN0aW9uIGlzIHRydWVcblx0XHRcdFx0XHRcdFx0QHNlY3Rpb25zLndhaXRGb3IgJ3BsYXlUcmFuc2l0aW9uJywgQCwgLT5cblx0XHRcdFx0XHRcdFx0XHRAdmlld3MubGF1bmNoSW5zdGFuY2VzIGZhbHNlXG5cdFx0XHRcdFx0XHRcdFx0bGF1bmNoZXIudHJpZ2dlciAnc2VjdGlvblJlYWR5JywgQHNlY3Rpb25zLmdldCgnZWwnKSwgQGVsXG5cdFx0XHRcdFx0XHRcdFx0bmV4dC5jYWxsIEBcblx0XHRcdFx0XHRcdGVsc2UgXG5cdFx0XHRcdFx0XHRcdGxhdW5jaGVyLnRyaWdnZXIgJ3N1YlNlY3Rpb25Mb2FkZWQnLCBAY29uZmlnLnNlbGVjdG9yXG5cdFx0XHRcdFx0XHRcdGlmIEBjeWNsZSBhbmQgQGN5Y2xlLmxhdW5jaCB0aGVuIEBjeWNsZS5sYXVuY2guY2FsbCBAXG5cdFx0XHRcdFx0XHRcdG5leHQuY2FsbCBAXG5cdFx0XG5cblx0IyBBRERJTkcgQU5EIFNXSVRDSElORyBCRVRXRUVOIFNFQ1RJT04gQ09OVEVOVFM6XG5cblxuXHRcdHJlbmRlcjogKHBhZ2UsICRjb250ZXh0KSAtPlxuXG5cdFx0XHRodG1sID0gaWYgcGFnZSB0aGVuIHBhZ2Uuc3luYyhAY29uZmlnLnNlbGVjdG9yLCRjb250ZXh0KS5odG1sMigpXG5cdFx0XHRlbHNlIEAkZWwuaHRtbCgpXG5cblx0XHRcdGxhdW5jaGVyID0gQGNvbmZpZy5sYXVuY2hlciBvciBAXG5cdFx0XHRwYWdlID89IGxhdW5jaGVyLmN1cnJQYWdlIG9yIGxhdW5jaGVyLm5leHRQYWdlXG5cblx0XHRcdFxuXHRcdFx0aXNMYXVuY2hlciA9IG5vdCBAY29uZmlnLmxhdW5jaGVyXG5cdFx0XHRpc0luaXRpYWxDb250ZW50ID0gbm90IEBjb250ZW50c1xuXHRcdFx0aWYgaXNJbml0aWFsQ29udGVudCBhbmQgbm90IGlzTGF1bmNoZXIgdGhlbiBAJGVsLmVtcHR5KClcblxuXHRcdFx0IyBjcmVhdGUgbmV3IGNvbnRlbnQgZm9yIHNlY3Rpb25cblx0XHRcdHNlY3Rpb25Db250ZW50ID0gbmV3IFNlY3Rpb25Db250ZW50XG5cdFx0XHRcdHNlY3Rpb246IEAgXG5cdFx0XHRcdGNsYXNzTmFtZTogbGF1bmNoZXIuY29uZmlnLnNlY3Rpb25Db250ZW50Q2xhc3NOYW1lXG5cdFx0XHRcdGh0bWw6IGh0bWxcblx0XHRcdFx0cGFnZTogcGFnZVxuXHRcdFx0XG5cdFx0XHQjIHJlc2V0IGNvbnRlbnQncyB0cmFuc2l0aW9uIHN0YXRlXG5cdFx0XHRzZWN0aW9uQ29udGVudC50byhpZiBAY29udGVudHMgdGhlbiAnYmVmb3JlJyBlbHNlICdmaW5hbCcpXG5cdFx0XHRcblx0XHRcdGlmIGlzTGF1bmNoZXJcblx0XHRcdFx0c2VjdGlvbkNvbnRlbnQuc2V0RWxlbWVudChAZWwpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEAkZWwuYXBwZW5kKHNlY3Rpb25Db250ZW50LiRlbClcblx0XHRcdFxuXHRcdFx0aWYgaXNJbml0aWFsQ29udGVudCB0aGVuIEByZXNldENvbnRlbnQoc2VjdGlvbkNvbnRlbnQpIGVsc2UgQGNvbnRlbnRzLnB1c2goc2VjdGlvbkNvbnRlbnQpXG5cdFx0XHRAXG5cblx0XHRyZXNldENvbnRlbnQ6IChzZWN0aW9uQ29udGVudCkgLT5cblxuXHRcdFx0QGNvbnRlbnRzID0gbmV3IFZpZXdDb2xsZWN0aW9uIHNlY3Rpb25Db250ZW50XG5cdFx0XG5cdFx0cGxheVRyYW5zaXRpb246IChuZXh0KS0+XG5cblx0XHRcdGN1cnJDb250ZW50ID0gaWYgQGNvbnRlbnRzLmxlbmd0aCA+IDEgdGhlbiBAY29udGVudHMuZmlyc3QoKSBlbHNlIG51bGxcblx0XHRcdG5leHRDb250ZW50ID0gQGNvbnRlbnRzLmxhc3QoKVxuXHRcdFx0c2VjdGlvbiA9IEBcblx0XHRcdGRvbmUgPSAtPiBcblx0XHRcdFx0aWYgY3VyckNvbnRlbnQgXG5cdFx0XHRcdFx0c2VjdGlvbi51bmxvYWRMYXVuY2hhYmxlcyAtPiBjdXJyQ29udGVudC5yZW1vdmUoKVxuXHRcdFx0XHRzZWN0aW9uLmxhdW5jaFZpZXdzKClcblx0XHRcdFx0c2VjdGlvbi5yZXNldENvbnRlbnQgbmV4dENvbnRlbnQudG8gJ2ZpbmFsJ1xuXHRcdFx0XHRuZXh0LmNhbGwgc2VjdGlvbiBcblx0XHRcdFxuXHRcdFx0dHJhbnNpdGlvbkZuYyA9IGlmIF8uaXNTdHJpbmcgQHRyYW5zaXRpb24gdGhlbiBAdHJhbnNpdGlvblByZXNldHNbQHRyYW5zaXRpb25dIGVsc2UgQHRyYW5zaXRpb25cblx0XHRcdHRyYW5zaXRpb25GbmMuY2FsbCBALCBjdXJyQ29udGVudCwgbmV4dENvbnRlbnQsIGRvbmUsIEBjb25maWcuZHVyYXRpb25cdFx0XG5cblx0XHRsYXVuY2hWaWV3czogKGxhdW5jaFNlY3Rpb25zVmlld3MgPSB0cnVlKSAtPlxuXG5cdFx0XHRAdmlld3MubGF1bmNoSW5zdGFuY2VzKClcblx0XHRcdGlmIGxhdW5jaFNlY3Rpb25zVmlld3MgdGhlbiBAc2VjdGlvbnMuZWFjaCAoc2VjdGlvbikgLT4gc2VjdGlvbi5sYXVuY2hWaWV3cygpXG5cblx0XHR1bmxvYWRMYXVuY2hhYmxlczogKG5leHQpIC0+XHRcblxuXHRcdFx0c2VjdGlvbkNvbnRlbnQgPSBAY29udGVudHMuZmlyc3QoKVxuXHRcdFx0c2VjdGlvbkNvbnRlbnQudmlld3MudW5sb2FkSW5zdGFuY2VzIEAsIC0+XG5cdFx0XHRcdHNlY3Rpb25Db250ZW50LnNlY3Rpb25zLndhaXRGb3IgJ3VubG9hZExhdW5jaGFibGVzJywgQCwgbmV4dFxuXG5cblx0IyBMT0FESU5HIFNFQ1RJT05TLCBWSUVXUyBBTkQgQVNTRVRTOlxuXG5cblx0XHRsb2FkU2VjdGlvbnM6ICgkZWwsIHNlY3Rpb25zLCBuZXh0KSAtPlxuXG5cdFx0XHRkZXRlY3RlZFNlY3Rpb25zID0gXy5maWx0ZXIgc2VjdGlvbnMsIChzZWN0aW9uKSAtPiAkZWwuaXMgXCI6aGFzKCN7c2VjdGlvbi5zZWxlY3Rvcn0pXCJcblxuXHRcdFx0cmVxdWlyZWRTZWN0aW9ucyA9IF8uZmlsdGVyIGRldGVjdGVkU2VjdGlvbnMsIChzZWN0aW9uKSAtPiAgXy5pc1N0cmluZyBzZWN0aW9uLnJlcXVpcmVQYXRoXG5cblx0XHRcdGxhdW5jaGVyID0gQGNvbmZpZy5sYXVuY2hlciBvciBAXG5cdFx0XHQjIHNlY3Rpb25zTG9hZGVkID0gLT5cblxuXHRcdFx0XHQjIGlmIGFyZ3VtZW50cyB0aGVuIGZvciBleHRlbnNpb24sIGkgaW4gYXJndW1lbnRzIFxuXHRcdFx0XHQjIFx0cmVxdWlyZWRTZWN0aW9uc1sgaSBdLmV4dGVuc2lvbiA9IGV4dGVuc2lvblx0XG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdEBzZWN0aW9ucyA9IEBjb250ZW50cy5sYXN0KCkuc2VjdGlvbnMgPSBuZXcgVmlld0NvbGxlY3Rpb24oKS5yZXNldCggXG5cdFx0XHRcdGZvciBzZWN0aW9uIGluIGRldGVjdGVkU2VjdGlvbnNcblx0XHRcdFx0XG5cdFx0XHRcdFx0IyBpZiBzZWN0aW9uLmV4dGVuc2lvbi50cmFuc2l0aW9uU3RhdGVzXG5cdFx0XHRcdFx0IyBcdHN0YXRlRXh0ZW5zaW9uID0gXy5leHRlbmQge30sIHNlY3Rpb24uZXh0ZW5zaW9uLnRyYW5zaXRpb25TdGF0ZXNcblx0XHRcdFx0XHQjIFx0ZGVsZXRlIHNlY3Rpb24uZXh0ZW5zaW9uLnRyYW5zaXRpb25TdGF0ZXNcblx0XHRcdFx0XHQjIGNvbnNvbGUubG9nIHNlY3Rpb25cblx0XHRcdFx0XHQjIHt0cmFuc2l0aW9uU3RhdGVzfSA9IHNlY3Rpb24uZXh0ZW5zaW9uXG5cblx0XHRcdFx0XHQjIFx0c3RhdGVFeHRlbnNpb24gPSBfLmV4dGVuZCB7fSwgc2VjdGlvbi5leHRlbnNpb24udHJhbnNpdGlvblN0YXRlc1xuXHRcdFx0XHRcdCMgXHRkZWxldGUgc2VjdGlvbi5leHRlbnNpb24udHJhbnNpdGlvblN0YXRlc1xuXG5cdFx0XHRcdFx0RXh0ZW5kZWRTZWN0aW9uID0gZXhwb3J0cy5TZWN0aW9uLmV4dGVuZCggc2VjdGlvbi5leHRlbnNpb24gKVxuXHRcdFx0XHRcdHNlY3Rpb24gPSBuZXcgRXh0ZW5kZWRTZWN0aW9uKFxuXHRcdFx0XHRcdFx0ZWw6ICRlbC5maW5kIHNlY3Rpb24uc2VsZWN0b3Jcblx0XHRcdFx0XHRcdGxhdW5jaGFibGVzOiBzZWN0aW9uLmxhdW5jaGFibGVzXG5cdFx0XHRcdFx0XHRzZWxlY3Rvcjogc2VjdGlvbi5zZWxlY3RvclxuXHRcdFx0XHRcdFx0c2VjdGlvblNlbGVjdG9yOiBzZWN0aW9uLnNlY3Rpb25TZWxlY3RvclxuXHRcdFx0XHRcdFx0c2VjdGlvbjogc2VjdGlvbi5zZWN0aW9uXG5cdFx0XHRcdFx0XHRsYXVuY2hlcjogbGF1bmNoZXJcblx0XHRcdFx0XHRcdGltYWdlc1RvTG9hZDogbGF1bmNoZXIuY29uZmlnLmltYWdlc1RvTG9hZFxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQjIGlmIHN0YXRlRXh0ZW5zaW9uXG5cdFx0XHRcdFx0IyBcdHNlY3Rpb24udHJhbnNpdGlvblN0YXRlcyA9IF8uZXh0ZW5kIHt9LCBzZWN0aW9uLnRyYW5zaXRpb25TdGF0ZXMsIHN0YXRlRXh0ZW5zaW9uIFxuXHRcdFx0XHRcdCMgXHRzdGF0ZUV4dGVuc2lvbiA9IG51bGxcblx0XHRcdFx0XHQjIGlmIHRyYW5zaXRpb25TdGF0ZXNcblx0XHRcdFx0XHQjIFx0c2VjdGlvbi50cmFuc2l0aW9uU3RhdGVzID0gXy5leHRlbmQge30sIE9yaWdpbmFsU2VjdGlvbi50cmFuc2l0aW9uU3RhdGVzLCBzZWN0aW9uLnRyYW5zaXRpb25TdGF0ZXMgXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0IyBjb25zb2xlLmxvZyBzZWN0aW9uLnRyYW5zaXRpb25TdGF0ZXNcblxuXHRcdFx0XHRcdHNlY3Rpb25cblx0XHRcdClcblx0XHRcdG5leHQuY2FsbCBAICMsIGRldGVjdGVkU2VjdGlvbnNcblxuXHRcdFx0IyBpZiByZXF1aXJlZFNlY3Rpb25zLmxlbmd0aCBhbmQgdHlwZW9mIHJlcXVpcmUgaXMgJ2Z1bmN0aW9uJyB0aGVuIHJlcXVpcmUgXy5wbHVjayhyZXF1aXJlZFNlY3Rpb25zLCAncmVxdWlyZVBhdGgnKSwgc2VjdGlvbnNMb2FkZWRcblx0XHRcdCMgZWxzZSBzZWN0aW9uc0xvYWRlZC5jYWxsIEAgXG5cdFx0XHQjIHNlY3Rpb25zTG9hZGVkLmNhbGwgQCBcblx0XHRcblx0XHRsb2FkVmlld3M6ICgkZWwsIHZpZXdzLCBtaW5Mb2FkaW5nVGltZSwgbmV4dCkgLT5cblx0XHRcdFxuXHRcdFx0QHZpZXdzID0gQGNvbnRlbnRzLmxhc3QoKS52aWV3cyA9IG5ldyBWaWV3TG9hZGVyKClcblx0XHRcdC5maW5kQW5kTG9hZCB2aWV3cywgJGVsLCBALCBtaW5Mb2FkaW5nVGltZSwgLT5cblx0XHRcdFx0c2VjdGlvbiA9IEBcblx0XHRcdFx0QGxvYWRDb250ZW50QXNzZXRzIC0+IG5leHQuY2FsbCBzZWN0aW9uXG5cdFx0XG5cdFx0bG9hZENvbnRlbnRBc3NldHM6IChuZXh0KSAtPlxuXG5cdFx0XHQjIGlmIEBjb250ZW50cyB0aGVuIEBjb250ZW50cy5sYXN0KCkuJChAY29uZmlnLmltYWdlc1RvTG9hZCkuaW1hZ2VzTG9hZGVkIG5leHQgXG5cdFx0XHQjIGVsc2UgbmV4dC5jYWxsIEBcblx0XHRcdG5leHQuY2FsbCBAXG5cblxuXHQjIFJFTE9BRElORyBTRUNUSU9OUyBBTkQgVVBEQVRJTkcgVklFVyBJTlNUQU5DRVNcblxuXG5cdFx0cmVsb2FkOiAocGFnZSwgbmV4dCwgY29udGV4dCkgLT5cblxuXHRcdFx0cmV0dXJuIEBmaW5kQW5kTG9hZCggbmV4dCwgdHJ1ZSApIGlmIG5vdCBAZ2V0TGF1bmNoZXIoKS5jdXJyUGFnZVxuXG5cdFx0XHRAcmVsb2FkU2VjdGlvbnMgcGFnZSwgLT5cblx0XHRcdFx0QHZpZXdzLnVwZGF0ZUluc3RhbmNlcyBwYWdlLCBAJGVsXG5cdFx0XHRcdEBzZWN0aW9ucy53YWl0Rm9yICdwbGF5VHJhbnNpdGlvbicsIGNvbnRleHQsIG5leHRcblx0XHRcdFxuXHRcdHJlbG9hZFNlY3Rpb25zOiAocGFnZSwgbmV4dCkgLT5cblxuXHRcdFx0JGVsID0gQCRlbFxuXHRcdFx0QHNlY3Rpb25zLmVhY2ggKHNlY3Rpb24pIC0+IHNlY3Rpb24ucmVuZGVyKHBhZ2UsICRlbClcblx0XHRcdEBzZWN0aW9ucy53YWl0Rm9yICdmaW5kQW5kTG9hZCcsIEAsIG5leHQsIFt0cnVlXVxuXG5cblx0IyBHRVRURVIgTUVUSE9EU1xuXG5cdFx0Z2V0TGF1bmNoZXI6IC0+XG5cblx0XHRcdEBjb25maWcubGF1bmNoZXIgb3IgQFxuXG5MYXVuY2hlciA9IGV4cG9ydHMuU2VjdGlvbi5leHRlbmRcblx0XG5cdGN1cnJQYWdlOiBudWxsXG5cblx0bmV4dFBhZ2U6IG51bGxcblxuXHRwYWdlczogbnVsbFxuXG5cdHJvdXRlcjogbnVsbFxuXG5cdGxvYWRpbmc6IGZhbHNlXG5cblx0Y29uZmlnOlxuXG5cdFx0bWF4VHJhbnNpdGlvblRpbWU6IDEwMDAwXG5cdFx0cm9vdDogJydcblx0XHRwdXNoU3RhdGU6IG9uXG5cdFx0c2VjdGlvbkNvbnRlbnRDbGFzc05hbWU6ICdzZWN0aW9uLWNvbnRlbnQnXG5cdFx0aW1hZ2VzVG9Mb2FkOiAnaW1nOm5vdCguZG9udC1wcmVsb2FkKSdcblx0XHRtaW5Mb2FkaW5nVGltZTogMFxuXG5cdGluaXRpYWxpemU6IChjb25maWcpIC0+XG5cblx0XHRAY29uZmlnID0gXy5leHRlbmQgQGNvbmZpZywgY29uZmlnLCBzZWN0aW9uU2VsZWN0b3I6ICcnXG5cblx0c3RhcnQ6IC0+XG5cblx0XHQjIGluc3RhbnRpYXRlIGJhY2tib25lIHJvdXRlciBhbmQgc3RhcnQgaGlzdG9yeVxuXHRcdGxhdW5jaGVyID0gQFxuXHRcdFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmRcdFx0XHRcdFxuXHRcdFx0cm91dGVzOiAnJzoncmVxdWVzdCcsICcqcGF0aCc6J3JlcXVlc3QnXG5cdFx0XHRyZXF1ZXN0OiAoaHJlZikgLT4gbGF1bmNoZXIucmVxdWVzdFBhZ2UoaHJlZiwgJ25hdmlnYXRlZCcpXG5cdFx0QHJvdXRlciA9IG5ldyBSb3V0ZXIoKVx0XG5cdFx0QmFja2JvbmUuaGlzdG9yeS5zdGFydCBwdXNoU3RhdGU6IEBjb25maWcucHVzaFN0YXRlLCByb290OiBAY29uZmlnLnJvb3QsIHNpbGVudDogb25cblx0XHRAdHJpZ2dlciAnaGlzdG9yeVN0YXJ0ZWQnLCBAcm91dGVyXG5cblx0XHRocmVmID0gQmFja2JvbmUuaGlzdG9yeS5mcmFnbWVudFxuXHRcdEBwYWdlcyA9IG5ldyBQYWdlQ29sbGVjdGlvbiBAY29uZmlnLnBhZ2VzLCBcblx0XHRcdHJvb3Q6IEBjb25maWcucm9vdCBcblx0XHRcdGluaXRpYWxIcmVmOiBocmVmXG5cdFx0XHRpbml0aWFsSHRtbDogJCgnaHRtbCcpLmh0bWwoKVxuXHRcdEByZXF1ZXN0UGFnZShocmVmLCAnY2FsbGVkJylcblx0XHRAXG5cblx0cmVxdWVzdENsaWNrZWRMaW5rOiAoZSxzZWN0aW9uID0gQCkgLT5cblxuXHRcdGUuc3RvcFByb3BhZ2F0aW9uKClcblx0XHQkYSA9ICQgZS5jdXJyZW50VGFyZ2V0XG5cdFx0aHJlZiA9IHByb3A6ICgkYS5wcm9wICdocmVmJyksIGF0dHI6ICgkYS5hdHRyICdocmVmJylcblx0XHRyb290ID0gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdCArIEBjb25maWcucm9vdFxuXHRcdGlmIGhyZWYucHJvcC5zbGljZSgwLCByb290Lmxlbmd0aCkgaXMgcm9vdCAgXG5cdFx0XHRpZiBlLnByZXZlbnREZWZhdWx0IHRoZW4gZS5wcmV2ZW50RGVmYXVsdCgpIGVsc2UgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlXG5cdFx0XHRpZiBAcmVxdWVzdFBhZ2UoaHJlZi5hdHRyLCAnbGlua2VkJywge3NlY3Rpb259KSB0aGVuIEJhY2tib25lLmhpc3RvcnkubmF2aWdhdGUoIGhyZWYuYXR0ciwgc2lsZW50OiB5ZXMpXG5cblx0Z2V0U2VjdGlvblRvUmVmcmVzaDogKHR5cGUsIG9wdHMpLT5cblx0XHRcblx0XHR7c2VjdGlvbixocmVmfSA9IG9wdHNcblx0XHR7Z2V0U2VjdGlvbkJ5SHJlZkNoYW5nZX0gPSBAY29uZmlnXG5cblx0XHRzd2l0Y2ggdHlwZVxuXHRcdFx0XG5cdFx0XHQjIGNhbGxlZCDigJMgbGF1bmNoZXIgc2VjdGlvbiBnZXRzIGluaXRpYWxpemVkXG5cdFx0XHR3aGVuICdjYWxsZWQnXG5cdFx0XHRcdEBcblx0XHRcdFxuXHRcdFx0IyBsaW5rZWQg4oCTIGEgc3ViLXNlY3Rpb24gdG8gZmVlZCB3aXRoIGNvbnRlbnQgaXMgbmVlZGVkXG5cdFx0XHQjICAgICAgICAgIG90aGVyd2lzZSB0aGUgbGF1bmNoZXIgc2VjdGlvbiBpcyB1c2VkXG5cdFx0XHR3aGVuICdsaW5rZWQnXG5cdFx0XHRcdGlmIHNlY3Rpb24gYW5kIHNlY3Rpb24uc2VjdGlvbnMubGVuZ3RoID4gMCB0aGVuIHNlY3Rpb24gZWxzZSBAXG5cdFx0XHRcblx0XHRcdCMgbmF2aWdhdGVkIOKAkyBhIHNlY3Rpb24gaXMgdG8gYmUgZGV0ZXJtaW5lZCBieSBzb3VyY2UgYW5kIHRhcmdldCBocmVmc1xuXHRcdFx0d2hlbiAnbmF2aWdhdGVkJ1xuXHRcdFx0XHRpZiBnZXRTZWN0aW9uQnlIcmVmQ2hhbmdlIHRoZW4gZ2V0U2VjdGlvbkJ5SHJlZkNoYW5nZS5jYWxsKEAsIEBjdXJyUGFnZS5nZXQoJ2hyZWYnKSwgaHJlZikgZWxzZSBAXG5cdFx0XHRcblx0XHRcdGVsc2UgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlcXVlc3QgdHlwZScpXG5cblx0cmVxdWVzdFBhZ2U6IChocmVmLCB0eXBlLCBvcHRzID0ge30gKSAtPiAjIGJ5Um91dGUgPSBmYWxzZSwgYWN0aXZlU2VjdGlvbiA9IG51bGwpIC0+XG5cblx0XHRyZXR1cm4gZmFsc2UgaWYgQGxvYWRpbmcgYW5kIEBsb2FkaW5nLnN0YXRlKCkgaXMgJ3BlbmRpbmcnIG9yIEBjdXJyUGFnZT8uZ2V0KCdocmVmJykgaXMgaHJlZlxuXG5cdFx0IyBkZXRlcm1pbmUgc2VjdGlvbiByZXNwb25zaWJsZSBmb3IgdGhlIGRpc3BsYXkgb2YgbmV3IGNvbnRlbnRcblx0XHRzZWN0aW9uID0gQGdldFNlY3Rpb25Ub1JlZnJlc2goIHR5cGUsIF8uZXh0ZW5kKG9wdHMse2hyZWZ9KSApXG5cblx0XHQjIHJlcXVlc3QgdGhlIHBhZ2UgYW5kIHJlcGxhY2UgdGhlIHRhcmdldCBzZWN0aW9uJ3MgY29udGVudFxuXHRcdGxhdW5jaGVyID0gQFxuXHRcdEB0cmlnZ2VyICdwYWdlUmVxdWVzdGVkJywge2hyZWYsIHR5cGUsIHNlY3Rpb24sIHNlY3Rpb25zOnNlY3Rpb24/LnNlY3Rpb25zfVxuXHRcdEBwYWdlcy5ieUhyZWYgaHJlZiwgQCwgKHBhZ2UpIC0+IFxuXG5cdFx0XHRAdHJpZ2dlciAncGFnZUZldGNoZWQnLCBwYWdlXHRcdFx0XHRcblx0XHRcdGxvYWRpbmcgPSBAbG9hZGluZyA9IG5ldyAkLkRlZmVycmVkKClcdFxuXG5cdFx0XHRAbmV4dFBhZ2UgPSBwYWdlXG5cblx0XHRcdHNlY3Rpb24ucmVsb2FkKCBwYWdlLCAtPlxuXHRcdFx0XHRcblx0XHRcdFx0QG5leHRQYWdlID0gbnVsbFxuXHRcdFx0XHRAY3VyclBhZ2UgPSBwYWdlXG5cdFx0XHRcdEB0cmlnZ2VyICd0cmFuc2l0aW9uRG9uZScsIEBlbFxuXHRcdFx0XHRsb2FkaW5nLnJlc29sdmUgbGF1bmNoZXJcblx0XHRcdFxuXHRcdFx0LEApXHRcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXG4iXX0=
return Launcher;
}));
