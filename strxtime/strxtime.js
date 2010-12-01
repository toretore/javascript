Strxtime = (function(){

  function zeroPad(num){
    return num < 10 ? '0'+num : ''+num;
  };

  function object(o){
    var C = function(){};
    C.prototype = o;
    return new C();
  };

  var strxtime = {

    addLocale: function(name, formats, inherit){
      if (inherit) {
        var o = object(inherit);
        for (var p in formats) { if (formats.hasOwnProperty(p)) o[p] = formats[p]; }
        formats = o;
      }

      this.formats[name] = formats;
    },

    formats: {

      'default': {

        abbrMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        abbrWeekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        meridian: {am: 'AM', pm: 'PM'},
        weekdayNumbers: [1, 2, 3, 4, 5, 6, 7], //By default, week starts on Sunday (which is stupid)

        '%': function(d){
          return '%';
        },

        'a': function(d){
          return this.abbrWeekdays[d.getDay()];
        },

        'A': function(d){
          return this.weekdays[d.getDay()];
        },

        'b': function(d){
          return this.abbrMonthNames[d.getMonth()];
        },

        'B': function(d){
          return this.monthNames[d.getMonth()];
        },

        'd': function(d){
          return zeroPad(d.getDate());
        },

        'H': function(d){
          return zeroPad(d.getHours());
        },

        'I': function(d){
          var h = d.getHours();
          if (h == 0 || h == 12) return 12;
          else return zeroPad(h % 12);
        },

        'm': function(d){
          return zeroPad(d.getMonth()+1);
        },

        'M': function(d){
          return zeroPad(d.getMinutes());
        },

        'p': function(d){
          var h = d.getHours();
          return h < 12 ? this.meridian.am : this.meridian.pm;
        },

        'S': function(d){
          return zeroPad(d.getSeconds());
        },

        'w': function(d){
          return ''+this.weekdayNumbers[d.getDay()];
        },

        'y': function(d){
          return zeroPad((d.getFullYear() % 1000) % 100);
        },

        'Y': function(d){
          return ''+d.getFullYear();
        },

        'z': function(d){
          return d.getTimezoneOffset();
        }

      }

    },

    strftime: function(date, str, locale){
      var formats = this.formats[locale || 'default'] || {};
      return str.replace(/%([a-zA-Z%])/g, function(s, f){
        return formats[f] ? formats[f](date) : s;
      });
    },

    strptime: function(){
      
    }

  };

  return strxtime;

})();
