(function(){

  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   */
  // Inspired by base2 and Prototype
  // Modified to return Class instead of attaching it to global object [TD]
  var Class = (function(){
    var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = function(){}; //Was: this.Class = function(){};
    
    // Create a new Class that inherits from this class
    Class.extend = function(prop) {
      var _super = this.prototype;
      
      // Instantiate a base class (but only create the instance,
      // don't run the init constructor)
      initializing = true;
      var prototype = new this();
      initializing = false;
      
      // Copy the properties over onto the new prototype
      for (var name in prop) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof prop[name] == "function" && 
          typeof _super[name] == "function" && fnTest.test(prop[name]) ?
          (function(name, fn){
            return function() {
              var tmp = this._super;
              
              // Add a new ._super() method that is the same method
              // but on the super-class
              this._super = _super[name];
              
              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);        
              this._super = tmp;
              
              return ret;
            };
          })(name, prop[name]) :
          prop[name];
      }
      
      // The dummy class constructor
      function Class() {
        // All construction is actually done in the init method
        if ( !initializing && this.init )
          this.init.apply(this, arguments);
      }
      
      // Populate our constructed prototype object
      Class.prototype = prototype;
      
      // Enforce the constructor to be what we expect
      Class.constructor = Class;

      // And make this class extendable
      Class.extend = arguments.callee;
      
      return Class;
    };

    return Class;
  })();




  /* Base: Simple base class with getter/setter and event-ish functionality
   *
   * var o = new Base();
   * o.listen('foo changed', function(ov, nv){ log('Foo was changed from "'+ov+'" to "'+nv+'"'); });
   * o.set('foo', 'bar'); //Logs 'Foo was changed from "" to "bar"'
   * o.get('foo');
   * o.listen('touch', function(){ alert("Can't touch this"); });
   * o.fire('touch'); // Alerts */
  Base = Class.extend({

    init: function(){
      this.b = this.broadcaster = new Broadcaster();
      this.b.defaultScope = this;
      this.values = {}; //for getValue/setValue
      this.afterInitialize && this.afterInitialize();
    },

    listen: function(){
      return this.b.listen.apply(this.b, arguments);
    },
    fire: function(){
      return this.b.fire.apply(this.b, arguments);
    },

    //Forward all messages to another broadcaster. Will insert this object
    //as the first parameter to upstream listeners. If a namespace is provided,
    //messages will be altered to include this.
    //
    //a.bubble(b);
    //b.listen('foo', function('foo', a, *args){});
    //a.bubble(c, 'a'); //Namespaced
    //c.listen('foo', function('a:foo', a, *args){});
    bubble: function(broadcaster, namespace){
      if (broadcaster.broadcaster) broadcaster = broadcaster.broadcaster; //...yeah
      var source = this;
      this.listen('*', function(/* message, *args */){
        var args = Array.prototype.slice.call(arguments);
        if (namespace) args[0] = namespace + ':' + args[0];
        args.splice(1, 0, source);
        broadcaster.fire.apply(broadcaster, args);
      });
    },

    //Get an attribute. Will use getValueByFunction if a function
    //exists, otherwise will use getValue. If both methods return undefined,
    //attributeNotFound(name) is called and its value is returned.
    get: function(name){
      var value = this.getValueByFunction(name);
      if (typeof value == 'undefined') value = this.getValue(name);
      return typeof value == 'undefined' ? this.attributeNotFound(name) : value;
    },

    //Set an attribute. Will use setValueByFunction if a function
    //exists, otherwise will use setValue. Returns the new value as it's returned
    //by get(name).
    //
    //Fires a "value changed" message, passing the new and old
    //value as parameters.
    //
    //Given a name "foo", fires a "foo value changed" message, passing new and
    //old values.
    set: function(name, value){
      var oldValue = this.get(name);
      this.setValueByFunction(name, value) || this.setValue(name, value);
      var newValue = this.get(name);
      this.fire('value changed', name, newValue, oldValue);
      this.fire(name+' value changed', newValue, oldValue);
      return newValue;
    },

    //Get a value stored in the internal(-ish) value store
    getValue: function(name){
      return this.values[name];
    },
    //Store or change a value in the internal value store
    setValue: function(name, value){
      this.values[name] = value;
    },

    //This method is called when get('foo') fails to yield a value other than
    //undefined. The default implementation of attributeNotFound is to simply
    //return undefined.
    attributeNotFound: function(name){
      return undefined;
    },

    //Given a name "foo_bar_baz", will look for a method named
    //getFooBarBazValue and return whatever that returns. If the method
    //doesn't exist, undefined is returned.
    getValueByFunction: function(name){
      var fn = this['get'+Base.camelize(name)+'Value'];
      return fn && fn.call(this);
    },
    //Given a name "foo_bar_baz", will look for a method named
    //setFooBarBazValue and call that with value as the only argument.
    //Returns true if the method exists and false otherwise.
    setValueByFunction: function(name, value){
      var fn = this['set'+Base.camelize(name)+'Value'];
      if (fn) { fn.call(this, value); return true; }
      else { return false; }
    }

  });


  Base.camelize = function(str){
    str = str.replace(/[-_]+(.?)/g, function(s,c){
      return c ? c.toUpperCase() : '';
    });
    return str.slice(0,1).toUpperCase() + str.slice(1);
  };


  Base.Class = Class;



  /* ElementBase: A simple DOM element wrapper which inherits Base and extends
   * its attribute getter/setter functionality to be able to fetch values
   * from inside the element based on class names.
   * Depends on Prototype */

  ElementBase = Base.extend({

    init: function(element){
      this.element = element;
      this._super();
    },

    //Override getValue to use getValueByElement if possible
    getValue: function(name){
      return this.getValueByElement(name) || this._super(name);
    },
    //Override to use setValueByElement if possible
    setValue: function(name, value){
      this.setValueByElement(name, value) || this._super(name, value);
    },

    //Get a value from inside the wrapped element. Returns undefined if no container
    //element is found.
    getValueByElement: function(name){
      var el = this.getElement(name);
      return el && this.extractValueFromElement(el, name);
    },
    //Set the value inside the wrapped element. Returns true if the container
    //element is found, false otherwise.
    setValueByElement: function(name, value){
      var el = this.getElement(name);
      if(el) { this.insertValueInElement(el, value); return true; }
      else { return false; }
    },

    //Find a container element matching the provided name.
    getElement: function(name){
      return this.getElementFromFunction(name) || this.getElementFromSelector(name);
    },
    //Given a name "foo_bar_baz", looks for a method named getFooBarBazElement
    //and returns whatever that returns; otherwise returns undefined.
    getElementFromFunction: function(name){
      var fn = this['get'+Base.camelize(name)+'Element'];
      return fn && fn.call(this);
    },
    //Look up a container element from the supplied name. The default
    //implementation is to look for a child of the wrapped element that
    //matches the selector "."+name. E.g. ".foo_bar_baz". Returns undefined
    //if no element is found.
    getElementFromSelector: function(name){
      return ElementBase.getElementFromSelector(this.element, '.'+name);
    },

    //Extracts the value from a container element. Default implementation
    //is to use innerHTML.
    extractValueFromElement: function(el){
      return el.innerHTML;
    },
    //Inserts value into a container element. Default implementation is to
    //use innerHTML.
    insertValueInElement: function(el, value){
      el.innerHTML = value;
    }

  });

  ElementBase.getElementFromSelector = function(parentElement, selector){
    return parentElement.down(selector);
  };


  //Export to global
  this.Base = Base;
  this.ElementBase = ElementBase;


})();
