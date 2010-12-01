function object(o, props){
  var C = function(){};
  C.prototype = o;
  return new C();
};

X = Strxtime; //TODO Don't be this lazy

StrftimeTest = TestCase("StrftimeTest", {

  setUp: function(){
    this.d = new Date(2010, 10, 12, 13, 14, 15); //13:14:15 Friday Nov 12, 2010
  },
  

  'test %% should be replaced with a single %': function(){
    assertEquals('umma % gumma 10% of all people like carrots', X.strftime(this.d, 'umma %% gumma 10%% of all people like carrots'));
  },
  
  'test non-existing formats should be left in place': function(){
    assertEquals('i %e like %f turtles', X.strftime(this.d, 'i %e like %f turtles'));
  },

  'test %a should be replaced with abbreviated weekday name': function(){
    assertEquals('Fri November 12', X.strftime(this.d, '%a November 12'));
    this.d.setDate(9);
    assertEquals('Tue November 09', X.strftime(this.d, '%a November 09'));
  },

  'test %A should be replaced with the full weekday name': function(){
    assertEquals('Friday November 12', X.strftime(this.d, '%A November 12'));
    this.d.setDate(9);
    assertEquals('Tuesday November 09', X.strftime(this.d, '%A November 09'));
  },

  'test %b should be replaced with the abbreviated month name': function(){
    assertEquals('Friday Nov 12', X.strftime(this.d, 'Friday %b 12'));
    this.d.setMonth(5);
    assertEquals('Saturday Jun 12', X.strftime(this.d, 'Saturday %b 12'));
  },

  'test %B should be replaced with the full month name': function(){
    assertEquals('Friday November 12', X.strftime(this.d, 'Friday %B 12'));
    this.d.setMonth(5);
    assertEquals('Saturday June 12', X.strftime(this.d, 'Saturday %B 12'));
  },

  'test %d should be replaced with zero-padded day of the month': function(){
    assertEquals('Friday November 12', X.strftime(this.d, 'Friday November %d'));
    this.d.setDate(9);
    assertEquals('Tuesday November 09', X.strftime(this.d, 'Tuesday November %d'));
  },

  'test %H should be replaced with 24-hour zero-padded hour of the day': function(){
    assertEquals('time is 13:14:15 right now', X.strftime(this.d, 'time is %H:14:15 right now'));
    this.d.setHours(5);
    assertEquals('time is 05:14:15 right now', X.strftime(this.d, 'time is %H:14:15 right now'));
    this.d.setHours(23);
    assertEquals('time is 23:14:15 right now', X.strftime(this.d, 'time is %H:14:15 right now'));
    this.d.setHours(0);
    assertEquals('time is 00:14:15 right now', X.strftime(this.d, 'time is %H:14:15 right now'));
  },

  'test %I should be replaced with 12-hour zero-padded hour of the day': function(){
    assertEquals('time is 01:14:15 pm right now', X.strftime(this.d, 'time is %I:14:15 pm right now'));
    this.d.setHours(5);
    assertEquals('time is 05:14:15 am right now', X.strftime(this.d, 'time is %I:14:15 am right now'));
    this.d.setHours(23);
    assertEquals('time is 11:14:15 pm right now', X.strftime(this.d, 'time is %I:14:15 pm right now'));

    //Stupid 12 hour clock exceptions
    this.d.setHours(0);
    assertEquals('time is 12:14:15 am right now', X.strftime(this.d, 'time is %I:14:15 am right now'));
    this.d.setHours(12);
    assertEquals('time is 12:14:15 pm right now', X.strftime(this.d, 'time is %I:14:15 pm right now'));
  },

  //TODO Skipping this for now, because Date doesn't have a getter for day of year
  //'test %j should be replaced with zero-padded day of the year': function(){
  //  assertEquals('this is the th day of the year', this.d, 'this is the %jth day of the year');
  //}

  'test %m should be replaced with zero-padded 1-indexed month number of the year': function(){
    assertEquals('November is the 11th month of the year', X.strftime(this.d, 'November is the %mth month of the year'));
    this.d.setMonth(2);
    assertEquals('March is the 03rd month of the year', X.strftime(this.d, 'March is the %mrd month of the year'));
    this.d.setMonth(0);
    assertEquals('January is the 01st month of the year', X.strftime(this.d, 'January is the %mst month of the year'));
    this.d.setMonth(11);
    assertEquals('December is the 12th month of the year', X.strftime(this.d, 'December is the %mth month of the year'));
  },

  'test %M should be replaced with zero-padded minute of the hour': function(){
    assertEquals('time is 13:14:15 right now', X.strftime(this.d, 'time is 13:%M:15 right now'));
    this.d.setMinutes(5);
    assertEquals('time is 13:05:15 right now', X.strftime(this.d, 'time is 13:%M:15 right now'));
    this.d.setMinutes(59);
    assertEquals('time is 13:59:15 right now', X.strftime(this.d, 'time is 13:%M:15 right now'));
    this.d.setMinutes(0);
    assertEquals('time is 13:00:15 right now', X.strftime(this.d, 'time is 13:%M:15 right now'));
  },

  'test %p should be replaced by meridian indicator': function(){
    assertEquals('time is 01:14:15 PM right now', X.strftime(this.d, 'time is 01:14:15 %p right now'));
    this.d.setHours(5);
    assertEquals('time is 05:14:15 AM right now', X.strftime(this.d, 'time is 05:14:15 %p right now'));
    this.d.setHours(23);
    assertEquals('time is 11:14:15 PM right now', X.strftime(this.d, 'time is 11:14:15 %p right now'));

    //Stupid 12 hour clock exceptions
    this.d.setHours(0);
    assertEquals('time is 12:14:15 AM right now', X.strftime(this.d, 'time is 12:14:15 AM right now'));
    this.d.setHours(12);
    assertEquals('time is 12:14:15 PM right now', X.strftime(this.d, 'time is 12:14:15 PM right now'));
  },

  'test %S should be replaced with zero-padded second of the minute': function(){
    assertEquals('time is 13:14:15 right now', X.strftime(this.d, 'time is 13:14:%S right now'));
    this.d.setSeconds(5);
    assertEquals('time is 13:14:05 right now', X.strftime(this.d, 'time is 13:14:%S right now'));
    this.d.setSeconds(59);
    assertEquals('time is 13:14:59 right now', X.strftime(this.d, 'time is 13:14:%S right now'));
    this.d.setSeconds(0);
    assertEquals('time is 13:14:00 right now', X.strftime(this.d, 'time is 13:14:%S right now'));
  },

  'test %w should be replaced with week day number, Sunday being 0': function(){
    assertEquals('this is the 6th day of the week', X.strftime(this.d, 'this is the %wth day of the week'));
    this.d.setDate(13);//Sat nov 13
    assertEquals('this is the 7th day of the week', X.strftime(this.d, 'this is the %wth day of the week'));
    this.d.setDate(7);//Sun nov 7
    assertEquals('this is the 1st day of the week', X.strftime(this.d, 'this is the %wst day of the week'));
  },

  'test %y should be replaced with zero-padded year without century': function(){
    assertEquals('party like it\'s 10!', X.strftime(this.d, 'party like it\'s %y!'));
    this.d.setFullYear(1999);
    assertEquals('party like it\'s 99!', X.strftime(this.d, 'party like it\'s %y!'));
    this.d.setFullYear(699);
    assertEquals('party like it\'s 99!', X.strftime(this.d, 'party like it\'s %y!'));
    this.d.setFullYear(99);
    assertEquals('party like it\'s 99!', X.strftime(this.d, 'party like it\'s %y!'));
    this.d.setFullYear(1588);
    assertEquals('party like it\'s 88!', X.strftime(this.d, 'party like it\'s %y!'));
  },

  'test %Y should be replaced with zero-padded year with century': function(){
    assertEquals('party like it\'s 2010!', X.strftime(this.d, 'party like it\'s %Y!'));
    this.d.setFullYear(1999);
    assertEquals('party like it\'s 1999!', X.strftime(this.d, 'party like it\'s %Y!'));
    this.d.setFullYear(699);
    assertEquals('party like it\'s 699!', X.strftime(this.d, 'party like it\'s %Y!'));
    this.d.setFullYear(99);
    assertEquals('party like it\'s 99!', X.strftime(this.d, 'party like it\'s %Y!'));
    this.d.setFullYear(1588);
    assertEquals('party like it\'s 1588!', X.strftime(this.d, 'party like it\'s %Y!'));
  },

  'test %z should be replaced with the time zone offset': function(){
    //Actually, I don't know how to test this
  },

  'test them all': function(){
    assertEquals('Today is Friday November 12, and the time is 13:14:15!', X.strftime(this.d, 'Today is %A %B %d, and the time is %H:%M:%S!'));
    assertEquals('Today is Fri. Nov. 12, and the time is 01:14:15 PM!', X.strftime(this.d, 'Today is %a. %b. %d, and the time is %I:%M:%S %p!'));
    assertEquals('Friday is the 6th day of the week', X.strftime(this.d, '%A is the %wth day of the week'));
    assertEquals('On Friday Nov. 12 only: 20% off all goats! Store opens at precisely 01:14 PM.', X.strftime(this.d, 'On %A %b. %d only: 20%% off all goats! Store opens at precisely %I:%M %p.'));
    assertEquals('Friday Friday Friday Friday Friday 2010 2010', X.strftime(this.d, '%A %A %A %A %A %Y %Y'));
  }

});

//Repeat all tests with a locale inherited from the default. This is probably a stupid idea.
StrftimeLocaleInheritanceTest = TestCase('StrftimeLocaleInheritanceTest', object(StrftimeTest.prototype));
StrftimeLocaleInheritanceTest.prototype.setUp = function(){
  StrftimeTest.prototype.setUp.apply(this, arguments);
  X.addLocale('inherited', {}, X.formats['default']);
  this.defaultDefaultLocale = X.defaultLocale;
  X.defaultLocale = 'inherited';
};
StrftimeLocaleInheritanceTest.prototype.tearDown = function(){
  X.defaultLocale = this.defaultDefaultLocale;
};

StrftimeLocaleTest = TestCase('StrftimeLocaleTest', {

  setUp: function(){
    this.d = new Date(2010, 10, 12, 13, 14, 15); //13:14:15 Friday Nov 12, 2010
    this.defaultDefaultLocale = X.defaultLocale;
  },

  tearDown: function(){
    //Remove all added locales
    //NOTE: This will break if other locales than default are added to the source
    for (var p in X.formats) {
      if (X.formats.hasOwnProperty(p) && p != 'default') delete X.formats[p];
    }
    X.defaultLocale = this.defaultDefaultLocale;
  },

  'test should have a defaultLocale': function(){
    X.formats['default'].x = function(){ return 'humbaba'; }
    X.addLocale('jambalaya', {x: function(){ return 'jesus' }});
    assertEquals('humbaba', X.strftime(this.d, '%x'));
    X.defaultLocale = 'jambalaya';
    assertEquals('jesus', X.strftime(this.d, '%x'));
  },

  'test should not replace anything if locale doesnt exist': function(){
    assertEquals('%Y-%d-%m', X.strftime(this.d, '%Y-%d-%m', 'aktutaktu'));
  },

  'test locale should use inherited formatter if not overridden': function(){
    X.addLocale('humbaba', {}, X.formats['default']);
    assertEquals('2010', X.strftime(this.d, '%Y', 'humbaba'));
  },

  'test locale should be able to override formatters': function(){
    X.addLocale('party', {Y: function(d){ return '1999' }}, X.formats['default']);
    assertEquals('1999', X.strftime(this.d, '%Y', 'party'));
    assertEquals('10', X.strftime(this.d, '%y', 'party'));
  },

  'test should be able to override month names': function(){
    X.addLocale('no', {
      abbrMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
      monthNames: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
    }, X.formats['default']);

    this.d.setMonth(11); //December
    assertEquals('Sun 12 Des', X.strftime(this.d, '%a %d %b', 'no'));
    assertEquals('Sunday 12 Desember', X.strftime(this.d, '%A %d %B', 'no'));
  },

  'test should be able to override weekday names': function(){
    X.addLocale('no', {
      abbrWeekdays: ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'],
      weekdays: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    }, X.formats['default']);

    this.d.setMonth(11); //December
    assertEquals('Søn 12 Dec', X.strftime(this.d, '%a %d %b', 'no'));
    assertEquals('Søndag 12 December', X.strftime(this.d, '%A %d %B', 'no'));
  },

  'test should be able to override meridian indicators': function(){
    X.addLocale('tr', {meridian: {am: 'på førmeddan', pm: 'på ættmeddan'}}, X.formats['default']);
    this.d.setHours(10);
    assertEquals('10 på førmeddan', X.strftime(this.d, '%I %p', 'tr'));
    this.d.setHours(15);
    assertEquals('03 på ættmeddan', X.strftime(this.d, '%I %p', 'tr'));
  },
  
  'test should be able to override weekday numbers': function(){
    X.addLocale('not stupid', {weekdayNumbers:[7,1,2,3,4,5,6]}, X.formats['default']);
    assertEquals('Friday is the 5th day of the week', X.strftime(this.d, '%A is the %wth day of the week', 'not stupid'));
    this.d.setDate(8);
    assertEquals('Monday is the 1st day of the week', X.strftime(this.d, '%A is the %wst day of the week', 'not stupid'));
    this.d.setDate(14);
    assertEquals('Sunday is the 7th day of the week', X.strftime(this.d, '%A is the %wth day of the week', 'not stupid'));
  },

  'test should be able to add new formatters': function(){
    X.addLocale('tr', {
      times: [[0, 'mett på natta'], [6, 'morran'], [9, 'førmeddan'], [12, 'ættmeddan'], [18, 'kvejln']],
      t: function(d){
        var h = d.getHours(),
            time;
        for (var i=0; i<this.times.length; i++) { if (h > this.times[i][0]) time = this.times[i][1]; }
        return time;
      }
    }, X.formats['default']);

    this.d.setHours(1);
    assertEquals('Akkorat no e det mett på natta', X.strftime(this.d, 'Akkorat no e det %t', 'tr'));
    this.d.setHours(8);
    assertEquals('Akkorat no e det morran', X.strftime(this.d, 'Akkorat no e det %t', 'tr'));
    this.d.setHours(10);
    assertEquals('Akkorat no e det førmeddan', X.strftime(this.d, 'Akkorat no e det %t', 'tr'));
    this.d.setHours(15);
    assertEquals('Akkorat no e det ættmeddan', X.strftime(this.d, 'Akkorat no e det %t', 'tr'));
    this.d.setHours(20);
    assertEquals('Akkorat no e det kvejln', X.strftime(this.d, 'Akkorat no e det %t', 'tr'));
  }

});
