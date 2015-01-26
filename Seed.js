(function(name) {

  var Seed = window[name] = function() {
    this.init.apply(this, arguments);
  };

  var extend = function(o, p) {
    for (var i in p) {
      o[i] = p[i];
    }
    return o;
  };

  var clone = function(o) {
    var r = {};
    for (var i in o) r[i] = o[i];
    return r;
  };

  Seed.prototype = {
    init : function(o) {
      this.$subs = []; // sub-instances
      this.$listeners = {}; // { eventName : [fn*] }
      this.$observers = []; // [sub*]

      if (this.isMediator) {
        this.$responses = {};
        if (this.respondsTo) {
          for (var i in this.respondsTo) {
            this.$responses[i] = this.respondsTo[i];
          }
        }

        this.mediator = this;
      }

      if (o) {
        if (o.mediator && !this.isMediator) this.mediator = o.mediator;
        if (o.super) this.super = o.super;
      }

      this.$setOptions(o || {});
      if (this.tpl) {
        this.el = r.toDOM(typeof(this.tpl) === 'function' ? this.tpl() : this.tpl, this);
        if (o && o.parentEl) o.parentEl.appendChild(this.el);
      }
    },

    query : function(query) {
      var direct = this.mediator.respondsTo[query];
      if (direct) {
        return direct.apply(this.mediator, arguments);
      }
      else {
        for (var i in this.mediator.respondsTo) {
          if (i[i.length - 1] === '*') {
            if (i.slice(0, i.length - 1) === query.slice(0, i.length - 1)) {
              return this.mediator.respondsTo[i].apply(this.mediator, arguments);
            }
          }
        }
      }

      if (this.mediator.responds) {
        return this.mediator.responds(query);
      }

      throw 'query : ' + query + ' not found';
    },

    destroy : function() {
      this.detachObservers(); // detaches all events
      for (var i = -1, n = this.$subs.length; ++i < n; ) this.$subs[i].destroy();
      if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);

      this.fire('destroy');
    },

    fire : function(event) {
      var events = this.$listeners[event];
      var a = Array.prototype.slice.call(arguments);
      a.shift();

      if (events) {
        for (var i = events.length; i--; ) if (events[i]) events[i].apply(this, a); // last listener called first
        return true; // at least one event has been fired
      }
      else {
        return false; // no events fired
      }
    },

    detachObservers : function() { // detaches all events that this instance has subscribed to
      for (var i = this.$observers.length; i--; ) this.$observers[i].un();
      this.$observers = [];
    },

    on : function(event, f, scope) {
      var split = event.split(/ /g),
          observers = [],
          self = this;

      for (var i = -1, n = split.length; ++i < n; ) {
        var event = split[i];
        if (!this.$listeners[event]) this.$listeners[event] = [];
        this.$listeners[event].push(f);

        var observer = {
          un : function() {
            self.$unbind(event, f);
          }
        };
        observers.push(observer);
        scope && scope.$observers && scope.$observers.push(observer);
      }

      return {
        un : function() {
          for (var i = -1, n = observers.length; ++i < n; ) observers[i].un();
        }
      };
    },

    $unbind : function(event, f) {
      for (var i = this.$listeners[event].length; i--; ) {
        if (this.$listeners[event][i] === f) this.$listeners[event].splice(i, 1);
      }
    },
    
    $setOptions : function(o) {
      if (typeof(__log) !== 'undefined') console.log('LOG', o);
      if (this.options) {
        if (typeof(this.options) === 'function') this.options = this.options();
        for (var i in this.options) {
          if (typeof(o[i]) !== 'undefined') this[i] = o[i];
          else this[i] = this.options[i];
        }
      }
    },

    //=== retro
    sub : function() {
      return this.create.apply(this, arguments);
    },
    //---

    create : function(C, o, as) {
      if (!o) o = {};
      o.mediator = this.isMediator ? this : this.mediator;
      o.super = this;

      C = new C(o);
      this.$subs.push(C);
      if (!C.isMediator && C.respondsTo) {
        for (var i in C.respondsTo) {
          C.mediator.$responses[i] = function() {
            return C.respondsTo.apply(C, arguments);
          };
        }
      }
      if (as) this[as] = C;
      return (C);
    },

    show : function() {
      this.el.style.display = 'block';

      this.fire('show');
    },

    hide : function() {
      this.el.style.display = 'none';

      this.fire('hide');
    }

  };

  var pm = function(C, obj) {
    for (var i in obj) {
      if (i[0] === '+' || i[0] === '-') {
        (function() {
          var pmMethod = C.prototype[i], method = C.prototype[i.slice(1, i.length)], before, after;
          if (i[0] === '+') {
            before = method;
            after = pmMethod;
          }
          else {
            before = pmMethod;
            after = method;
          }

          var res;
          if (typeof(before) === 'function' && typeof(after) === 'function') {
            C.prototype[i.slice(1, i.length)] = function() {
              before.apply(this, arguments);
              return after.apply(this, arguments);
            };
          }
          else if (typeof(before) === 'function' || typeof(after) === 'function') {
            //throw 'Should not happen';
          }
          else {
            C.prototype[i.slice(1, i.length)] = extend(clone(before), after);
          }
        })();
      }
    }
  };

  Seed.augment = function(o) {
    for (var i in o) this.prototype[i] = o[i];
    pm(this, o);
  };

  Seed.extend = function(obj) {
    var C = function(o) {
      if (typeof(o) !== 'boolean' || o !== false) this.init.apply(this, arguments);
    };

    C.prototype = extend(new this(false), obj);
    
    pm(C, obj); // handling of +- methods

    C.extend = obj.extend || this.extend;
    C.augment = obj.augment || this.augment;
    return C;
  };

})('Seed');