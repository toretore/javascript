TestCase("BaseTest", {

  setUp: function(){
    this.o = new Base();
  },
  
  'test should not export Class to global scope': function(){
    assertFunction(Base.Class);
    assertNotSame(Base.Class, window.Class);
  },
  
  'test should run afterInitialize': function(){
    var klass = Base.extend({
      afterInitialize: function(){
        this.initialized = true;
      }
    });
    assertEquals('undefined', typeof (new Base()).initialized);
    assertTrue((new klass()).initialized);
  },

  'test get should return undefined on non-existing attribute': function(){
    assertEquals('undefined', typeof this.o.get('foo'));
  },

  'test get should use function to fetch value if available': function(){
    this.o.getFooValue = function(){ return "humbaba" };
    assertEquals('humbaba', this.o.get('foo'));
    this.o.getFooBarValue = function(){ return "100 leagues" };
    assertEquals('100 leagues', this.o.get('foo_bar'));
  },

  'test attributeNotFound should be called when value is undefined': function(){
    this.o.attributeNotFound = function(name){ return name.toUpperCase(); };
    assertEquals('HUMBABA', this.o.get('humbaba'));
    assertEquals('FOO_BAR_BAZ', this.o.get('foo_bar_baz'));
    this.o.getFoo = function(){ return undefined; };
    assertEquals('FOO', this.o.get('foo'));
  },

  'test set should set value (yeah, really)': function(){
    this.o.set('foo', 'bar');
    assertEquals('bar', this.o.get('foo'));
  },

  'test set should use function if available': function(){
    var foo;
    this.o.setFooValue = function(v){ foo = v.toUpperCase(); };
    this.o.set('foo', 'bar');
    assertEquals('BAR', foo);
    assertEquals('undefined', typeof this.o.get('foo')); //No getFooValue defined
    this.o.getFooValue = function(){ return foo; };
    assertEquals('BAR', this.o.get('foo'));
  },

  'test should be able to listen to and fire messages': function(){
    var foo, faa;
    this.o.listen('foo', function(bar){ foo = bar; });
    this.o.listen('foo', function(bar){ faa = bar.toUpperCase(); });
    this.o.fire('foo', 'bar');
    assertEquals('bar', foo);
    assertEquals('BAR', faa);
  },
  
  'test should be able to remove single listener': function(){
    var counter = 0,
        l1 = function(){ counter++; },
        l2 = function(){ counter++; };
    this.o.listen('foo', l1);
    this.o.listen('foo', l2);
    this.o.fire('foo');
    assertEquals(2, counter);
    this.o.stopListening('foo', l1);
    this.o.fire('foo');
    assertEquals(3, counter); //Not 4
  },
  
  'test should be able to remove all listeners for a given message': function(){
    var counter = 0,
        l1 = function(){ counter++; },
        l2 = function(){ counter++; };
    this.o.listen('foo', l1);
    this.o.listen('foo', l2);
    this.o.fire('foo');
    assertEquals(2, counter);
    this.o.stopListening('foo');
    this.o.fire('foo');
    assertEquals(2, counter);
  },

  'test set should fire "value changed" message': function(){
    var name, newVal, oldVal;
    this.o.listen('value changed', function(n, nv, ov){
      name = n, newVal = nv, oldVal = ov;
    });
    this.o.set('foo', 'bar');
    assertEquals('foo', name);
    assertEquals(undefined, oldVal);
    assertEquals('bar', newVal);
    this.o.set('foo', 'baz');
    assertEquals('foo', name);
    assertEquals('bar', oldVal);
    assertEquals('baz', newVal);
  },

  'test set should fire "foo value changed" message': function(){
    var newVal, oldVal;
    this.o.listen('foo value changed', function(nv, ov){
      newVal = nv, oldVal = ov;
    });
    this.o.set('foo', 'bar');
    assertEquals(undefined, oldVal);
    assertEquals('bar', newVal);
    this.o.set('foo', 'baz');
    assertEquals('bar', oldVal);
    assertEquals('baz', newVal);
  },

  'test should be able to bubble all messages to another broadcaster': function(){
    var b = new Broadcaster();
    this.o.bubble(b);

    var foo;
    b.listen('foo', function(o, bar){ foo = bar; });
    this.o.fire('foo', 'bar');
    assertEquals('bar', foo);
  },

  'test should be able to set a namespace for bubbled messages': function(){
    var b = new Broadcaster();
    this.o.bubble(b, 'humbaba');

    var normal, namespaced;
    b.listen('foo', function(o, bar){ normal = bar; });
    b.listen('humbaba:foo', function(o, bar){ namespaced = bar; });
    this.o.fire('foo', 'bar');
    assertEquals(undefined, normal);
    assertEquals('bar', namespaced);
  },

  'test camelize should remove dashes and underscores and uppercase next letter + first': function(){
    assertEquals('FooBar', Base.camelize('foo_bar'));
    assertEquals('FooBar', Base.camelize('foo-bar'));
    assertEquals('FooBarBaz', Base.camelize('foo_bar-baz'));
    assertEquals('FooBarBazQuux', Base.camelize('_foo_barBaz-quux-'));
  }

});


TestCase("ElementBaseTest", {

  setUp: function(){
    /*:DOC += <div class="post" id="post_1"><h2 class="title">Humbaba</h2><p class="body">His breath is fire</p></div> */
    this.post = new ElementBase($$('.post').first());
  },

  'test should have access to wrapped element': function(){
    assertNotNull(this.post.element);
    //assertEquals($$('.post').first(), this.post.element);
    assert($$('.post').first() == this.post.element);
  },

  'test should get value from element if possible': function(){
    assertEquals("Humbaba", this.post.get('title'));
  },

  'test should get value as normal when not available in element': function(){
    assertEquals(undefined, this.post.get('humbaba'));
    this.post.set('humbaba', 'foo');
    assertEquals('foo', this.post.get('humbaba'));
    this.post.getHumbabaValue = function(){ return 'bar' };
    assertEquals('bar', this.post.get('humbaba'));
  },

  'test should be able to override which element gets used as the source for a value': function(){
    /*:DOC post = <div class="post"><h2 class="title"><a href="#">Humbaba</a></h2></div> */
    var post = new ElementBase(this.post);
    post.getTitleElement = function(){ return this.element.down('.title a'); };
    assertEquals('Humbaba', post.get('title'));
  },

  'test should be able to override how all elements are found by default with getElementFromSelector': function(){
    /*:DOC post = <div class="post"><h2 class="title">Not this</h2><h3 class="value title">But this</h3></div> */
    var post = new ElementBase(this.post);
    post.getElementFromSelector = function(name){ return this.element.down('.value.'+name); };
    assertEquals('But this', post.get('title'));
    //Should still use function if it exists:
    post.getFooElement = function(){ return this.element.down('h2.title'); };
    assertEquals('Not this', post.get('foo'));
  }

});
