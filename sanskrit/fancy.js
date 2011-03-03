window.onload = function(){
  var textarea = document.getElementById('fancypants');
  var editor = new Sanskrit(textarea, {
    className: 'fancy',
    onSubmit: function(){ alert(this.textilize(this.getContents())); return false },
    toolbar: {
      onStrong: function(){ alert('What a bold move') },
      actions: {'strong': 'B', 'em': 'I', 'ins': 'U', 'del': 'S', 'link': 'Link', 'unlink': 'Unlink', 'textile': 'Textile'}
    }
  });
  editor.addStyle('body { font-family: Arial, Verdana; color: #333; } strike { color: #999; } u { color: #000; }');
}