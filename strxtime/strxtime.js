Strxtime = (function(){

  function zeroPad(num,pos){
    pos = pos ? pos : 2;
    var str = (pos == 3 && num < 100 ) ? '0' : '';
    return str+(num < 10 ? '0'+num : ''+num);
  };

  function spacePad(num){
    return num < 10 ? ' '+num : ''+num;
  };

  function object(o){
    var C = function(){};
    C.prototype = o;
    return new C();
  };

  var strxtime = {

    defaultLocale: 'default',

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

        '%': function(d){
          return '%';
        },

        'a': function(d){ // Abbreviated name of the day of the week
          return this.abbrWeekdays[d.getDay()];
        },

        'A': function(d){ // Name of the day of the week
          return this.weekdays[d.getDay()];
        },

        'b': function(d){ // Abbreviated month name
          return this.abbrMonthNames[d.getMonth()];
        },

        'B': function(d){ // Month name
          return this.monthNames[d.getMonth()];
        },

        'c': function(d){ // The preferred date and time representation for the current locale.
          return d.toLocaleString();
        },

        'C': function(d){ // The century number (year/100) as a 2-digit integer.
          return zeroPad(Math.floor(d.getFullYear() / 100));
        },

        'd': function(d){ //Zero-padded day of the month
          return zeroPad(d.getDate());
        },

        'D': '%m/%d/%y',

        'e': function(d){ // Like %d, the day of the month as a decimal number, but a leading zero is replaced by a space.
          return spacePad(d.getDate());
        },

        'F': '%Y-%m-%d',

        'h': '%b',

        'H': function(d){ // Zero-padded hour of the day
          return zeroPad(d.getHours());
        },

        'I': function(d){ // Zero-padded 12-hour hour of the day
          var h = d.getHours();
          if (h == 0 || h == 12) return 12;
          else return zeroPad(h % 12);
        },

        'j': function(d){ // The day of the year as a decimal number (range 001 to 366).
          var jan1 = Date.UTC(d.getFullYear(), 0, 1, 0, 0, 0, 0),
              thatday = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
          return zeroPad(((thatday - jan1) / 86400000) + 1, 3);
        },

        'k': function(d){ // The hour (24-hour clock) as a decimal number (range 0 to 23); single digits are preceded by a blank. (See also %H.)
          return spacePad(d.getHours());
        },

        'l': function(d){ // The hour (12-hour clock) as a decimal number (range 1 to 12); single digits are preceded by a blank. (See also %I.)
          var h = d.getHours();
          if (h == 0 || h == 12) return 12;
          else return spacePad(h % 12);
        },

        'm': function(d){ // Zero-padded month number
          return zeroPad(d.getMonth()+1);
        },

        'M': function(d){ //Zero-padded minutes
          return zeroPad(d.getMinutes());
        },

        'n': function(d){ // A newline character
          return "\n";
        },

        'p': function(d){ // Meridian indicator
          var h = d.getHours();
          return h < 12 ? this.meridian.am : this.meridian.pm;
        },

        'P': function(d){ // Like %p but in lowercase: `am' or `pm' or a corresponding string for the current locale.
          return this.p(d).toLowerCase();
        },

        'r': '%I:%M:%S %p',

        'R': '%H:%M',

        's': function(d){ // Seconds since epoch
          var s = d.getTime().toString();
          return s.substring(0,s.length-3);
        },

        'S': function(d){ // Zero-padded seconds
          return zeroPad(d.getSeconds());
        },

        't': function(d){ // A tab character
          return "\t";
        },

        'T': '%H:%M:%S',

        'u': function(d){ // The day of the week as a decimal, range 1 to 7, Monday being 1. See also %w.
          return ''+(((d.getDay() + 6) % 7) + 1);
        },

        'w': function(d){ // Day of the week, 0 is Sunday, 6 is Saturday
          return ''+d.getDay();
        },

        'x': function(d){ // The preferred date representation for the current locale without the time.
          return d.toLocaleDateString();
        },

        'X': function(d){ // The preferred time representation for the current locale without the date.
          return d.toLocaleTimeString();
        },

        'y': function(d){ // Zero-padded year w/o century
          return zeroPad((d.getFullYear() % 1000) % 100);
        },

        'Y': function(d){ // Year
          return ''+d.getFullYear();
        },

        'z': function(d){ // The time-zone as hour offset from UTC. Required to emit RFC822-conformant dates (using "%a, %d %b %Y %H:%M:%S %z").
          var minutes = Math.abs(d.getTimezoneOffset());
          var sign = (d.getTimezoneOffset() > 0) ? '-' : '+';
          return sign + zeroPad(Math.floor(minutes/60)) + "" + zeroPad(minutes % 60);
        }

      }

    },

    strftime: function(date, str, locale){
      var that = this,
          formats = this.formats[locale || this.defaultLocale] || {};
      return str.replace(/%([a-zA-Z%])/g, function(s, f){
        if (typeof formats[f] == 'string') return that.strftime(date, formats[f], locale);
        else if (typeof formats[f] == 'function') return formats[f](date);
        else return s;
      });
    },

    strptime: function(){

    }

  };

  return strxtime;

})();
