function Sanskrit (textarea, options) {

  this.options = options || {};
  this.textarea = textarea;
  this.form = textarea.form;
  this.container = document.createElement('div');
  this.iframe = document.createElement('iframe');
  this.hiddenInput = document.createElement('input');
  this.hiddenInput.type = 'hidden';
  this.callbacks = Sanskrit.inherit(Sanskrit.prototype.callbacks);
  
  for (var callback in Sanskrit.prototype.callbacks) {
    if (
      Sanskrit.prototype.callbacks.hasOwnProperty(callback) &&
      typeof this.options[callback] === 'function'
    ) {
      this.callbacks[callback] = this.options[callback];
    }
  }
  
  this.replaceTextarea();
  
  var self = this;
  this.onReady(function(){
    self.findContentDocument();
    
    if (self.richTextIsAvailable()) {
      self.applyClassNames();
      self.enableEditor();
      self.addStyle(Sanskrit.defaultStyle);
      self.createToolbar();
      self.hijackForm();
    } else {
      self.unreplaceTextarea();
    }
  });
  
  Sanskrit.editors.push(this);

};

Sanskrit.inherit = function(o){
  function F(){};
  F.prototype = o;
  return new F();
};

Sanskrit.getClassName = function(element){
  return element.getAttribute('class') || element.getAttribute('className')
};

Sanskrit.setClassName = function(element, className){
  element.setAttribute('class', className);
  element.className = className;
};

Sanskrit.hasClassName = function(element, className){
  if (!Sanskrit.getClassName(element)) { return false; }
  var classNames = Sanskrit.getClassName(element).split(' ');
  for (var i=0; i<classNames.length; i++) {
    if (classNames[i] == className) { return true; }
  }
  return false;
};

Sanskrit.addClassName = function(element, className){
  if (Sanskrit.hasClassName(element, className)) { return false; }
  var currentClassName = Sanskrit.getClassName(element) || '';
  Sanskrit.setClassName(element, currentClassName == '' ? className : currentClassName+' '+className);
  return true;
};

Sanskrit.removeClassName = function(element, className) {
  var classNames = (Sanskrit.getClassName(element) || '').split(' ');
  var newClassNames = [];
  for (var i=0; i<classNames.length; i++) {
    if (classNames[i] != className) { newClassNames.push(classNames[i]); }
  }
  newClassNames = newClassNames.join(' ');
  Sanskrit.setClassName(element, newClassNames);
  return newClassNames;
};

Sanskrit.defaultStyle = 'html { padding:0; cursor:text; } body { font-size:90%; margin:0; padding:0.5em; cursor:text; } p { margin: 0.5em 0; }';

Sanskrit.editors = [];



Sanskrit.prototype = {

  //Gecko needs some time to initialise the iframe or something
  onReady: function(f){
    setTimeout(f, 250);
  },

  findContentDocument: function(){
    if (this.iframe.contentDocument) { //Gecko
      this.internetExplorer = false;
      this.contentDocument = this.iframe.contentDocument;
    } else { //IE
      this.internetExplorer = true;
      this.contentDocument = this.iframe.contentWindow.document;
    }
    
    return this.contentDocument;
  },

  replaceTextarea: function(){
    this.container.appendChild(this.iframe);
    this.hiddenInput.value = this.textarea.value;
    this.hiddenInput.name = this.textarea.name;
    this.hiddenInput.id = this.textarea.id;
    this.container.insertBefore(this.hiddenInput, this.iframe);
    this.textarea.parentNode.insertBefore(this.container, this.textarea);
    this.textarea.parentNode.removeChild(this.textarea);
  },
  
  unreplaceTextarea: function(){
    this.container.parentNode.insertBefore(this.textarea, this.container);
    this.container.parentNode.removeChild(this.container);
  },
  
  toggleTextarea: function(){
    if (this.iframe.parentNode) {
      this.textarea.value = this.textilize(this.getContents());
      this.iframe.parentNode.insertBefore(this.textarea, this.iframe);
      this.iframe.parentNode.removeChild(this.iframe);
      return true;
    } else {
      this.textarea.parentNode.insertBefore(this.iframe, this.textarea);
      this.textarea.parentNode.removeChild(this.textarea);
      var self = this;
      this.onReady(function(){
        self.findContentDocument();
        self.hiddenInput.value = self.textarea.value;
        self.enableEditor();
        self.toolbar.observeEditor();
      });
      return false;
    }
  },
  
  enableEditor: function(){
    this.contentDocument.designMode = 'on';
    try { //Opera chokes when trying to set styleWithCSS
      this.execCommand('styleWithCSS', false);
    } catch(e) {}
    this.setContents(this.htmlize(this.hiddenInput.value));
  },
  
  focusEditor: function(){
    this.iframe.contentWindow.focus();
  },
  
  createToolbar: function(){
    this.toolbar = new SanskritToolbar(this, this.options.toolbar || {});
  },
  
  insertToolbar: function(toolbar){
    this.container.insertBefore(toolbar, this.iframe);
  },
  
  getContents: function(){
    return this.contentDocument.getElementsByTagName('body')[0].innerHTML;
  },
  
  setContents: function(contents){
    var self = this;
    setTimeout(function(){
      self.contentDocument.getElementsByTagName('body')[0].innerHTML = contents;
    }, 250)
  },
  
  getSelection: function(){
    if (this.iframe.contentWindow.document.selection) {
      return this.iframe.contentWindow.document.selection;
    } else {
      return this.iframe.contentWindow.getSelection();
    }
  },
  
  //Returns an array with the ancestor nodes that surround the current selection
  //Closer relatives come first
  getCurrentAncestors: function(){
    var selection = this.getSelection();
    
    if (selection.createRange) {
      var range = selection.createRange();
      var ancestor = range.parentElement();
    } else {
      var range = selection.getRangeAt(0);
      var ancestor = range.commonAncestorContainer;
    }
    
    var ancestors = [];
    while (ancestor.nodeType !== 1 || ancestor.nodeName.toLowerCase() !== 'body') {
      if (ancestor.nodeType === 1) {
        ancestors.push(ancestor);
      }
      
      ancestor = ancestor.parentNode;
    }
    
    return ancestors;
  },
  
  //Returns true if a node with nodeName surrounds the current selection
  includeAncestor: function(nodeName, ancestors){
    ancestors = ancestors || this.getCurrentAncestors();
    var includesNodeName = false;
    for (var i=0; i<ancestors.length; i++) {
      if (ancestors[i].nodeName.toLowerCase() == nodeName.toLowerCase()) {
        includesNodeName = true;
      }
    }
    return includesNodeName;
  },
  
  applyClassNames: function(){
    Sanskrit.addClassName(this.container, this.options.className || 'sanskrit');
  },
  
  //Put the contents of the iframe into the form onsubmit
  hijackForm: function(){
    var self = this;
    var old = this.form.onsubmit || function(){};
    
    this.form.onsubmit = function(){
      old();
      self.hiddenInput.value = self.textilize(self.iframe.parentNode ? self.getContents() : self.textarea.value);
      return self.callbacks.onSubmit.call(self);
    }
  },
  
  addStyle: function(styles){
    var self = this;
    setTimeout(function(){
      if (document.createStyleSheet) {//IE
          var s = self.contentDocument.createStyleSheet(),
              rules = styles.split('}'),
              i, nv;
          for (i = 0; i < rules.length-1; i++) {
            nv = rules[i].split('{');
            s.addRule(nv[0], nv[1]);
          }
      } else {//Others
        var s = document.createElement('style');
        s.appendChild(document.createTextNode(styles));
        self.contentDocument.getElementsByTagName('head')[0].appendChild(s);
      }
    }, 250);
  },
  
  textilize: function(html, escape){
    html = html.replace(/\s*<p>((.|[\r\n])*?)<\/p>\s*/gi, "\n\n$1\n\n");
    html = html.replace(/<br ?\/?>/gi, "\n");
    html = html.replace(/<(?:b|strong)>((.|[\r\n])*?)<\/(?:b|strong)>/gi, '*$1*');
    html = html.replace(/<(?:i|em)>((.|[\r\n])*?)<\/(?:i|em)>/gi, '_$1_');
    html = html.replace(/<(?:strike|del)>((.|[\r\n])*?)<\/(?:strike|del)>/gi, '-$1-');
    html = html.replace(/<(?:u|ins)>((.|[\r\n])*?)<\/(?:u|ins)>/gi, '+$1+');
    html = html.replace(/<a href="(.*?)">((.|[\r\n])*?)<\/a>/gi, '"$2":$1');
    html = html.replace(/<code.*?>((.|[\r\n])*?)<\/code>/gi, '@$1@');
    if (escape){
      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');//Escape any remaining HTML
    }
    html = html.replace(/(\r\n|\n){3,}/g, "\n\n");
    html = html.replace(/^[\r\n]+|[\r\n]+$/g, '');
    return html;
  },
  
  htmlize: function(textile, escape){
    var paragraphs = textile.split("\n\n");
    for (var i=0; i<paragraphs.length; i++) {
      paragraphs[i] = paragraphs[i].replace(/(^|\r\n|\n|\r)\* (.*)/g, '$1###LI### $2');
      paragraphs[i] = paragraphs[i].replace(/\n/gi, '<br/>');
      paragraphs[i] = paragraphs[i].replace(/@((.|[\r\n])*?)@/gi, '<code>$1</code>');
      paragraphs[i] = paragraphs[i].replace(/\*(.+?)\*/gi, (this.internetExplorer ? '<strong>$1</strong>' : '<b>$1</b>'));
      paragraphs[i] = paragraphs[i].replace(/_(.+?)_/gi, (this.internetExplorer ? '<em>$1</em>' : '<i>$1</i>'));
      paragraphs[i] = paragraphs[i].replace(/\+(.+?)\+/gi, '<u>$1</u>');
      paragraphs[i] = paragraphs[i].replace(/-(.+?)-/gi, '<strike>$1</strike>');
      paragraphs[i] = paragraphs[i].replace(/"(.+?)":([^\s\n<]+)/gi, '<a href="$2">$1</a>');
      paragraphs[i] = paragraphs[i].replace(/###LI###/gi, '*');
      paragraphs[i] = '<p>'+paragraphs[i]+'</p>';
    }
    textile = paragraphs.join("\n");
    textile = textile.replace(/<p>[\s\n]*<\/p>/g, '');
    if (escape){
      textile = textile.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }
    return textile;
  },
  
  execCommand: function(name, value){
    if (typeof value == 'undefined') { value = null; }
    this.contentDocument.execCommand(name, false, value);
  },
  
  richTextIsAvailable: function(){
    return(typeof this.contentDocument.execCommand != 'undefined');
  },
  
  callbacks: {
    onSubmit: function(){ return true; }
  }

};




function SanskritToolbar(editor, options) {

  this.options = options || {};
  this.editor = editor;
  this.list = document.createElement('ul');
  this.listItems = [];
  this.listItemCallbacks = {};
  this.availableActions = {'strong': 'strong', 'em': 'em', 'ins': 'ins', 'del': 'del', 'link': 'link', 'unlink': 'unlink', 'textile': 'textile'};
  this.callbacks = Sanskrit.inherit(SanskritToolbar.prototype.callbacks);
  
  for (var action in this.actions) {
    var callbackName = 'on'+action.slice(0,1).toUpperCase()+action.slice(1);
    if (typeof this.options[callbackName] === 'function') {
      this.callbacks[callbackName] = this.options[callbackName];
    }
  }
  
  this.addListItems();
  this.applyClassNames();
  this.injectListIntoEditor();
  this.observeEditor();

};

SanskritToolbar.prototype = {

  actions: {
  
    strong: function(editor){
      editor.execCommand('Bold');
    },
    
    em: function(editor){
      editor.execCommand('Italic');
    },
    
    link: function(editor){
      var uri = prompt('Enter link address:');
      if (typeof uri === 'string') {
        if (!uri.match(/^[a-zA-Z]+:\/\//)) { uri = 'http://' + uri; }
        editor.execCommand('createLink', uri);
      } else {
        return false;
      }
    },
    
    unlink: function(editor){
      editor.execCommand('unlink');
      editor.toolbar.deactivateListItem('link'); //Turn off link action
      editor.toolbar.activateListItem('unlink'); //This action can't be "active"
    },
    
    del: function(editor){
      editor.execCommand('strikeThrough');
    },
    
    ins: function(editor){
      editor.execCommand('underline');
    },
    
    textile: function(editor) {
      editor.toolbar.resetListStatus();
      
      var tb = editor.toolbar;
      var b = editor.toggleTextarea();
      if (b) { tb.activateListItem('textile'); } else { tb.deactivateListItem('textile'); }
      
      for (var key in tb.actions) {
        if (tb.actions.hasOwnProperty(key) && key !== 'textile') {
          if(b) { tb.hideListItem(key); } else { tb.showListItem(key); }
        }
      }
      
      return false;
    }
  
  },
  
  callbacks: {},
  
  createAction: function(link, action){
    var self = this;
    var old = link.onclick || function(){};
    
    return function(){
      old();
      
      if (self.actions[action](self.editor) !== false) {
        var callbackName = 'on'+action.slice(0,1).toUpperCase()+action.slice(1);
        if (typeof self.callbacks[callbackName] === 'function') {
          self.callbacks[callbackName].call(self.editor);
        }
        
        self.updateListStatus(self.editor.getCurrentAncestors());
        self.editor.focusEditor();
      }
      
      return false;
    };
  },
  
  addListItems: function(){
    var actions = this.options.actions || this.availableActions;
    
    for (var key in actions) {
      if (actions.hasOwnProperty(key)) {
        var listItem = document.createElement('li');
        var link = document.createElement('a');
        link.setAttribute('href', '#');
        Sanskrit.addClassName(listItem, key);
        link.appendChild((typeof actions[key] == 'string') ? document.createTextNode(actions[key]) : actions[key]);
        link.onclick = this.createAction(link, key);
        
        listItem.appendChild(link);
        this.listItems.push(listItem);
        this.list.appendChild(listItem);
      }
    }
  },
  
  applyClassNames: function(){
    Sanskrit.addClassName(this.list, 'toolbar');
  },
  
  injectListIntoEditor: function(){
    this.editor.insertToolbar(this.list);
  },
  
  observeEditor: function(){
    var self = this;
    setTimeout(function(){
      if (self.editor.contentDocument.addEventListener) {
        self.editor.contentDocument.addEventListener('mouseup', function(){self.updateListStatus(self.editor.getCurrentAncestors())}, false);
        self.editor.contentDocument.addEventListener('keyup', function(){self.updateListStatus(self.editor.getCurrentAncestors())}, false);
        self.editor.contentDocument.addEventListener('keydown', function(){self.updateListStatus(self.editor.getCurrentAncestors())}, false);
        self.editor.contentDocument.addEventListener('blur', function(){self.resetListStatus()}, false);
      } else {
        self.editor.contentDocument.attachEvent('onmouseup', function(){self.updateListStatus(self.editor.getCurrentAncestors())});
        self.editor.contentDocument.attachEvent('onkeyup', function(){self.updateListStatus(self.editor.getCurrentAncestors())});
        self.editor.contentDocument.attachEvent('onkeydown', function(){self.updateListStatus(self.editor.getCurrentAncestors())}, false);
        self.editor.contentDocument.attachEvent('onblur', function(){self.resetListStatus()}, false);
      }
    }, 100);
  },
  
  getListItem: function(className){
    if (!(typeof className == 'string')) { return className; }
    for (var i=0; i<this.listItems.length; i++){
      if (Sanskrit.hasClassName(this.listItems[i], className)) {
        return this.listItems[i];
      }
    }
    return document.createElement('li');
  },
  
  activateListItem: function(className){
    Sanskrit.addClassName(this.getListItem(className), 'active');
  },
  
  deactivateListItem: function(className){
    Sanskrit.removeClassName(this.getListItem(className), 'active');
  },
  
  toggleListItem: function(className){
    var li = this.getListItem(className);
    if (Sanskrit.hasClassName(li, 'active')) {
      Sanskrit.removeClassName(li, 'active');
    } else {
      Sanskrit.addClassName(li, 'active');
    }
  },
  
  hideListItem: function(className){
    var li = this.getListItem(className);
    li.previousDisplayValue = li.style.display;
    li.style.display = 'none';
  },
  
  showListItem: function(className) {
    var li = this.getListItem(className);
    li.style.display = li.previousDisplayValue || '';
  },
  
  resetListStatus: function(){
    for (var i=0; i<this.listItems.length; i++){
      this.deactivateListItem(this.listItems[i]);
    }
  },
  
  updateListStatus: function(ancestors){
    this.resetListStatus();
    
    for (var i=0; i<ancestors.length; i++) {
      switch (ancestors[i].nodeName.toLowerCase()) {
        case 'b':
          this.activateListItem('strong');
          break;
        case 'strong':
          this.activateListItem('strong');
          break;
        case 'i':
          this.activateListItem('em');
          break;
        case 'em':
          this.activateListItem('em');
          break;
        case 'u':
          this.activateListItem('ins');
          break;
        case 'strike':
          this.activateListItem('del');
          break;
        case 'a':
          this.activateListItem('link');
          break;
      }
    }
  }

};


//Looks for textareas with the class name "sanskrit" and makes them rich-text
Sanskrit.onLoadFunction = function(){
  var textareas = [];
  var textareasCollection = document.getElementsByTagName('textarea');
  for(var i=0; i<textareasCollection.length; i++){ textareas.push(textareasCollection[i]); }
  
  for (var i=0; i<textareas.length; i++) {
    if (Sanskrit.hasClassName(textareas[i], 'sanskrit')) {
      new Sanskrit(textareas[i]);
    }
  }
};

if (typeof Event != 'undefined' && Event.onReady) { //LowPro
  Event.onReady(Sanskrit.onLoadFunction);
} else if (typeof Event != 'undefined' && Event.observe) { //Prototype
  Event.observe(window, 'load', Sanskrit.onLoadFunction);
} else if (window.addEventListener) { //W3C
  window.addEventListener('load', Sanskrit.onLoadFunction, false);
} else if (window.attachEvent) { //IE
  window.attachEvent('onload', Sanskrit.onLoadFunction, false);
} else { //1980s event handling
  var old = window.onload;
  window.onload = function(){
    old();
    Sanskrit.onLoadFunction();
  };
}