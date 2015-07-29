(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'underscore', 'backbone'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('underscore'), require('backbone'));
  } else {
    root.Viewlauncher = factory(root.$, root._, root.Backbone);
  }
}(this, function($, _, Backbone) {
var ElementSynchronizer, Launcher, PageCollection, PageModel, SectionContent, ViewCollection, ViewLoader, exports,
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
    var url;
    url = this.collection.config.loadRoot + '/' + this.get('href');
    return this.fetching = $.ajax({
      type: 'GET',
      url: url
    }).done(_.bind(function(html) {
      this.parseHtml(html);
      return next.call(context, this);
    }, this)).fail(function(error) {
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
    return _.indexOf(this.get('bodyClasses'), className) >= 0;
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

exports = exports || {};

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
    transitionFnc = _.isString(this.transition) ? this.transitionPresets[this.transition] : this.transition || this.transitionPresets['cut'];
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
    var ExtendedSection, detectedSections, launcher, requiredSections, section, transitionStates;
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
        transitionStates = section.extension.transitionStates;
        if (transitionStates) {
          transitionStates = _.extend({}, transitionStates);
          delete section.extension.transitionStates;
        }
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
        if (transitionStates) {
          _.extend(section.transitionStates, transitionStates);
        }
        _results.push(section);
      }
      return _results;
    })());
    return next.call(this);
  },
  loadViews: function($el, views, minLoadingTime, next) {
    this.views = this.contents.last().views = new ViewLoader();
    return this.views.findAndLoad(views, $el, this, minLoadingTime, function() {
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
    loadRoot: '',
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
    this.config.loadRoot = location.protocol + '//' + location.host + this.config.root;
    this.trigger('historyStarted', this.router);
    href = Backbone.history.fragment;
    this.pages = new PageCollection(this.config.pages, {
      root: this.config.root,
      loadRoot: this.config.loadRoot,
      initialHref: href,
      initialHtml: $('html').html()
    });
    this.requestPage(href, 'called');
    return this;
  },
  requestClickedLink: function(e, section) {
    var $a, href, loadRoot;
    if (section == null) {
      section = this;
    }
    e.stopPropagation();
    $a = $(e.currentTarget);
    href = {
      prop: $a.prop('href'),
      attr: $a.attr('href')
    };
    loadRoot = this.config.loadRoot;
    if (href.prop.slice(0, loadRoot.length) === loadRoot) {
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

return Launcher;
}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld2xhdW5jaGVyLmpzIiwic291cmNlcyI6WyJ2aWV3bGF1bmNoZXIuanMiXSwibmFtZXMiOlsicm9vdCIsImZhY3RvcnkiLCJkZWZpbmUiLCJhbWQiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsIkVsZW1lbnRTeW5jaHJvbml6ZXIiLCJMYXVuY2hlciIsIlBhZ2VDb2xsZWN0aW9uIiwiUGFnZU1vZGVsIiwiU2VjdGlvbkNvbnRlbnQiLCJWaWV3Q29sbGVjdGlvbiIsIlZpZXdMb2FkZXIiLCJfX2V4dGVuZHMiLCJjaGlsZCIsInBhcmVudCIsImN0b3IiLCJ0aGlzIiwiY29uc3RydWN0b3IiLCJrZXkiLCJfX2hhc1Byb3AiLCJjYWxsIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiJGVsMSIsIiRlbDIiLCJwYXRoIiwiZ2V0QXR0cmlidXRlc09mIiwiJHRhcmdldCIsImFsbG93ZWRBdHRycyIsImF0dHJzIiwiZWFjaCIsImEiLCJkb0NvbGxlY3RBdHRyaWJ1dGUiLCJwcm9wcyIsIl9pIiwiX2xlbiIsIl9yZWYiLCJhdHRyaWJ1dGVzIiwibGVuZ3RoIiwibmFtZSIsInZhbHVlIiwicHVzaCIsImZpbmQiLCJmaW5kMSIsImZpbmQyIiwiaHRtbDEiLCJodG1sMiIsImZpbHRlciIsIiQiLCJvcHRzIiwiJGJvdGhFbGVtZW50cyIsInNlbGYiLCJzeW5jIiwic2FtZVNpemUiLCIkc291cmNlIiwiaW5kZXgiLCJlcSIsInN5bmNDb250ZW50Iiwic3luY0F0dHJpYnV0ZXMiLCJzeW5jQ29udGVudE9mIiwic3luY1RleHRPZiIsIm1ldGhvZCIsImkiLCJjbGFzc2VzT2YiLCJzeW5jQXR0cmlidXRlc09mIiwic3R5bGVzT2YiLCJyZW1vdmVBdHRyIiwiXyIsImtleXMiLCJqb2luIiwiYXR0ciIsIkJhY2tib25lIiwiTW9kZWwiLCJleHRlbmQiLCJkZWZhdWx0cyIsImhyZWYiLCIkaHRtbCIsImJvZHlDbGFzc2VzIiwiY29udGV4dCIsIm5leHQiLCJ1cmwiLCJjb2xsZWN0aW9uIiwiY29uZmlnIiwibG9hZFJvb3QiLCJnZXQiLCJmZXRjaGluZyIsImFqYXgiLCJ0eXBlIiwiZG9uZSIsImJpbmQiLCJodG1sIiwicGFyc2VIdG1sIiwiZmFpbCIsImVycm9yIiwiRXJyb3IiLCJzdGF0dXNUZXh0IiwibWF0Y2hlcyIsInNldCIsIm1hdGNoIiwiY29tcGFjdCIsInNwbGl0IiwidGV4dCIsImNsYXNzTmFtZSIsIiRjdXJyQ29udGV4dCIsIkNvbGxlY3Rpb24iLCJtb2RlbHMiLCJhZGQiLCJtb2RlbCIsImluaXRpYWxIcmVmIiwiaW5pdGlhbEh0bWwiLCJieUhyZWYiLCJwYWdlIiwic2xpY2UiLCJmaW5kV2hlcmUiLCJ2aWV3cyIsInJlc2V0IiwidmlldyIsIl9qIiwiX2xlbjEiLCJpc0FycmF5IiwiZm5jIiwiaXNGbmMiLCJpc1N0ciIsIl9yZXN1bHRzIiwiaXNGdW5jdGlvbiIsIndoZXJlIiwicmVzdWx0cyIsInZhbCIsInJlc29sdmVBcnJheVBhdGgiLCJmaXJzdCIsImxhc3QiLCJwcm9wZXJ0eSIsImlzT2JqZWN0IiwicHJvcCIsInByb3BlcnR5MSIsInByb3BlcnR5MiIsIndhaXRGb3IiLCJmbmNOYW1lIiwib3B0aW9ucyIsIm1pbkR1cmF0aW9uIiwibWF4RHVyYXRpb24iLCJhY3Rpb25zIiwiaXNEb25lIiwibWF4Q2xvY2siLCJ1c2VBcnJheSIsIndhaXRGb3JNaW5EdXJhdGlvbiIsInNldFRpbWVvdXQiLCJkZmQiLCJEZWZlcnJlZCIsImFwcGx5IiwicmVzb2x2ZSIsImNvbmNhdCIsIm9iaiIsImNodW5rIiwic2VsZWN0b3IiLCIkcmV0dXJuIiwiX3N1cGVyIiwiVmlld1Byb3RvdHlwZSIsImluaXRpYWxpemUiLCJsb2FkIiwibGF1bmNoIiwidXBkYXRlIiwibWluTG9hZGluZ1RpbWUiLCJkZXRlY3RlZFZpZXdzIiwicmVxdWlyZVBhdGhzIiwiaXMiLCJyZXF1aXJlUGF0aCIsImNyZWF0ZVZpZXdJbnN0YW5jZXMiLCJsb2FkSW5zdGFuY2VzIiwidmlld0xvYWRlciIsInZpZXdQcm90b3R5cGUiLCJsb2FkZXIiLCJkZWZhdWx0Q3ljbGUiLCJkZWZhdWx0TW9kdWxlIiwiZXh0ZW5zaW9uIiwiVmlldyIsImxhdW5jaEluc3RhbmNlcyIsImluc3RhbmNlIiwiY3ljbGUiLCJ1cGRhdGVJbnN0YW5jZXMiLCJuZXh0UGFnZSIsIiRlbCIsInBhZ2VTeW5jIiwidW5sb2FkSW5zdGFuY2VzIiwic2VjdGlvbnMiLCJzdGF0ZXMiLCJzZWN0aW9uIiwidHJhbnNpdGlvblN0YXRlcyIsInVzZUNsYXNzVHJhbnNpdGlvbnMiLCJ0byIsInN0YXRlTmFtZSIsImR1cmF0aW9uIiwic3RhdGUiLCJ0b1N0YXRlQ2xhc3MiLCJjc3MiLCJhbmltYXRlIiwicHJvbWlzZSIsInJlbW92ZUNsYXNzIiwiYWRkQ2xhc3MiLCJmaW5kU3luY2VkIiwiaGFzQm9keUNsYXNzIiwic2l6ZSIsIndpZHRoIiwiaGVpZ2h0IiwicG9zIiwidG9wIiwicG9zaXRpb24iLCJsZWZ0Iiwib2Zmc2V0IiwiU2VjdGlvbiIsImNvbnRlbnRzIiwiYmVmb3JlIiwiZGlzcGxheSIsIm9wYWNpdHkiLCJhZnRlciIsImZpbmFsIiwiY3VyciIsImZhZGVpbiIsIndoaXRlZmFkZSIsImNyb3NzZmFkZSIsImV2ZW50cyIsImNsaWNrIGFbaHJlZl0iLCJlIiwiZ2V0TGF1bmNoZXIiLCJyZXF1ZXN0Q2xpY2tlZExpbmsiLCJsYXVuY2hlciIsInRyaWdnZXIiLCJlbCIsImZpbmRBbmRMb2FkIiwiaXNUcmlnZ2VyU2VjdGlvbiIsImlzTGF1bmNoZXIiLCJsYXVuY2hhYmxlIiwibGF1bmNoYWJsZXMiLCJzZWN0aW9uU2VsZWN0b3IiLCJzZWN0aW9uc0xhdW5jaGFibGVzIiwiaXNTdHJpbmciLCJyZW5kZXIiLCJsb2FkU2VjdGlvbnMiLCJsb2FkVmlld3MiLCIkY29udGV4dCIsImlzSW5pdGlhbENvbnRlbnQiLCJzZWN0aW9uQ29udGVudCIsImN1cnJQYWdlIiwiZW1wdHkiLCJzZWN0aW9uQ29udGVudENsYXNzTmFtZSIsInNldEVsZW1lbnQiLCJhcHBlbmQiLCJyZXNldENvbnRlbnQiLCJjdXJyQ29udGVudCIsIm5leHRDb250ZW50IiwidHJhbnNpdGlvbkZuYyIsInVubG9hZExhdW5jaGFibGVzIiwicmVtb3ZlIiwibGF1bmNoVmlld3MiLCJ0cmFuc2l0aW9uIiwidHJhbnNpdGlvblByZXNldHMiLCJsYXVuY2hTZWN0aW9uc1ZpZXdzIiwiZGV0ZWN0ZWRTZWN0aW9ucyIsInJlcXVpcmVkU2VjdGlvbnMiLCJFeHRlbmRlZFNlY3Rpb24iLCJpbWFnZXNUb0xvYWQiLCJsb2FkQ29udGVudEFzc2V0cyIsInJlbG9hZCIsInJlbG9hZFNlY3Rpb25zIiwicGFnZXMiLCJyb3V0ZXIiLCJwdXNoU3RhdGUiLCJSb3V0ZXIiLCJyb3V0ZXMiLCIqcGF0aCIsInJlcXVlc3QiLCJyZXF1ZXN0UGFnZSIsImhpc3RvcnkiLCJzdGFydCIsInNpbGVudCIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwiZnJhZ21lbnQiLCIkYSIsInN0b3BQcm9wYWdhdGlvbiIsImN1cnJlbnRUYXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsInJldHVyblZhbHVlIiwibmF2aWdhdGUiLCJnZXRTZWN0aW9uQnlIcmVmQ2hhbmdlIiwibG9hZGluZyIsImdldFNlY3Rpb25Ub1JlZnJlc2giXSwibWFwcGluZ3MiOiJDQUFBLFNBQUFBLEVBQUFDLEdBQUEsa0JBQUFDLFNBQUFBLE9BQUFDLDBFQUFBQyxPQUFBQyxRQUFBSixFQUE0QkssUUFBQSxVQUFBQSxRQUFBLGNBQUFBLFFBQUEsd0VBTTNCLEdBQUFDLEdBQUFDLEVBRUFDLEVBRkFDLEVBQUFDLEVBQUFDLEVBQUFDLEVBQUFSLHNCQVFhUyxFQUFBLFNBQUFDLEVBQUFDLEdBQUEsUUFBQUMsS0FBQUMsS0FBQUMsWUFBQUosRUFBUyxJQUFPLEdBQWhCSyxLQUFBSixHQUFBSyxFQUFBQyxLQUFBTixFQUFBSSxLQUFBTCxFQUFBSyxHQUFBSixFQUFBSSxHQUFBLE9BQUFILEdBQUFNLFVBQUFQLEVBQUFPLFVBQUFSLEVBQUFRLFVBQUEs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S0FFQXNKLEVBQUNqTixLQUFEQSxLQUNBa04sUUFBVSxpQkFFVnZKLEtBQUNBLFNBSUErRyxRQUFDQSxFQUFERixTQUNZLE1BQVhFLEVBRERBLEVBQUFGLFNBQUEsb0JBR0ExRSxPQUFPbkMsRUFBQzNELEtBQVEsU0FMSytGLEdBQUEsR0FPckIrSyxFQXh4QkosT0Frd0JFOVEsTUFBQWtOLFFBQUEsY0FBQW5ILEdBd0JBK0ssRUExQlk5USxLQUFBOFEsUUFBQSxHQUFBOU8sR0FBQW9HLFNBNUVicEksS0FBQW9LLFNBQUFyRSxFQXByQkQyRSxFQUFBNEUsT0FBQXZKLEVBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJFbGVtZW50U3luY2hyb25pemVyID0gY2xhc3MgRWxlbWVudFN5bmNocm9uaXplclxuXG5cbiMgUFJPUEVSVElFU1xuXG5cblx0JGVsMTogbnVsbFxuXHQkZWwyOiBudWxsXG5cdHBhdGg6ICcnXG5cblxuIyBDT05TVFJVQ1RPUlxuXG5cblx0Y29uc3RydWN0b3I6IChAJGVsMSwgQCRlbDIsIEBwYXRoKSAtPiByZXR1cm4gQFxuXHRcblxuIyBHRVRURVIgTUVUSE9EU1xuXG5cblx0Z2V0QXR0cmlidXRlc09mOiAoJHRhcmdldCwgYWxsb3dlZEF0dHJzID0gZmFsc2UpIC0+XG5cdFxuXHRcdGF0dHJzID0gW11cblx0XHQkdGFyZ2V0LmVhY2ggLT4gXG5cdFx0XHRwcm9wcyA9IHt9XG5cdFx0XHRmb3IgYSBpbiBAYXR0cmlidXRlc1xuXHRcdFx0XHRkb0NvbGxlY3RBdHRyaWJ1dGUgPSBub3QgYWxsb3dlZEF0dHJzIG9yIF8uaW5kZXhPZihhbGxvd2VkQXR0cnMsIGEubmFtZSkgPj0gMFxuXHRcdFx0XHRpZiBkb0NvbGxlY3RBdHRyaWJ1dGUgdGhlbiBwcm9wc1sgYS5uYW1lIF0gPSBhLnZhbHVlXG5cdFx0XHRhdHRycy5wdXNoIHByb3BzXG5cdFx0YXR0cnNcdFxuXG5cdGZpbmQ6IChwYXRoKSAtPiBcblxuXHRcdEBmaW5kMShwYXRoKS5hZGQoIEBmaW5kMihwYXRoKSApXG5cdFxuXHRmaW5kMTogKHBhdGggPSAnJykgLT4gXG5cblx0XHRAJGVsMS5maW5kIHBhdGhcblx0XG5cdGZpbmQyOiAocGF0aCA9ICcnKSAtPiBcblxuXHRcdEAkZWwyLmZpbmQgcGF0aFxuXG5cdGh0bWwxOiAocGF0aD0nJykgLT5cblxuXHRcdEAkZWwxLmh0bWwoKVxuXG5cdGh0bWwyOiAocGF0aD0nJykgLT5cblxuXHRcdEAkZWwyLmh0bWwoKVxuXG5cdHNhbWVTaXplOiAocGF0aCwgZmlsdGVyPScqJykgLT4gXG5cblx0XHRAZmluZDEocGF0aCkuZmlsdGVyKGZpbHRlcikubGVuZ3RoIGlzIEBmaW5kMihwYXRoKS5maWx0ZXIoZmlsdGVyKS5sZW5ndGhcblxuXG4jIEhZQlJJRCBNRVRIT0RcblxuXG5cdCQ6IChwYXRoID0gJycsIG9wdHMgPSB7IHN5bmM6J25vbmUnIH0pIC0+IFxuXHRcdFxuXHRcdHJldHVybiBmYWxzZSB1bmxlc3MgQHNhbWVTaXplIHBhdGhcblx0XHR7ZmlsdGVyLHN5bmN9ID0gb3B0c1xuXHRcdCRlbDEgPSBpZiBwYXRoIGlzbnQgJycgdGhlbiBAZmluZDEocGF0aCkgZWxzZSBAJGVsMVxuXHRcdCRlbDIgPSBpZiBwYXRoIGlzbnQgJycgdGhlbiBAZmluZDIocGF0aCkgZWxzZSBAJGVsMlxuXHRcdCRib3RoRWxlbWVudHMgPSBAZmluZChwYXRoKS5maWx0ZXIoZmlsdGVyIHx8ICcqJylcblx0XHRpZiBub3Qgc3luYyB0aGVuIHJldHVybiAkYm90aEVsZW1lbnRzXG5cdFx0c2VsZiA9IEBcblx0XHQkYm90aEVsZW1lbnRzLmVhY2ggKCkgLT4gXG5cdFx0XHRcblx0XHRcdGluZGV4ID0gJChAKS5pbmRleCgpXG5cdFx0XHQkdGFyZ2V0ID0gJGVsMS5lcSBpbmRleFxuXHRcdFx0JHNvdXJjZSA9ICRlbDIuZXEgaW5kZXhcblx0XHRcdFxuXHRcdFx0aWYgc3luYyBpcyAnY29udGVudCcgb3Igc3luYyBpcyAnYWxsJyBcblx0XHRcdFx0c2VsZi5zeW5jQ29udGVudCAkdGFyZ2V0LCAkc291cmNlXG5cdFx0XHRcblx0XHRcdGlmIHN5bmMgaXMgJ2F0dHJpYnV0ZXMnIG9yIHN5bmMgaXMgJ2FsbCcgXG5cdFx0XHRcdHNlbGYuc3luY0F0dHJpYnV0ZXMgJHRhcmdldCwgc2VsZi5nZXRBdHRyaWJ1dGVzT2YgJHNvdXJjZVx0XHRcdFx0XHRcblxuXG4jIENPTlRFTlQgU1lOQyBNRVRIT0RTXG5cblxuXHRzeW5jSHRtbE9mOiAocGF0aCkgLT4gXG5cblx0XHRAc3luY0NvbnRlbnRPZiBwYXRoLCAnaHRtbCdcblx0XG5cdHN5bmNUZXh0T2Y6IChwYXRoKSAtPiBcblxuXHRcdEBzeW5jQ29udGVudE9mIHBhdGgsICd0ZXh0J1xuXHRcblx0c3luY0NvbnRlbnRPZjogKHBhdGggPSAnJywgbWV0aG9kKSAtPiBcblx0XG5cdFx0cmV0dXJuIGZhbHNlIHVubGVzcyBAc2FtZVNpemUgcGF0aFxuXHRcdEBzeW5jQ29udGVudCBAZmluZDEocGF0aCksIEBmaW5kMihwYXRoKSwgbWV0aG9kXG5cdFx0dHJ1ZVxuXHRcblx0c3luY0NvbnRlbnQ6ICgkdGFyZ2V0LCAkc291cmNlLCBtZXRob2QgPSAnaHRtbCcpIC0+IFxuXG5cdFx0JHRhcmdldC5lYWNoIChpKSAtPiAkKEApWyBtZXRob2QgXSggJHNvdXJjZS5lcShpKVsgbWV0aG9kIF0oKSApXG5cblxuIyBBVFRSSUJVVEUgU1lOQyBNRVRIT0RTXG5cblxuXHRjbGFzc2VzT2Y6IChwYXRoKSAtPiBcblxuXHRcdEBzeW5jQXR0cmlidXRlc09mIHBhdGgsWydjbGFzcyddXG5cdFxuXHRpZHNPZjogKHBhdGgpIC0+IFxuXG5cdFx0QHN5bmNBdHRyaWJ1dGVzT2YgcGF0aCxbJ2lkJ11cblx0XG5cdHN0eWxlc09mOiAocGF0aCkgLT4gXG5cblx0XHRAc3luY0F0dHJpYnV0ZXNPZiBwYXRoLFsnc3R5bGUnXVxuXG5cdHN5bmNBdHRyaWJ1dGVzT2Y6IChwYXRoID0gJycsIGFsbG93ZWRBdHRycykgLT5cblx0XG5cdFx0cmV0dXJuIGZhbHNlIHVubGVzcyBAc2FtZVNpemUgcGF0aFxuXHRcdEBzeW5jQXR0cmlidXRlcyBAZmluZDEocGF0aCksIEBnZXRBdHRyaWJ1dGVzT2YoIEBmaW5kMihwYXRoKSwgYWxsb3dlZEF0dHJzKVxuXHRcdHRydWVcblx0XG5cdHN5bmNBdHRyaWJ1dGVzOiAoJHRhcmdldCwgYXR0cnMpIC0+IFxuXG5cdFx0JHRhcmdldC5lYWNoIChpKSAtPiAkKEApLnJlbW92ZUF0dHIoXy5rZXlzKGF0dHJzW2ldKS5qb2luKCcgJykpLmF0dHIoYXR0cnNbaV0pXHRcblxuXHRcblxuUGFnZU1vZGVsID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kXHRcdFx0XHRcblxuXHRkZWZhdWx0czpcblx0XHRocmVmOiAndW50aXRsZWQtcGFnZSdcblx0XHRodG1sOiAnJ1xuXHRcdCRodG1sOiBudWxsXG5cdFx0Ym9keUNsYXNzZXM6ICcnXG5cdFx0dGl0bGU6ICd1bnRpdGxlZCBwYWdlJ1xuXG5cdGZldGNoaW5nOiBudWxsXG5cblx0ZmV0Y2g6IChjb250ZXh0LCBuZXh0KSAtPlxuXG5cdFx0dXJsID0gQGNvbGxlY3Rpb24uY29uZmlnLmxvYWRSb290ICsgJy8nICsgQGdldCAnaHJlZidcblx0XHRAZmV0Y2hpbmcgPSAkLmFqYXggdHlwZTogJ0dFVCcsIHVybDogdXJsXG5cdFx0LmRvbmUgXy5iaW5kIChodG1sKSAtPlxuXHRcdFx0QHBhcnNlSHRtbCBodG1sXG5cdFx0XHRuZXh0LmNhbGwgY29udGV4dCwgQFx0XG5cdFx0LEBcblx0XHQuZmFpbCAoZXJyb3IpLT4gdGhyb3cgbmV3IEVycm9yIFwiQ291bGRuJ3QgbG9hZCBwYWdlICN7dXJsfSAoI3tlcnJvci5zdGF0dXNUZXh0fSlcIlx0XHRcdFx0XG5cblx0cGFyc2VIdG1sOiAoaHRtbCkgLT5cblxuXHRcdEBzZXQgJ2h0bWwnLCBodG1sXHRcdFx0XHRcdFxuXHRcdEBzZXQgJyRodG1sJywgJGh0bWwgPSAkKGh0bWwpXG5cdFx0aWYgbWF0Y2hlcyA9IGh0bWwubWF0Y2ggLzxib2R5W14+XStjbGFzcz1cIlxccyooW15cIl0qKVxccypcIltePl0qPi9cblx0XHRcdEBzZXQgJ2JvZHlDbGFzc2VzJywgXy5jb21wYWN0IG1hdGNoZXNbMV0uc3BsaXQoJyAnKVxuXHRcdEBzZXQgJ3RpdGxlJywgJGh0bWwuZmlsdGVyKCd0aXRsZScpLnRleHQoKVxuXHRcdEBcblxuXHRpczogKGNsYXNzTmFtZSkgLT4gXy5pbmRleE9mKCBAZ2V0KCdib2R5Q2xhc3NlcycpLCBjbGFzc05hbWUpID49IDBcblxuXHQkOiAocGF0aCkgLT4gQGdldCgnJGh0bWwnKS5maW5kIHBhdGhcblxuXHRzeW5jOiAocGF0aCA9ICcnLCAkY3VyckNvbnRleHQgPSAkKCdodG1sJykpIC0+ICBuZXcgRWxlbWVudFN5bmNocm9uaXplciAkY3VyckNvbnRleHQuZmluZChwYXRoKSwgQCQocGF0aCksIHBhdGhcblBhZ2VDb2xsZWN0aW9uID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmRcblx0XHRcblx0Y29uZmlnOiB7fVxuXG5cdG1vZGVsOiBQYWdlTW9kZWxcblxuXHRpbml0aWFsaXplOiAobW9kZWxzID0gW10sIEBjb25maWcpIC0+XG5cblx0XHRpZiBtb2RlbHMubGVuZ3RoIGlzIDBcblx0XHRcdEBhZGQgbmV3IEBtb2RlbCBocmVmOiBAY29uZmlnLmluaXRpYWxIcmVmXG5cdFx0XHQucGFyc2VIdG1sIEBjb25maWcuaW5pdGlhbEh0bWxcblx0XG5cdGJ5SHJlZjogKGhyZWYsIGNvbnRleHQsIG5leHQpIC0+XG5cblx0XHRocmVmID0gaWYgaHJlZi5zbGljZSgwLDEpIGlzICcvJyB0aGVuIGhyZWYuc2xpY2UoMSkgZWxzZSBocmVmXG5cdFx0aWYgcGFnZSA9IEBmaW5kV2hlcmUge2hyZWZ9XG5cdFx0XHRuZXh0LmNhbGwgY29udGV4dCwgcGFnZVxuXHRcdGVsc2Vcblx0XHRcdEBhZGQge2hyZWZ9XHRcblx0XHRcdC5mZXRjaCBjb250ZXh0LCBuZXh0XG5cdFx0XHRcdFxuY2xhc3MgVmlld0NvbGxlY3Rpb25cblxuXHRjb25zdHJ1Y3RvcjogKHZpZXdzKSAtPlxuXG5cdFx0QHJlc2V0IHZpZXdzXG5cblx0cmVzZXQ6ICh2aWV3cykgLT5cblxuXHRcdGlmIEB2aWV3c1xuXHRcdFx0Zm9yIHZpZXcgaW4gQHZpZXdzXG5cdFx0XHRcdHZpZXcucmVtb3ZlKClcblx0XHRAdmlld3MgPSBbXVxuXHRcdGlmIHZpZXdzXG5cdFx0XHRpZiBub3QgXy5pc0FycmF5KHZpZXdzKSB0aGVuIHZpZXdzID0gW3ZpZXdzXVxuXHRcdFx0Zm9yIHZpZXcgaW4gdmlld3Ncblx0XHRcdFx0QHB1c2ggdmlld1xuXHRcdEBcblxuXHRwdXNoOiAodmlldykgLT5cblxuXHRcdEB2aWV3cy5wdXNoIHZpZXdcblx0XHRAbGVuZ3RoID0gQHZpZXdzLmxlbmd0aFxuXG5cdGVhY2g6IChmbmMsIHZpZXdzID0gQHZpZXdzLCBjb250ZXh0ID0gQCkgLT5cblxuXHRcdGlzRm5jID0gXy5pc0Z1bmN0aW9uIGZuY1xuXHRcdGlzU3RyID0gbm90IGlzRm5jIGFuZCBfLmlzU3RyaW5nIGZuY1xuXHRcdGZvciB2aWV3LCBpIGluIHZpZXdzIFxuXHRcdFx0aWYgaXNGbmMgdGhlbiBmbmMuY2FsbCBjb250ZXh0LCB2aWV3LCBpIFxuXHRcdFx0ZWxzZSBpZiBpc1N0ciB0aGVuIHZpZXdbIGZuYyBdLmNhbGwgY29udGV4dCwgdmlldywgaSBcblxuXHRmaW5kOiAoa2V5LHZhbHVlKSAtPlxuXG5cdFx0QHdoZXJlKCBrZXksdmFsdWUgKVswXVxuXG5cdHdoZXJlOiAoa2V5LHZhbHVlLCBsaW1pdCkgLT5cblx0XHRcblx0XHRyZXN1bHRzID0gW11cblx0XHRpc0FycmF5ID0gXy5pc0FycmF5IGtleVxuXHRcdEBlYWNoICh2aWV3KSAtPiBcblx0XHRcdHZhbCA9IGlmIGlzQXJyYXkgdGhlbiBAcmVzb2x2ZUFycmF5UGF0aCh2aWV3LCBrZXkpIGVsc2Ugdmlld1sga2V5IF1cblx0XHRcdGlmIHZhbCBpcyB2YWx1ZSB0aGVuIHJlc3VsdHMucHVzaCB2aWV3XG5cdFx0cmVzdWx0c1xuXG5cdGZpcnN0OiAtPlxuXG5cdFx0QHZpZXdzLnNsaWNlKDAsMSlbMF1cblxuXHRsYXN0OiAtPlxuXG5cdFx0QHZpZXdzLnNsaWNlKC0xKVswXVxuXG5cdHNldDogKHByb3BlcnR5LCB2YWx1ZSkgLT5cblxuXHRcdGlmIF8uaXNPYmplY3QgcHJvcGVydHlcblx0XHRcdEBlYWNoICh2aWV3KSAtPiBcblx0XHRcdFx0Zm9yIHByb3AsIHZhbCBvZiBwcm9wZXJ0eVxuXHRcdFx0XHRcdHZpZXdbIHByb3AgXSA9IHZhbFxuXHRcdGVsc2Vcblx0XHRcdEBlYWNoICh2aWV3KSAtPiB2aWV3WyBwcm9wZXJ0eSBdID0gdmFsdWVcblx0XHRcdFx0XG5cdFx0QFxuXG5cdGdldDogKHByb3BlcnR5MSwgcHJvcGVydHkyKSAtPlxuXG5cdFx0cmVzdWx0cyA9IGlmIHByb3BlcnR5MiB0aGVuIHt9IGVsc2UgW11cblx0XHRAZWFjaCAodmlldykgLT4gXG5cdFx0XHR2YWwgPSBzd2l0Y2hcblx0XHRcdFx0d2hlbiBfLmlzQXJyYXkgcHJvcGVydHkxIHRoZW4gQHJlc29sdmVBcnJheVBhdGggdmlldywgcHJvcGVydHkxXG5cdFx0XHRcdHdoZW4gXy5pc0Z1bmN0aW9uIHZpZXdbcHJvcGVydHkxXSB0aGVuIHZpZXdbcHJvcGVydHkxXS5jYWxsIHZpZXdcblx0XHRcdFx0ZWxzZSB2aWV3W3Byb3BlcnR5MV1cblx0XHRcdGlmIHByb3BlcnR5MlxuXHRcdFx0XHRrZXkgPSBzd2l0Y2hcblx0XHRcdFx0XHR3aGVuIF8uaXNBcnJheSBwcm9wZXJ0eTIgdGhlbiBAcmVzb2x2ZUFycmF5UGF0aCB2aWV3LCBwcm9wZXJ0eTJcblx0XHRcdFx0XHRlbHNlIHByb3BlcnR5MlxuXHRcdFx0XHRyZXN1bHRzWyBrZXkgXSA9IHZhbFxuXHRcdFx0ZWxzZSBpZiB2YWxcblx0XHRcdFx0cmVzdWx0cy5wdXNoIHZhbFxuXHRcdHJlc3VsdHNcblxuXHR3YWl0Rm9yOiAoZm5jTmFtZSwgY29udGV4dCA9IEAsIG5leHQsIG9wdGlvbnMsIG1pbkR1cmF0aW9uID0gMCwgbWF4RHVyYXRpb24gPSAyMDAwMCkgLT5cblxuXHRcdCMgaWYgQHZpZXdzLmxlbmd0aCBpcyAwIHRoZW4gcmV0dXJuIG5leHQuY2FsbCBjb250ZXh0XG5cblx0XHRpc0RvbmUgPSBub1xuXHRcdHdhaXRGb3JNaW5EdXJhdGlvbiA9IG1pbkR1cmF0aW9uID4gMFxuXG5cdFx0aWYgd2FpdEZvck1pbkR1cmF0aW9uXG5cdFx0XHRzZXRUaW1lb3V0IC0+IFxuXHRcdFx0XHRpZiBpc0RvbmUgdGhlbiBuZXh0LmNhbGwoY29udGV4dCkgZWxzZSB3YWl0Rm9yTWluRHVyYXRpb24gPSBub1xuXHRcdFx0LG1pbkR1cmF0aW9uXG5cdFx0aWYgbWF4RHVyYXRpb24gPiAwIFxuXHRcdFx0bWF4Q2xvY2sgPSBzZXRUaW1lb3V0IC0+IFxuXHRcdFx0XHR0aHJvdyBFcnJvciBcIm1heCB3YWl0IGR1cmF0aW9uIG9mICN7bWF4RHVyYXRpb259IGV4Y2VlZGVkIGZvciBmdW5jdGlvbiAje2ZuY05hbWV9XCJcblx0XHRcdFx0bmV4dC5jYWxsIGNvbnRleHRcblx0XHRcdCxtYXhEdXJhdGlvblxuXHRcdHVzZUFycmF5ID0gXy5pc0FycmF5IGZuY05hbWVcblx0XHRhY3Rpb25zID0gQGVhY2ggKHZpZXcpIC0+XG5cdFx0XHRkZmQgPSBuZXcgJC5EZWZlcnJlZCgpXG5cdFx0XHRmbmMgPSBpZiB1c2VBcnJheSB0aGVuIEByZXNvbHZlQXJyYXlQYXRoKHZpZXcsZm5jTmFtZSkgZWxzZVx0dmlld1tmbmNOYW1lXVxuXHRcdFx0aWYgXy5pc0FycmF5KG9wdGlvbnMpIHRoZW4gZm5jLmFwcGx5IHZpZXcsIFtkZmQucmVzb2x2ZV0uY29uY2F0KG9wdGlvbnMpXG5cdFx0XHRlbHNlIGZuYy5jYWxsIHZpZXcsIGRmZC5yZXNvbHZlXG5cdFx0XHRkZmRcdFxuXHRcdCQud2hlbi5hcHBseSAkLCBhY3Rpb25zXG5cdFx0LmRvbmUgLT4gXG5cdFx0XHRpZiBtYXhDbG9jayB0aGVuIGNsZWFyVGltZW91dCBtYXhDbG9jayBcblx0XHRcdGlmIG5vdCB3YWl0Rm9yTWluRHVyYXRpb24gdGhlbiBuZXh0LmNhbGwoY29udGV4dClcblx0XHRcdGlzRG9uZSA9IHllc1xuXHRcdEBcblxuXHRyZXNvbHZlQXJyYXlQYXRoOiAob2JqLCBwYXRoKSAtPlxuXHRcdFxuXHRcdGZvciBjaHVuayBpbiBwYXRoXG5cdFx0XHRvYmogPSBvYmpbY2h1bmtdXG5cdFx0b2JqXG5cblx0JDogKHNlbGVjdG9yKSAtPlxuXG5cdFx0JHJldHVybiA9ICQgW107XG5cdFx0dmlld3MgPSBfLmZpbHRlciBAdmlld3MsICh2aWV3KSAtPiB2aWV3LiRlbC5pcyBzZWxlY3RvclxuXHRcdGlmIHZpZXdzLmxlbmd0aCA+IDAgdGhlbiBAZWFjaCAoKHZpZXcpIC0+ICRyZXR1cm4gPSAkcmV0dXJuLmFkZCB2aWV3LiRlbCApLCB2aWV3c1xuXHRcdCRyZXR1cm5cblxuXG5jbGFzcyBWaWV3TG9hZGVyIGV4dGVuZHMgVmlld0NvbGxlY3Rpb25cblx0XHRcblx0Y29uc3RydWN0b3I6ICh2aWV3cykgLT4gc3VwZXIgdmlld3NcblxuXHRWaWV3UHJvdG90eXBlOiBcblx0XHRcblx0XHRpbml0aWFsaXplOiAoQGNvbmZpZykgLT5cblxuXHRcdGN5Y2xlOlxuXHRcdFx0bG9hZDogKG5leHQpIC0+IG5leHQuY2FsbCBAIFx0XHRcdFx0XHRcblx0XHRcdGxhdW5jaDogLT5cdFxuXHRcdFx0dXBkYXRlOiAtPiBcdFx0XHRcdFx0XG5cdFx0XHR1bmxvYWQ6IChuZXh0KSAtPiBuZXh0LmNhbGwgQFxuXG5cdGZpbmRBbmRMb2FkOiAodmlld3MsICRodG1sLCBjb250ZXh0LCBtaW5Mb2FkaW5nVGltZSwgbmV4dCApIC0+XG5cblx0XHRkZXRlY3RlZFZpZXdzID0gXy5maWx0ZXIgdmlld3MsICh2aWV3KSAtPiAkaHRtbC5pcyBcIjpoYXMoI3t2aWV3LnNlbGVjdG9yfSlcIlxuXG5cdFx0cmVxdWlyZVBhdGhzID0gZm9yIHZpZXcsIGkgaW4gZGV0ZWN0ZWRWaWV3c1xuXHRcdFx0aWYgdmlldy5yZXF1aXJlUGF0aCB0aGVuIHZpZXcucmVxdWlyZVBhdGhcblx0XHRcdGVsc2UgQGNyZWF0ZVZpZXdJbnN0YW5jZXMoJGh0bWwsdmlldyx2aWV3KVxuXHRcdFxuXHRcdCMgaWYgcmVxdWlyZVBhdGhzLmxlbmd0aCBhbmQgdHlwZW9mIHJlcXVpcmUgaXMgJ2Z1bmN0aW9uJ1xuXHRcdCMgXHRsb2FkZXIgPSBAXG5cdFx0IyBcdHJlcXVpcmUgcmVxdWlyZVBhdGhzLCAtPlxuXHRcdCMgXHRcdGZvciB2aWV3LCBpIGluIGRldGVjdGVkVmlld3Ncblx0XHQjIFx0XHRcdGxvYWRlci5jcmVhdGVWaWV3SW5zdGFuY2VzKCRodG1sLHZpZXcsYXJndW1lbnRzW2ldKVxuXG5cdFx0IyBcdFx0bG9hZGVyLmxvYWRJbnN0YW5jZXMgY29udGV4dCwgbmV4dCwgbWluTG9hZGluZ1RpbWVcdFxuXHRcdCMgZWxzZVxuXHRcdCMgXHRAbG9hZEluc3RhbmNlcyBjb250ZXh0LCBuZXh0LCBtaW5Mb2FkaW5nVGltZVxuXHRcdEBsb2FkSW5zdGFuY2VzIGNvbnRleHQsIG5leHQsIG1pbkxvYWRpbmdUaW1lXG5cdFx0QFxuXHRcblxuXHRjcmVhdGVWaWV3SW5zdGFuY2VzOiAoJGh0bWwsdmlld0xvYWRlcix2aWV3UHJvdG90eXBlKS0+XG5cblx0XHRsb2FkZXIgPSBAXG5cdFx0JGh0bWwuZmluZCh2aWV3TG9hZGVyLnNlbGVjdG9yKS5lYWNoIChpKSAtPiBcdFxuXHRcdFx0XHRcdFx0XG5cdFx0XHRkZWZhdWx0TW9kdWxlID0gXy5leHRlbmQge30sIGxvYWRlci5WaWV3UHJvdG90eXBlXG5cdFx0XHRkZWZhdWx0Q3ljbGUgPSBfLmV4dGVuZCB7fSwgZGVmYXVsdE1vZHVsZS5jeWNsZVxuXHRcdFx0XG5cdFx0XHRleHRlbnNpb24gPSBfLmV4dGVuZCBkZWZhdWx0TW9kdWxlLCB2aWV3UHJvdG90eXBlXG5cdFx0XHRleHRlbnNpb24uY3ljbGUgPSBfLmV4dGVuZCBkZWZhdWx0Q3ljbGUsIGV4dGVuc2lvbi5jeWNsZVxuXHRcdFx0dmlld1Byb3RvdHlwZSA9IEJhY2tib25lLlZpZXcuZXh0ZW5kIGV4dGVuc2lvblxuXHRcdFx0XG5cdFx0XHRsb2FkZXIucHVzaCBuZXcgdmlld1Byb3RvdHlwZShfLmV4dGVuZCBlbDokKEApLCB2aWV3TG9hZGVyKVxuXG5cdGxvYWRJbnN0YW5jZXM6IChjb250ZXh0LCBuZXh0LCBtaW5Mb2FkaW5nVGltZSA9IDApIC0+XG5cdFx0XG5cdFx0QHdhaXRGb3IgWydjeWNsZScsJ2xvYWQnXSwgY29udGV4dCwgbmV4dCwgbnVsbCwgbWluTG9hZGluZ1RpbWVcblxuXHRsYXVuY2hJbnN0YW5jZXM6IC0+XG5cblx0XHRAZWFjaCAoaW5zdGFuY2UpIC0+IGluc3RhbmNlLmN5Y2xlLmxhdW5jaC5jYWxsIGluc3RhbmNlXG5cdFxuXHR1cGRhdGVJbnN0YW5jZXM6IChuZXh0UGFnZSwgJGVsKSAtPlxuXG5cdFx0QGVhY2ggKGluc3RhbmNlKSAtPiBcblx0XHRcdHBhZ2VTeW5jID0gbmV4dFBhZ2Uuc3luYyBpbnN0YW5jZS5jb25maWcuc2VsZWN0b3IsICRlbFxuXHRcdFx0aW5zdGFuY2UuY3ljbGUudXBkYXRlLmNhbGwgaW5zdGFuY2UsIHBhZ2VTeW5jXG5cblx0dW5sb2FkSW5zdGFuY2VzOiAoY29udGV4dCwgbmV4dCkgLT5cblxuXHRcdEB3YWl0Rm9yIFsnY3ljbGUnLCd1bmxvYWQnXSwgQCwgLT5cblx0XHRcdEByZXNldCgpXG5cdFx0XHRuZXh0LmNhbGwgY29udGV4dFxuXG5TZWN0aW9uQ29udGVudCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kXHRcblxuXHRzZWN0aW9uczogbnVsbFxuXHRcblx0dmlld3M6IG51bGxcblx0XG5cdHN0YXRlczogbnVsbFxuXG5cdHVzZUNsYXNzVHJhbnNpdGlvbnM6IGZhbHNlXG5cblx0aW5pdGlhbGl6ZTogKEBjb25maWcpIC0+IFxuXHRcdFxuXHRcdEBzdGF0ZXMgPSBAY29uZmlnLnNlY3Rpb24udHJhbnNpdGlvblN0YXRlc1xuXHRcdEB1c2VDbGFzc1RyYW5zaXRpb25zID0gXy5pc0FycmF5KCBAc3RhdGVzIClcblx0XHRAJGVsLmh0bWwgQGNvbmZpZy5odG1sXG5cblxuIyBTRVRURVIgTUVUSE9EU1xuXG5cblx0dG86IChzdGF0ZU5hbWUsIGR1cmF0aW9uPTApIC0+XHRcdFx0XHRcdFxuXHRcdFxuXHRcdHN0YXRlID0gQHN0YXRlc1sgc3RhdGVOYW1lIF1cblx0XHRcblx0XHRpZiBub3Qgc3RhdGUgdGhlbiByZXR1cm5cblxuXHRcdGlmIG5vdCBAdG9TdGF0ZUNsYXNzKCBzdGF0ZSApXG5cblx0XHRcdGlmIGR1cmF0aW9uIGlzIDBcblx0XHRcdFx0QCRlbC5jc3Mgc3RhdGVcblx0XHRcdFx0QFxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRAJGVsLmFuaW1hdGUoc3RhdGUsIGR1cmF0aW9uKS5wcm9taXNlKClcblxuXHR0b1N0YXRlQ2xhc3M6IChzdGF0ZSkgLT5cblxuXHRcdHJldHVybiBmYWxzZSBpZiBub3QgQHVzZUNsYXNzVHJhbnNpdGlvbnNcblx0XHRAJGVsLnJlbW92ZUNsYXNzIEBzdGF0ZXMuam9pbignICcpXG5cdFx0LmFkZENsYXNzIHN0YXRlXG5cdFx0dHJ1ZVxuXG5cbiMgR0VUVEVSIE1FVEhPRFNcdFxuXG5cblx0ZmluZFN5bmNlZDogKHBhdGgsIHZpZXcpIC0+XG5cblx0XHRAJChwYXRoKS5hZGQodmlldy4kKHBhdGgpKVxuXG5cdGhhc0JvZHlDbGFzczogKCBjbGFzc05hbWUgKSAtPlxuXG5cdFx0QGNvbmZpZy5wYWdlLmlzKCBjbGFzc05hbWUgKVx0XG5cblxuXHRzaXplOiAtPiBcblx0XHRcblx0XHR3aWR0aDogQCRlbC53aWR0aCgpLCBoZWlnaHQ6IEAkZWwuaGVpZ2h0KClcblx0XG5cdHBvczogLT4gXG5cblx0XHR0b3A6IEAkZWwucG9zaXRpb24oKS50b3AsIGxlZnQ6IEAkZWwucG9zaXRpb24oKS5sZWZ0XG5cdFxuXHRvZmY6IC0+IFxuXG5cdFx0dG9wOiBAJGVsLm9mZnNldCgpLnRvcCwgbGVmdDogQCRlbC5vZmZzZXQoKS5sZWZ0XG5cdFxuXG5leHBvcnRzID0gZXhwb3J0cyBvciB7fVxuZXhwb3J0cy5TZWN0aW9uID0gXG5cblx0QmFja2JvbmUuVmlldy5leHRlbmRcblx0XHRcdFxuXHRcdCMgdGhpcyBzZWN0aW9ucyBjdXJyZW50IHN1Yi1zZWN0aW9ucyBbVmlld0NvbGxlY3Rpb25dXG5cdFx0c2VjdGlvbnM6IG51bGxcblxuXHRcdCMgdGhpcyBzZWN0aW9ucyBjdXJyZW50IHZpZXdzIFtWaWV3TG9hZGVyXVxuXHRcdHZpZXdzOiBudWxsXG5cblx0XHQjIHRoaXMgc2VjdGlvbnMgY3VycmVudCBjb250ZW50cyB1c2VkIGZvciB0cmFuc2l0aW9ucyBbVmlld0NvbGxlY3Rpb25dXG5cdFx0Y29udGVudHM6IG51bGxcblxuXHRcdHRyYW5zaXRpb25TdGF0ZXM6XG5cdFx0XHRcblx0XHRcdGJlZm9yZTogZGlzcGxheTonYmxvY2snLCBvcGFjaXR5OjAsIHBvc2l0aW9uOidhYnNvbHV0ZScsIHRvcDowLCBsZWZ0OjBcblx0XHRcdGFmdGVyOiBwb3NpdGlvbjonYWJzb2x1dGUnLCBvcGFjaXR5OiAxXG5cdFx0XHRmaW5hbDogcG9zaXRpb246J3N0YXRpYydcblxuXHRcdHRyYW5zaXRpb25QcmVzZXRzOlxuXG5cdFx0XHRjdXQ6IChjdXJyLCBuZXh0LCBkb25lKSAtPiBcdFx0XHRcdFxuXHRcdFx0XHRpZiBjdXJyIHRoZW4gY3Vyci50byAnYWZ0ZXInXG5cdFx0XHRcdG5leHQudG8gJ2FmdGVyJ1xuXHRcdFx0XHRkb25lKClcblx0XHRcdGZhZGVpbjogKGN1cnIsIG5leHQsIGRvbmUsIGR1cmF0aW9uPTEwMDApIC0+IFxuXHRcdFx0XHRpZiBjdXJyIHRoZW4gY3Vyci50byAnYWZ0ZXInXG5cdFx0XHRcdG5leHQudG8gJ2FmdGVyJywgZHVyYXRpb25cblx0XHRcdFx0LmRvbmUgZG9uZVxuXHRcdFx0d2hpdGVmYWRlOiAoY3VyciwgbmV4dCwgZG9uZSwgZHVyYXRpb249MTAwMCkgLT4gXG5cdFx0XHRcdGlmIG5vdCBjdXJyIHRoZW4gcmV0dXJuIG5leHQudG8gJ2FmdGVyJywgZHVyYXRpb24vMiwgZG9uZVxuXHRcdFx0XHRjdXJyLnRvKCdhZnRlcicpLnRvKCdiZWZvcmUnLCBkdXJhdGlvbi8yKSBcblx0XHRcdFx0LmRvbmUgbmV4dC50byAnYWZ0ZXInLCBkdXJhdGlvbi8yXG5cdFx0XHRcdC5kb25lIGRvbmVcblx0XHRcdGNyb3NzZmFkZTogKGN1cnIsIG5leHQsIGRvbmUsIGR1cmF0aW9uPTEwMDApIC0+XG5cdFx0XHRcdGlmIGN1cnIgdGhlbiBjdXJyLnRvKCdhZnRlcicpLnRvKCdiZWZvcmUnLCBkdXJhdGlvbiwgZG9uZSlcblx0XHRcdFx0bmV4dC50byAnYWZ0ZXInLCBkdXJhdGlvblxuXHRcdFx0XHQuZG9uZSBkb25lXG5cblx0XHRldmVudHM6ICdjbGljayBhW2hyZWZdJzogKGUpIC0+IEBnZXRMYXVuY2hlcigpLnJlcXVlc3RDbGlja2VkTGluayBlLCBAXG5cblxuXHQjIElOSVRJQUxJWklORyBUSElTIFNFQ1RJT05TIENISUxEUkVOIFNFQ1RJT05TIEFORCBWSUVXUzpcblxuXG5cdFx0aW5pdGlhbGl6ZTogKEBjb25maWcpIC0+IEBjb25maWcubGF1bmNoZXIudHJpZ2dlciAnc2VjdGlvbkFkZGVkJywgQGVsLCBAY29uZmlnXG5cblx0XHRmaW5kQW5kTG9hZDogKG5leHQsIGlzVHJpZ2dlclNlY3Rpb24pIC0+XG5cdFx0XHRcblx0XHRcdGlzTGF1bmNoZXIgPSBub3QgQGNvbmZpZy5sYXVuY2hlclxuXHRcdFx0bGF1bmNoZXIgPSBAZ2V0TGF1bmNoZXIoKVxuXHRcdFx0bWluTG9hZGluZ1RpbWUgPSBpZiBpc1RyaWdnZXJTZWN0aW9uIHRoZW4gbGF1bmNoZXIuY29uZmlnLm1pbkxvYWRpbmdUaW1lIGVsc2UgMFxuXG5cblx0XHRcdCMgcGFyc2UgY29uZmlndXJhdGlvbiBoYXNoIGZvciBsYXVuY2hhYmxlc1xuXHRcdFx0c2VjdGlvbnNMYXVuY2hhYmxlcyA9IHsgc2VjdGlvbnM6W10sIHZpZXdzOltdIH1cblx0XHRcdGZvciBzZWxlY3RvciwgbGF1bmNoYWJsZSBvZiBAY29uZmlnLmxhdW5jaGFibGVzIFxuXHRcdFx0XHR7c2VjdGlvbixsYXVuY2hhYmxlc30gPSBsYXVuY2hhYmxlXG5cdFx0XHRcdHNlY3Rpb25TZWxlY3RvciA9IF8uY29tcGFjdChbQGNvbmZpZy5zZWN0aW9uU2VsZWN0b3Isc2VsZWN0b3JdKS5qb2luICcgJ1xuXHRcdFx0XHRjb25maWcgPSB7IHNlY3Rpb246QCwgc2VsZWN0b3IsIGxhdW5jaGFibGVzLCBzZWN0aW9uU2VsZWN0b3IsIGxhdW5jaGVyIH1cblx0XHRcdFx0c3dpdGNoXG5cdFx0XHRcdFx0d2hlbiBzZWN0aW9uXG5cdFx0XHRcdFx0XHRpZiBfLmlzU3RyaW5nIHNlY3Rpb24gdGhlbiBzZWN0aW9uID0gcmVxdWlyZVBhdGg6c2VjdGlvblxuXHRcdFx0XHRcdFx0c2VjdGlvbnNMYXVuY2hhYmxlcy5zZWN0aW9ucy5wdXNoIF8uZXh0ZW5kKCBjb25maWcsIHR5cGU6J3NlY3Rpb24nLCBleHRlbnNpb246c2VjdGlvbilcdFxuXHRcdFx0XHRcdHdoZW4gbGF1bmNoYWJsZVxuXHRcdFx0XHRcdFx0aWYgXy5pc1N0cmluZyBsYXVuY2hhYmxlIHRoZW4gbGF1bmNoYWJsZSA9IHJlcXVpcmVQYXRoOmxhdW5jaGFibGVcblx0XHRcdFx0XHRcdHNlY3Rpb25zTGF1bmNoYWJsZXMudmlld3MucHVzaCBfLmV4dGVuZCggY29uZmlnLCB0eXBlOid2aWV3JywgbGF1bmNoYWJsZSlcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IgXCJJbnZhbGlkIEhhc2ggVHlwZTogVXNlIGVpdGhlciBhIHN0cmluZyBvciBhIHNlY3Rpb24gaGFzaCBhcyB2YWx1ZSBmb3IgI3tzZWxlY3Rvcn1cIlx0XHRcblxuXHRcdFx0IyBsYXVuY2hlci50cmlnZ2VyICdsYXVuY2hhYmxlc1JlcXVlc3RlZCcsIEBlbCwgc2VjdGlvbnNMYXVuY2hhYmxlc1xuXHRcdFx0XG5cblx0XHRcdCMgaW5pdGlhbHkgcmVuZGVyIHNlY3Rpb25cblx0XHRcdGlmIG5vdCBAY29udGVudHMgdGhlbiBAcmVuZGVyKClcblx0XHRcdFxuXG5cdFx0XHQjIHJlY3Vyc2l2ZWx5IGxhdW5jaCB0aGUgc2VjdGlvbnMgbGF1bmNoYWJsZXMgKHNlY3Rpb25zIGFuZCB2aWV3cylcblx0XHRcdHtzZWN0aW9ucywgdmlld3N9ID0gc2VjdGlvbnNMYXVuY2hhYmxlc1xuXHRcdFx0JGVsID0gQGNvbnRlbnRzLmxhc3QoKS4kZWxcblx0XHRcdEBsb2FkU2VjdGlvbnMgJGVsLCBzZWN0aW9ucywgLT4gXG5cblx0XHRcdFx0QHNlY3Rpb25zLndhaXRGb3IgJ2ZpbmRBbmRMb2FkJywgQCwgLT4gXG5cblx0XHRcdFx0XHRAbG9hZFZpZXdzICRlbCwgdmlld3MsIG1pbkxvYWRpbmdUaW1lLCAtPiBcblxuXHRcdFx0XHRcdFx0IyBsYXVuY2hlci50cmlnZ2VyICd2aWV3c0xvYWRlZCcsIEB2aWV3cy52aWV3cywgQGVsXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIGlzVHJpZ2dlclNlY3Rpb24gaXMgdHJ1ZVxuXHRcdFx0XHRcdFx0XHRAc2VjdGlvbnMud2FpdEZvciAncGxheVRyYW5zaXRpb24nLCBALCAtPlxuXHRcdFx0XHRcdFx0XHRcdEB2aWV3cy5sYXVuY2hJbnN0YW5jZXMgZmFsc2Vcblx0XHRcdFx0XHRcdFx0XHRsYXVuY2hlci50cmlnZ2VyICdzZWN0aW9uUmVhZHknLCBAc2VjdGlvbnMuZ2V0KCdlbCcpLCBAZWxcblx0XHRcdFx0XHRcdFx0XHRuZXh0LmNhbGwgQFxuXHRcdFx0XHRcdFx0ZWxzZSBcblx0XHRcdFx0XHRcdFx0bGF1bmNoZXIudHJpZ2dlciAnc3ViU2VjdGlvbkxvYWRlZCcsIEBjb25maWcuc2VsZWN0b3Jcblx0XHRcdFx0XHRcdFx0aWYgQGN5Y2xlIGFuZCBAY3ljbGUubGF1bmNoIHRoZW4gQGN5Y2xlLmxhdW5jaC5jYWxsIEBcblx0XHRcdFx0XHRcdFx0bmV4dC5jYWxsIEBcblx0XHRcblxuXHQjIEFERElORyBBTkQgU1dJVENISU5HIEJFVFdFRU4gU0VDVElPTiBDT05URU5UUzpcblxuXG5cdFx0cmVuZGVyOiAocGFnZSwgJGNvbnRleHQpIC0+XG5cblx0XHRcdGh0bWwgPSBpZiBwYWdlIHRoZW4gcGFnZS5zeW5jKEBjb25maWcuc2VsZWN0b3IsJGNvbnRleHQpLmh0bWwyKClcblx0XHRcdGVsc2UgQCRlbC5odG1sKClcblxuXHRcdFx0bGF1bmNoZXIgPSBAY29uZmlnLmxhdW5jaGVyIG9yIEBcblx0XHRcdHBhZ2UgPz0gbGF1bmNoZXIuY3VyclBhZ2Ugb3IgbGF1bmNoZXIubmV4dFBhZ2VcblxuXHRcdFx0XG5cdFx0XHRpc0xhdW5jaGVyID0gbm90IEBjb25maWcubGF1bmNoZXJcblx0XHRcdGlzSW5pdGlhbENvbnRlbnQgPSBub3QgQGNvbnRlbnRzXG5cdFx0XHRpZiBpc0luaXRpYWxDb250ZW50IGFuZCBub3QgaXNMYXVuY2hlciB0aGVuIEAkZWwuZW1wdHkoKVxuXG5cdFx0XHQjIGNyZWF0ZSBuZXcgY29udGVudCBmb3Igc2VjdGlvblxuXHRcdFx0c2VjdGlvbkNvbnRlbnQgPSBuZXcgU2VjdGlvbkNvbnRlbnRcblx0XHRcdFx0c2VjdGlvbjogQCBcblx0XHRcdFx0Y2xhc3NOYW1lOiBsYXVuY2hlci5jb25maWcuc2VjdGlvbkNvbnRlbnRDbGFzc05hbWVcblx0XHRcdFx0aHRtbDogaHRtbFxuXHRcdFx0XHRwYWdlOiBwYWdlXG5cdFx0XHRcblx0XHRcdCMgcmVzZXQgY29udGVudCdzIHRyYW5zaXRpb24gc3RhdGVcblx0XHRcdHNlY3Rpb25Db250ZW50LnRvKGlmIEBjb250ZW50cyB0aGVuICdiZWZvcmUnIGVsc2UgJ2ZpbmFsJylcblx0XHRcdFxuXHRcdFx0aWYgaXNMYXVuY2hlclxuXHRcdFx0XHRzZWN0aW9uQ29udGVudC5zZXRFbGVtZW50KEBlbClcblx0XHRcdGVsc2Vcblx0XHRcdFx0QCRlbC5hcHBlbmQoc2VjdGlvbkNvbnRlbnQuJGVsKVxuXHRcdFx0XG5cdFx0XHRpZiBpc0luaXRpYWxDb250ZW50IHRoZW4gQHJlc2V0Q29udGVudChzZWN0aW9uQ29udGVudCkgZWxzZSBAY29udGVudHMucHVzaChzZWN0aW9uQ29udGVudClcblx0XHRcdEBcblxuXHRcdHJlc2V0Q29udGVudDogKHNlY3Rpb25Db250ZW50KSAtPlxuXG5cdFx0XHRAY29udGVudHMgPSBuZXcgVmlld0NvbGxlY3Rpb24gc2VjdGlvbkNvbnRlbnRcblx0XHRcblx0XHRwbGF5VHJhbnNpdGlvbjogKG5leHQpLT5cblxuXHRcdFx0Y3VyckNvbnRlbnQgPSBpZiBAY29udGVudHMubGVuZ3RoID4gMSB0aGVuIEBjb250ZW50cy5maXJzdCgpIGVsc2UgbnVsbFxuXHRcdFx0bmV4dENvbnRlbnQgPSBAY29udGVudHMubGFzdCgpXG5cdFx0XHRzZWN0aW9uID0gQFxuXHRcdFx0ZG9uZSA9IC0+IFxuXHRcdFx0XHRpZiBjdXJyQ29udGVudCBcblx0XHRcdFx0XHRzZWN0aW9uLnVubG9hZExhdW5jaGFibGVzIC0+IGN1cnJDb250ZW50LnJlbW92ZSgpXG5cdFx0XHRcdHNlY3Rpb24ubGF1bmNoVmlld3MoKVxuXHRcdFx0XHRzZWN0aW9uLnJlc2V0Q29udGVudCBuZXh0Q29udGVudC50byAnZmluYWwnXG5cdFx0XHRcdG5leHQuY2FsbCBzZWN0aW9uIFxuXHRcdFx0XG5cdFx0XHR0cmFuc2l0aW9uRm5jID0gaWYgXy5pc1N0cmluZyBAdHJhbnNpdGlvbiB0aGVuIEB0cmFuc2l0aW9uUHJlc2V0c1tAdHJhbnNpdGlvbl0gZWxzZSBAdHJhbnNpdGlvbiBvciBAdHJhbnNpdGlvblByZXNldHNbJ2N1dCddXG5cdFx0XHR0cmFuc2l0aW9uRm5jLmNhbGwgQCwgY3VyckNvbnRlbnQsIG5leHRDb250ZW50LCBkb25lLCBAY29uZmlnLmR1cmF0aW9uXHRcdFxuXG5cdFx0bGF1bmNoVmlld3M6IChsYXVuY2hTZWN0aW9uc1ZpZXdzID0gdHJ1ZSkgLT5cblxuXHRcdFx0QHZpZXdzLmxhdW5jaEluc3RhbmNlcygpXG5cdFx0XHRpZiBsYXVuY2hTZWN0aW9uc1ZpZXdzIHRoZW4gQHNlY3Rpb25zLmVhY2ggKHNlY3Rpb24pIC0+IHNlY3Rpb24ubGF1bmNoVmlld3MoKVxuXG5cdFx0dW5sb2FkTGF1bmNoYWJsZXM6IChuZXh0KSAtPlx0XG5cblx0XHRcdHNlY3Rpb25Db250ZW50ID0gQGNvbnRlbnRzLmZpcnN0KClcblx0XHRcdHNlY3Rpb25Db250ZW50LnZpZXdzLnVubG9hZEluc3RhbmNlcyBALCAtPlxuXHRcdFx0XHRzZWN0aW9uQ29udGVudC5zZWN0aW9ucy53YWl0Rm9yICd1bmxvYWRMYXVuY2hhYmxlcycsIEAsIG5leHRcblxuXG5cdCMgTE9BRElORyBTRUNUSU9OUywgVklFV1MgQU5EIEFTU0VUUzpcblxuXG5cdFx0bG9hZFNlY3Rpb25zOiAoJGVsLCBzZWN0aW9ucywgbmV4dCkgLT5cblxuXHRcdFx0ZGV0ZWN0ZWRTZWN0aW9ucyA9IF8uZmlsdGVyIHNlY3Rpb25zLCAoc2VjdGlvbikgLT4gJGVsLmlzIFwiOmhhcygje3NlY3Rpb24uc2VsZWN0b3J9KVwiXG5cblx0XHRcdHJlcXVpcmVkU2VjdGlvbnMgPSBfLmZpbHRlciBkZXRlY3RlZFNlY3Rpb25zLCAoc2VjdGlvbikgLT4gIF8uaXNTdHJpbmcgc2VjdGlvbi5yZXF1aXJlUGF0aFxuXG5cdFx0XHRsYXVuY2hlciA9IEBjb25maWcubGF1bmNoZXIgb3IgQFxuXHRcdFx0XHRcblx0XHRcdEBzZWN0aW9ucyA9IEBjb250ZW50cy5sYXN0KCkuc2VjdGlvbnMgPSBuZXcgVmlld0NvbGxlY3Rpb24oKS5yZXNldCggXG5cdFx0XHRcdGZvciBzZWN0aW9uIGluIGRldGVjdGVkU2VjdGlvbnNcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQjIGNvbnNlcnZlIHNlY3Rpb24gcHJvcGVydGllc1xuXHRcdFx0XHRcdHt0cmFuc2l0aW9uU3RhdGVzfSA9IHNlY3Rpb24uZXh0ZW5zaW9uXG5cdFx0XHRcdFx0aWYgdHJhbnNpdGlvblN0YXRlc1xuXHRcdFx0XHRcdFx0dHJhbnNpdGlvblN0YXRlcyA9IF8uZXh0ZW5kIHt9LCB0cmFuc2l0aW9uU3RhdGVzXG5cdFx0XHRcdFx0XHRkZWxldGUgc2VjdGlvbi5leHRlbnNpb24udHJhbnNpdGlvblN0YXRlc1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdCMgaW5zdGFudGlhdGUgZXh0ZW5kZWQgc2VjdGlvbiBcblx0XHRcdFx0XHRFeHRlbmRlZFNlY3Rpb24gPSBleHBvcnRzLlNlY3Rpb24uZXh0ZW5kKCBzZWN0aW9uLmV4dGVuc2lvbiApXG5cdFx0XHRcdFx0c2VjdGlvbiA9IG5ldyBFeHRlbmRlZFNlY3Rpb24oXG5cdFx0XHRcdFx0XHRlbDogJGVsLmZpbmQgc2VjdGlvbi5zZWxlY3RvclxuXHRcdFx0XHRcdFx0bGF1bmNoYWJsZXM6IHNlY3Rpb24ubGF1bmNoYWJsZXNcblx0XHRcdFx0XHRcdHNlbGVjdG9yOiBzZWN0aW9uLnNlbGVjdG9yXG5cdFx0XHRcdFx0XHRzZWN0aW9uU2VsZWN0b3I6IHNlY3Rpb24uc2VjdGlvblNlbGVjdG9yXG5cdFx0XHRcdFx0XHRzZWN0aW9uOiBzZWN0aW9uLnNlY3Rpb25cblx0XHRcdFx0XHRcdGxhdW5jaGVyOiBsYXVuY2hlclxuXHRcdFx0XHRcdFx0aW1hZ2VzVG9Mb2FkOiBsYXVuY2hlci5jb25maWcuaW1hZ2VzVG9Mb2FkXG5cdFx0XHRcdFx0KVxuXG5cdFx0XHRcdFx0IyBleHRlbmQgc2VjdGlvbiB3aXRoIGNvbnNlcnZlZCBwcm9wZXJ0aWVzXG5cdFx0XHRcdFx0aWYgdHJhbnNpdGlvblN0YXRlc1xuXHRcdFx0XHRcdCBcdF8uZXh0ZW5kIHNlY3Rpb24udHJhbnNpdGlvblN0YXRlcywgdHJhbnNpdGlvblN0YXRlcyBcblxuXHRcdFx0XHRcdHNlY3Rpb25cblx0XHRcdClcblx0XHRcdG5leHQuY2FsbCBAXG5cblx0XHRcblx0XHRsb2FkVmlld3M6ICgkZWwsIHZpZXdzLCBtaW5Mb2FkaW5nVGltZSwgbmV4dCkgLT5cblx0XHRcdFxuXHRcdFx0QHZpZXdzID0gQGNvbnRlbnRzLmxhc3QoKS52aWV3cyA9IG5ldyBWaWV3TG9hZGVyKClcblx0XHRcdEB2aWV3cy5maW5kQW5kTG9hZCB2aWV3cywgJGVsLCBALCBtaW5Mb2FkaW5nVGltZSwgLT5cblx0XHRcdFx0c2VjdGlvbiA9IEBcblx0XHRcdFx0QGxvYWRDb250ZW50QXNzZXRzIC0+IG5leHQuY2FsbCBzZWN0aW9uXG5cdFx0XG5cdFx0bG9hZENvbnRlbnRBc3NldHM6IChuZXh0KSAtPlxuXG5cdFx0XHQjIGlmIEBjb250ZW50cyB0aGVuIEBjb250ZW50cy5sYXN0KCkuJChAY29uZmlnLmltYWdlc1RvTG9hZCkuaW1hZ2VzTG9hZGVkIG5leHQgXG5cdFx0XHQjIGVsc2UgbmV4dC5jYWxsIEBcblx0XHRcdG5leHQuY2FsbCBAXG5cblxuXHQjIFJFTE9BRElORyBTRUNUSU9OUyBBTkQgVVBEQVRJTkcgVklFVyBJTlNUQU5DRVNcblxuXG5cdFx0cmVsb2FkOiAocGFnZSwgbmV4dCwgY29udGV4dCkgLT5cblxuXHRcdFx0cmV0dXJuIEBmaW5kQW5kTG9hZCggbmV4dCwgdHJ1ZSApIGlmIG5vdCBAZ2V0TGF1bmNoZXIoKS5jdXJyUGFnZVxuXG5cdFx0XHRAcmVsb2FkU2VjdGlvbnMgcGFnZSwgLT5cblx0XHRcdFx0QHZpZXdzLnVwZGF0ZUluc3RhbmNlcyBwYWdlLCBAJGVsXG5cdFx0XHRcdEBzZWN0aW9ucy53YWl0Rm9yICdwbGF5VHJhbnNpdGlvbicsIGNvbnRleHQsIG5leHRcblx0XHRcdFxuXHRcdHJlbG9hZFNlY3Rpb25zOiAocGFnZSwgbmV4dCkgLT5cblxuXHRcdFx0JGVsID0gQCRlbFxuXHRcdFx0QHNlY3Rpb25zLmVhY2ggKHNlY3Rpb24pIC0+IHNlY3Rpb24ucmVuZGVyKHBhZ2UsICRlbClcblx0XHRcdEBzZWN0aW9ucy53YWl0Rm9yICdmaW5kQW5kTG9hZCcsIEAsIG5leHQsIFt0cnVlXVxuXG5cblx0IyBHRVRURVIgTUVUSE9EU1xuXG5cdFx0Z2V0TGF1bmNoZXI6IC0+XG5cblx0XHRcdEBjb25maWcubGF1bmNoZXIgb3IgQFxuXG5MYXVuY2hlciA9IGV4cG9ydHMuU2VjdGlvbi5leHRlbmRcblx0XG5cdGN1cnJQYWdlOiBudWxsXG5cblx0bmV4dFBhZ2U6IG51bGxcblxuXHRwYWdlczogbnVsbFxuXG5cdHJvdXRlcjogbnVsbFxuXG5cdGxvYWRpbmc6IGZhbHNlXG5cblx0Y29uZmlnOlxuXG5cdFx0bWF4VHJhbnNpdGlvblRpbWU6IDEwMDAwXG5cdFx0cm9vdDogJydcblx0XHRsb2FkUm9vdDogJydcblx0XHRwdXNoU3RhdGU6IG9uXG5cdFx0c2VjdGlvbkNvbnRlbnRDbGFzc05hbWU6ICdzZWN0aW9uLWNvbnRlbnQnXG5cdFx0aW1hZ2VzVG9Mb2FkOiAnaW1nOm5vdCguZG9udC1wcmVsb2FkKSdcblx0XHRtaW5Mb2FkaW5nVGltZTogMFxuXG5cdGluaXRpYWxpemU6IChjb25maWcpIC0+XG5cblx0XHRAY29uZmlnID0gXy5leHRlbmQgQGNvbmZpZywgY29uZmlnLCBzZWN0aW9uU2VsZWN0b3I6ICcnXG5cblx0c3RhcnQ6IC0+XG5cblx0XHQjIGluc3RhbnRpYXRlIGJhY2tib25lIHJvdXRlciBhbmQgc3RhcnQgaGlzdG9yeVxuXHRcdGxhdW5jaGVyID0gQFxuXHRcdFJvdXRlciA9IEJhY2tib25lLlJvdXRlci5leHRlbmRcdFx0XHRcdFxuXHRcdFx0cm91dGVzOiAnJzoncmVxdWVzdCcsICcqcGF0aCc6J3JlcXVlc3QnXG5cdFx0XHRyZXF1ZXN0OiAoaHJlZikgLT4gbGF1bmNoZXIucmVxdWVzdFBhZ2UoaHJlZiwgJ25hdmlnYXRlZCcpXG5cdFx0QHJvdXRlciA9IG5ldyBSb3V0ZXIoKVx0XG5cdFx0QmFja2JvbmUuaGlzdG9yeS5zdGFydCBwdXNoU3RhdGU6IEBjb25maWcucHVzaFN0YXRlLCByb290OiBAY29uZmlnLnJvb3QsIHNpbGVudDogb25cblx0XHRAY29uZmlnLmxvYWRSb290ID0gbG9jYXRpb24ucHJvdG9jb2wgKyAnLy8nICsgbG9jYXRpb24uaG9zdCArIEBjb25maWcucm9vdFxuXHRcdEB0cmlnZ2VyICdoaXN0b3J5U3RhcnRlZCcsIEByb3V0ZXJcblxuXHRcdGhyZWYgPSBCYWNrYm9uZS5oaXN0b3J5LmZyYWdtZW50XG5cdFx0QHBhZ2VzID0gbmV3IFBhZ2VDb2xsZWN0aW9uIEBjb25maWcucGFnZXMsIFxuXHRcdFx0cm9vdDogQGNvbmZpZy5yb290IFxuXHRcdFx0bG9hZFJvb3Q6IEBjb25maWcubG9hZFJvb3QgXG5cdFx0XHRpbml0aWFsSHJlZjogaHJlZlxuXHRcdFx0aW5pdGlhbEh0bWw6ICQoJ2h0bWwnKS5odG1sKClcblx0XHRAcmVxdWVzdFBhZ2UoaHJlZiwgJ2NhbGxlZCcpXG5cdFx0QFxuXG5cdHJlcXVlc3RDbGlja2VkTGluazogKGUsc2VjdGlvbiA9IEApIC0+XG5cblx0XHRlLnN0b3BQcm9wYWdhdGlvbigpXG5cdFx0JGEgPSAkIGUuY3VycmVudFRhcmdldFxuXHRcdGhyZWYgPSBwcm9wOiAkYS5wcm9wKCdocmVmJyksIGF0dHI6ICRhLmF0dHIoJ2hyZWYnKVxuXHRcdHtsb2FkUm9vdH0gPSBAY29uZmlnXG5cdFx0aWYgaHJlZi5wcm9wLnNsaWNlKDAsIGxvYWRSb290Lmxlbmd0aCkgaXMgbG9hZFJvb3QgIFxuXHRcdFx0aWYgZS5wcmV2ZW50RGVmYXVsdCB0aGVuIGUucHJldmVudERlZmF1bHQoKSBlbHNlIGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuXHRcdFx0QmFja2JvbmUuaGlzdG9yeS5uYXZpZ2F0ZSggaHJlZi5hdHRyLCBzaWxlbnQ6IHllcykgaWYgQHJlcXVlc3RQYWdlIGhyZWYuYXR0ciwgJ2xpbmtlZCcsIHtzZWN0aW9ufSBcblxuXHRnZXRTZWN0aW9uVG9SZWZyZXNoOiAodHlwZSwgb3B0cyktPlxuXHRcdFxuXHRcdHtzZWN0aW9uLGhyZWZ9ID0gb3B0c1xuXHRcdHtnZXRTZWN0aW9uQnlIcmVmQ2hhbmdlfSA9IEBjb25maWdcblxuXHRcdHN3aXRjaCB0eXBlXG5cdFx0XHRcblx0XHRcdCMgY2FsbGVkIOKAkyBsYXVuY2hlciBzZWN0aW9uIGdldHMgaW5pdGlhbGl6ZWRcblx0XHRcdHdoZW4gJ2NhbGxlZCdcblx0XHRcdFx0QFxuXHRcdFx0XG5cdFx0XHQjIGxpbmtlZCDigJMgYSBzdWItc2VjdGlvbiB0byBmZWVkIHdpdGggY29udGVudCBpcyBuZWVkZWQ7IG90aGVyd2lzZSB0aGUgbGF1bmNoZXIgc2VjdGlvbiBpcyB1c2VkXG5cdFx0XHR3aGVuICdsaW5rZWQnXG5cdFx0XHRcdGlmIHNlY3Rpb24gYW5kIHNlY3Rpb24uc2VjdGlvbnMubGVuZ3RoID4gMCB0aGVuIHNlY3Rpb24gZWxzZSBAXG5cdFx0XHRcblx0XHRcdCMgbmF2aWdhdGVkIOKAkyBhIHNlY3Rpb24gaXMgdG8gYmUgZGV0ZXJtaW5lZCBieSBzb3VyY2UgYW5kIHRhcmdldCBocmVmc1xuXHRcdFx0d2hlbiAnbmF2aWdhdGVkJ1xuXHRcdFx0XHRpZiBnZXRTZWN0aW9uQnlIcmVmQ2hhbmdlIHRoZW4gZ2V0U2VjdGlvbkJ5SHJlZkNoYW5nZS5jYWxsKEAsIEBjdXJyUGFnZS5nZXQoJ2hyZWYnKSwgaHJlZikgZWxzZSBAXG5cdFx0XHRcblx0XHRcdGVsc2UgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHJlcXVlc3QgdHlwZScpXG5cblx0cmVxdWVzdFBhZ2U6IChocmVmLCB0eXBlLCBvcHRzID0ge30gKSAtPiAjIGJ5Um91dGUgPSBmYWxzZSwgYWN0aXZlU2VjdGlvbiA9IG51bGwpIC0+XG5cblx0XHRyZXR1cm4gZmFsc2UgaWYgQGxvYWRpbmcgYW5kIEBsb2FkaW5nLnN0YXRlKCkgaXMgJ3BlbmRpbmcnIG9yIEBjdXJyUGFnZT8uZ2V0KCdocmVmJykgaXMgaHJlZlxuXG5cdFx0IyBkZXRlcm1pbmUgc2VjdGlvbiByZXNwb25zaWJsZSBmb3IgdGhlIGRpc3BsYXkgb2YgbmV3IGNvbnRlbnRcblx0XHRzZWN0aW9uID0gQGdldFNlY3Rpb25Ub1JlZnJlc2goIHR5cGUsIF8uZXh0ZW5kKG9wdHMse2hyZWZ9KSApXG5cblx0XHQjIHJlcXVlc3QgdGhlIHBhZ2UgYW5kIHJlcGxhY2UgdGhlIHRhcmdldCBzZWN0aW9uJ3MgY29udGVudFxuXHRcdGxhdW5jaGVyID0gQFxuXHRcdEB0cmlnZ2VyICdwYWdlUmVxdWVzdGVkJywge2hyZWYsIHR5cGUsIHNlY3Rpb24sIHNlY3Rpb25zOnNlY3Rpb24/LnNlY3Rpb25zfVxuXHRcdEBwYWdlcy5ieUhyZWYgaHJlZiwgQCwgKHBhZ2UpIC0+IFxuXG5cdFx0XHRAdHJpZ2dlciAncGFnZUZldGNoZWQnLCBwYWdlXHRcdFx0XHRcblx0XHRcdGxvYWRpbmcgPSBAbG9hZGluZyA9IG5ldyAkLkRlZmVycmVkKClcdFxuXG5cdFx0XHRAbmV4dFBhZ2UgPSBwYWdlXG5cblx0XHRcdHNlY3Rpb24ucmVsb2FkKCBwYWdlLCAtPlxuXHRcdFx0XHRcblx0XHRcdFx0QG5leHRQYWdlID0gbnVsbFxuXHRcdFx0XHRAY3VyclBhZ2UgPSBwYWdlXG5cdFx0XHRcdEB0cmlnZ2VyICd0cmFuc2l0aW9uRG9uZScsIEBlbFxuXHRcdFx0XHRsb2FkaW5nLnJlc29sdmUgbGF1bmNoZXJcblx0XHRcdFxuXHRcdFx0LEApXHRcblx0XHRcblx0XHRyZXR1cm4gdHJ1ZVxuXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=