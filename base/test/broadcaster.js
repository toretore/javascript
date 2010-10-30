/*
 * Broadcaster © 2008 Tore Darell
 *
 *
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * Version 2, December 2004
 *
 * Copyright (C) 2004 Sam Hocevar
 * 14 rue de Plaisance, 75014 Paris, France
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 * DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 * TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 *
 *
 *
 * Implements a centralised broadcast/listen pattern. A broadcaster
 * is simple and dumb and only knows how to broadcast a message to
 * listeners for that particular message.
 *
 * var b = new Broadcaster();
 *
 * b.broadcast('a message'); //Nothing happens
 * b.listen('a message', function(){ alert('a message was received'); });
 * b.broadcast('a message'); //alerts
 *
 * b.listen('some state has changed', function(s){ alert('new state is now: '+s); });
 * b.broadcast('some state has changed', 'new state'); // alerts "new state is now: new state'"
 *
 * var collector = [];
 * b.listen('new item', function(i){ this.push(i); }, collector);
 * b.broadcast('new item', 'cat'); // ['cat']
 * b.broadcast('new item', 'dog'); // ['cat', 'dog']
 *
 * The special message '*' is used as a global listener which will receive all messages:
 *
 * b.listen('*', function(message){ alert(message + ' was received'); })
 * b.fire('foo'); //Alerts "foo was received"
 *
 * A broadcaster can easily be used to make an object observable:
 *
 * function ElementObserver(element, interval){
 *   this.element = element;
 *   this.broadcaster = new Broadcaster(); //The magic line
 *   var that = this, oldValue = element.innerHTML;
 *   this._interval = setInterval(function(){
 *     var newValue = element.innerHTML;
 *     if (newValue !== oldValue) {
 *       that.broadcaster.broadcast('value changed', newValue, oldValue);
 *     }
 *     oldValue = newValue;
 *   }, interval || 500);
 * };
 *
 * var observers = ['some_id', 'some_other_id'].map(function(id){ return new ElementObserver($(id)); });
 * observers.each(function(o){
 *   o.broadcaster.listen('value changed', function(ov, nv){
 *     alert('Value in '+o.element+' changed from '+ov+' to '+nv);
 *   });
 * });
 *
 */

Broadcaster = function(){
  this.listeners = {};
};

(function(p){

  p.defaultScope = this;// window/global

  //Attach a listener for a particular message with a callback function and
  //an optional scope in which it will run. Returns the callback function.
  p.listen = function(message, callback, scope){
    if (!this.listeners[message]) { this.listeners[message] = []; }
    this.listeners[message].push({callback: callback, scope: scope});
    return callback;
  };
  p.subscribe = p.listen;

  //Remove a listener which matches a particular message and callback function
  p.stopListening = function(message, callback){
    var l = this.listeners, m = message, c = callback, i;
    if (l[m]) {
      for (i=0; i<l[m].length; i++) {
        if (l[m][i].callback == c) { l[m].splice(i,1); }
      }
    }
  };
  p.unsubscribe = p.stopListening;

  //Broadcast a message. Any additional arguments are proxied to
  //the listener's callback function. Listeners for the special
  //message '*' will receive all messages that are fired
  p.broadcast = function(message){
    var l = this.listeners[message], g = this.listeners['*'], args, i;

    if (l || g) {
      args = Array.prototype.slice.call(arguments, 1);

      if (l) {//Specific listeners
        for (i=0; i<l.length; i++) {
          l[i].callback.apply(l[i].scope || this.defaultScope, args)
        }
      }

      if (g) {//Global listeners
        for (i=0; i<g.length; i++) {//Globals also receive message name
          g[i].callback.apply(g[i].scope || this.defaultScope, arguments)
        }
      }
    }
  };
  p.fire = p.broadcast;
  p.send = p.broadcast;

})(Broadcaster.prototype);
