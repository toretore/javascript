TestCase("BroadcasterTest", {

  setUp: function(){
    this.b = new Broadcaster();
  },

  'test should be able to add listeners for any message': function(){
    var counter = 0;
    this.b.listen('foo', function(){ counter++; });
    this.b.listen('bar', function(){ counter++; });
    this.b.listen("there's always money in the banana stand", function(){ counter++; });
    this.b.fire('foo');
    assertEquals(1, counter);
    this.b.fire('foo');
    this.b.fire('foo');
    assertEquals(3, counter);
    this.b.fire('bar');
    this.b.fire('bar');
    assertEquals(5, counter);
    this.b.fire("there's always money in the banana stand");
    assertEquals(6, counter);
  },
  
  'test should forward all arguments to fire to listener function': function(){
    var args;
    this.b.listen('foo', function(){ args = Array.prototype.slice.call(arguments); });
    this.b.fire('foo', 1, 'two', 3.14);
    assertEquals([1, 'two', 3.14], args);
  },

  'test should be able to specify scope/this for listener function': function(){
    var o = {};
    this.b.listen('foo', function(){ this.foo = 'bar'; }, o);
    this.b.fire('foo');
    assertEquals('bar', o.foo);
  },

  'test should be able to fire messages that dont have listeners': function(){
    this.b.fire('cirsumverent');
    this.b.fire('ummagumma');
  },

  'test should be able to remove a specific listener for a specific message': function(){
    var counter = 0,
        fn1 = function(){ counter++; },
        fn2 = function(){ counter++; };
    this.b.listen('foo', fn1);
    this.b.listen('foo', fn2);
    this.b.listen('bar', fn1);
    this.b.fire('foo');
    assertEquals(2, counter);
    this.b.fire('bar');
    assertEquals(3, counter);
    this.b.stopListening('foo', fn1); //fn2 still listening
    this.b.fire('foo');
    assertEquals(4, counter);
    this.b.fire('bar');
    assertEquals(5, counter);
  },

  'test should be able to remove all listeners for a specific message': function(){
    var counter = 0,
        fn1 = function(){ counter++; },
        fn2 = function(){ counter++; };
    this.b.listen('foo', fn1);
    this.b.listen('foo', fn2);
    this.b.listen('bar', fn1);
    this.b.fire('foo');
    assertEquals(2, counter);
    this.b.fire('bar');
    assertEquals(3, counter);
    this.b.stopListening('foo');
    this.b.fire('foo');
    assertEquals(3, counter);
    this.b.fire('bar');
    assertEquals(4, counter);
  },

  'test should be able to listen to global message "*" which will receive all messages': function(){
    var counter = 0;
    this.b.listen('*', function(){ counter++; });
    this.b.fire('foo');
    this.b.fire('bar');
    this.b.fire('baz');
    this.b.fire('quux');
    assertEquals(4, counter);
  },

  'test global listeners should receive message name as first argument': function(){
    var fired = [];
    this.b.listen('*', function(message){ fired.push(message); });
    this.b.fire('foo');
    this.b.fire('bar');
    this.b.fire('baz');
    this.b.fire('quux');
    assertEquals(['foo', 'bar', 'baz', 'quux'], fired);
  }

});
