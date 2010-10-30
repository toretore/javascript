/*
 * Observer - makes an object observable using a Broadcaster
 *
 * Usage:
 *
 * var o = {};
 * Observer(o);
 * o.foo = function(){ this.fire('foo', new Date()); };
 * o.observe('foo', function(date){ print(date); });
 * o.foo(); //Prints the Date object
 */
var Observer = function(o){
  o.broadcaster = new Broadcaster();
  o.observe = function(){
    this.broadcaster.subscribe.apply(this.broadcaster, arguments);
  };
  o.fire = function(){
    this.broadcaster.broadcast.apply(this.broadcaster, arguments);
  };
  o.stopObserving = function(){
    this.broadcaster.unsubscribe.apply(this.broadcaster, arguments);
  };
};
