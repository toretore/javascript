TestCase('BetterCalendarTest', {

  'test daysBetween should return the number of days between d1 and d2, excluding d2': function(){
    assertEquals(0, BetterCalendar.daysBetween(new Date(2010, 11, 12), new Date(2010, 11, 12)));
    assertEquals(0, BetterCalendar.daysBetween(new Date(2010, 11, 12, 1, 2, 3), new Date(2010, 11, 12, 3, 2, 1))); //Time of day shouldn't matter
    assertEquals(0, BetterCalendar.daysBetween(new Date(2010, 11, 12, 3, 2, 1), new Date(2010, 11, 12, 1, 2, 3)));
    assertEquals(1, BetterCalendar.daysBetween(new Date(2010, 11, 12), new Date(2010, 11, 13)));
    assertEquals(30, BetterCalendar.daysBetween(new Date(2010, 10, 12), new Date(2010, 11, 12)));
    assertEquals(-30, BetterCalendar.daysBetween(new Date(2010, 11, 12), new Date(2010, 10, 12)));
    assertEquals(364, BetterCalendar.daysBetween(new Date(2010, 0, 1), new Date(2010, 11, 31))); //Should not count last day
    assertEquals(365, BetterCalendar.daysBetween(new Date(2010, 0, 1), new Date(2011, 0, 1)));
    assertEquals(31, BetterCalendar.daysBetween(new Date(2010, 11, 1), new Date(2011, 0, 1)));
  },

  'test numberOfDays should return the number of days between d1 and d2, including d2': function(){
    assertEquals(1, BetterCalendar.numberOfDays(new Date(2010, 11, 12), new Date(2010, 11, 12)));
    assertEquals(1, BetterCalendar.numberOfDays(new Date(2010, 11, 12, 1, 2, 3), new Date(2010, 11, 12, 3, 2, 1))); //Time of day shouldn't matter
    assertEquals(1, BetterCalendar.numberOfDays(new Date(2010, 11, 12, 3, 2, 1), new Date(2010, 11, 12, 1, 2, 3)));
    assertEquals(2, BetterCalendar.numberOfDays(new Date(2010, 11, 12), new Date(2010, 11, 13)));
    assertEquals(31, BetterCalendar.numberOfDays(new Date(2010, 10, 12), new Date(2010, 11, 12)));
    assertEquals(-31, BetterCalendar.numberOfDays(new Date(2010, 11, 12), new Date(2010, 10, 12)));
    assertEquals(365, BetterCalendar.numberOfDays(new Date(2010, 0, 1), new Date(2010, 11, 31))); //Should not count last day
    assertEquals(366, BetterCalendar.numberOfDays(new Date(2010, 0, 1), new Date(2011, 0, 1)));
    assertEquals(32, BetterCalendar.numberOfDays(new Date(2010, 11, 1), new Date(2011, 0, 1)));
  }

});

TestCase("CalendarTest", {

  setUp: function(){
    this.c = new BetterCalendar.Calendar();
  },
  
  'test date should default to right now': function(){
    var c = new BetterCalendar.Calendar();
    assertEquals(c.get('date').getFullYear(), new Date().getFullYear());
    assertEquals(c.get('date').getMonth(), new Date().getMonth());
    assertEquals(c.get('date').getDate(), new Date().getDate());
    assertEquals(c.get('date').getHours(), new Date().getHours());
    assertEquals(c.get('date').getMinutes(), new Date().getMinutes());
    assertEquals(c.get('date').getSeconds(), new Date().getSeconds());
  },

  'test should be able to get and set year': function(){
    assertEquals(this.c.get('year'), new Date().getFullYear());
    this.c.set('year', 1998);
    assertEquals(1998, this.c.get('year'));
  },

  'test should be able to get and set month': function(){
    assertEquals(this.c.get('month'), new Date().getMonth()+1); //1-based
    this.c.set('month', 6);
    assertEquals(6, this.c.get('month'));
    assertEquals(6, this.c.get('date').getMonth()+1);
  },

  'test should be able to get and set day of month': function(){
    assertEquals(this.c.get('day'), new Date().getDate());
    this.c.set('day', 15);
    assertEquals(15, this.c.get('day'));
    assertEquals(15, this.c.get('date').getDate());
  },

  'test should be able to get and set hour': function(){
    this.c.get('date').setHours(5);
    assertEquals(5, this.c.get('hour'));
    this.c.set('hour', 6);
    assertEquals(6, this.c.get('hour'));
  },

  'test should be able to get and set minute': function(){
    this.c.get('date').setMinutes(5);
    assertEquals(5, this.c.get('minute'));
    this.c.set('minute', 6);
    assertEquals(6, this.c.get('minute'));
  },

  'test should be able to get and set second': function(){
    this.c.get('date').setSeconds(5);
    assertEquals(5, this.c.get('second'));
    this.c.set('second', 6);
    assertEquals(6, this.c.get('second'));
  },

  'test should have a weeks attribute giving the weeks of the current month as arrays of dates': function(){
    this.c.set('year', 2010);
    this.c.set('month', 11);
    this.c.set('day', 1);
    assertEquals([
      [1,2,3,4,5,6,7],
      [8,9,10,11,12,13,14],
      [15,16,17,18,19,20,21],
      [22,23,24,25,26,27,28],
      [29,30,null,null,null,null,null]
    ], this.c.get('weeks'));
    this.c.set('month', 2);
    assertEquals([
      [1,2,3,4,5,6,7],
      [8,9,10,11,12,13,14],
      [15,16,17,18,19,20,21],
      [22,23,24,25,26,27,28]
    ], this.c.get('weeks'));
    this.c.set('month', 3);
    assertEquals([
      [1,2,3,4,5,6,7],
      [8,9,10,11,12,13,14],
      [15,16,17,18,19,20,21],
      [22,23,24,25,26,27,28],
      [29,30,31,null,null,null,null]
    ], this.c.get('weeks'));
  },

  'test should reduce date value to nearest possible in same month when year is changed to one where the given month has less days': function(){
    this.c.set('date', new Date(2012, 1, 29, 12, 0)); //Feb 29, 2012
    assertEquals(2012, this.c.get('year'));
    assertEquals(2, this.c.get('month'));
    assertEquals(29, this.c.get('day'));
    this.c.set('year', 2011); //Feb 2011 has only 28 days, date should be 28 now
    assertEquals(2011, this.c.get('year'));
    assertEquals(2, this.c.get('month'));
    assertEquals(28, this.c.get('day'));
    this.c.set('year', 2012); //When changing back, the date should stay the same, not become 29
    assertEquals(2012, this.c.get('year'));
    assertEquals(2, this.c.get('month'));
    assertEquals(28, this.c.get('day'));
  },

  'test should reduce date value to nearest possible when month is changed to one which has less days': function(){
    this.c.set('date', new Date(2011, 2, 31, 12, 0)); //Mar 31, 2011
    assertEquals(2011, this.c.get('year'));
    assertEquals(3, this.c.get('month'));
    assertEquals(31, this.c.get('day'));
    this.c.set('month', 2); //Set month to February
    assertEquals(2011, this.c.get('year'));
    assertEquals(2, this.c.get('month'));
    assertEquals(28, this.c.get('day'));
    this.c.set('month', 3); //Should not change back the other way
    assertEquals(2011, this.c.get('year'));
    assertEquals(3, this.c.get('month'));
    assertEquals(28, this.c.get('day'));
  },

  'test day overflow should increase month value': function(){
    this.c.set('date', new Date(2011, 0, 31)); //Jan 31, 2011
    assertEquals(2011, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(31, this.c.get('day'));
    this.c.set('day', 32);
    assertEquals(2011, this.c.get('year'));
    assertEquals(2, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    this.c.set('day', 32);
    assertEquals(2011, this.c.get('year'));
    assertEquals(3, this.c.get('month'));
    assertEquals(4, this.c.get('day'));
    this.c.set('day', 62); //2 months + 1 day
    assertEquals(2011, this.c.get('year'));
    assertEquals(5, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
  },

  'test month overflow should increase year value': function(){
    this.c.set('date', new Date(2011, 0, 3)); //Jan 3, 2011
    assertEquals(2011, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(3, this.c.get('day'));
    this.c.set('month', 13);
    assertEquals(2012, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(3, this.c.get('day'));
  },

  'test month overflow caused by day overflow should increase year value': function(){
    this.c.set('date', new Date(2011, 11, 1)); //Dec 1, 2011
    assertEquals(2011, this.c.get('year'));
    assertEquals(12, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    this.c.set('day', 32);
    assertEquals(2012, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    this.c.set('day', 367); //366 days in 2012 + 1
    assertEquals(2013, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
  },

  'test hour, minute and second overflow should increase more significant values': function(){
    this.c.set('date', new Date(2011, 0, 1, 12, 0, 0)); //12:00:00
    assertEquals(1, this.c.get('day'));
    assertEquals(12, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    this.c.set('hour', 24);
    assertEquals(2, this.c.get('day'));
    assertEquals(0, this.c.get('hour'));
    this.c.set('hour', 26);
    assertEquals(3, this.c.get('day'));
    assertEquals(2, this.c.get('hour'));
    this.c.set('minute', 60);
    assertEquals(3, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    this.c.set('minute', 70);
    assertEquals(4, this.c.get('hour'));
    assertEquals(10, this.c.get('minute'));
    this.c.set('minute', 135);
    assertEquals(6, this.c.get('hour'));
    assertEquals(15, this.c.get('minute'));
    this.c.set('second', 60);
    assertEquals(6, this.c.get('hour'));
    assertEquals(16, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    this.c.set('second', 80);
    assertEquals(17, this.c.get('minute'));
    assertEquals(20, this.c.get('second'));
    this.c.set('second', 3600);
    assertEquals(7, this.c.get('hour'));
    assertEquals(17, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    this.c.set('second', 3700);
    assertEquals(8, this.c.get('hour'));
    assertEquals(18, this.c.get('minute'));
    assertEquals(40, this.c.get('second'));
    this.c.set('second', 86400);
    assertEquals(4, this.c.get('day'));
    assertEquals(8, this.c.get('hour'));
    assertEquals(18, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
  },

  'test negative values should overflow and reduce the value of the next significant value': function(){
    this.c.set('date', new Date(2011, 0, 1, 12, 0, 0)); //Jan 1, 2011, 12:00:00
    assertEquals(2011, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    assertEquals(12, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    this.c.set('month', -1);
    assertEquals(2010, this.c.get('year'));
    assertEquals(11, this.c.get('month'));
    this.c.set('day', -2);
    assertEquals(10, this.c.get('month'));
    assertEquals(29, this.c.get('day'));
    this.c.set('hour', -3);
    assertEquals(28, this.c.get('day'));
    assertEquals(21, this.c.get('hour'));
    this.c.set('minute', -4);
    assertEquals(20, this.c.get('hour'));
    assertEquals(56, this.c.get('minute'));
    this.c.set('second', -5);
    assertEquals(55, this.c.get('minute'));
    assertEquals(55, this.c.get('second'));
  },

  'test setToday should set year, month, day to today, but not time': function(){
    this.c.set('date', new Date(2008, 0, 1, 12, 0, 0)); //Jan 1, 2008, 12:00:00
    assertEquals(2008, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    assertEquals(12, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    var today = new Date();
    this.c.setToday();
    assertEquals(today.getFullYear(), this.c.get('year'));
    assertEquals(today.getMonth()+1, this.c.get('month'));
    assertEquals(today.getDate(), this.c.get('day'));
    assertEquals(12, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
  },

  'test setNow should set hour, minute, second to now, but not date': function(){
    this.c.set('date', new Date(2008, 0, 1, 12, 0, 0)); //Jan 1, 2008, 12:00:00
    assertEquals(2008, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    assertEquals(12, this.c.get('hour'));
    assertEquals(0, this.c.get('minute'));
    assertEquals(0, this.c.get('second'));
    var now = new Date();
    this.c.setNow();
    assertEquals(2008, this.c.get('year'));
    assertEquals(1, this.c.get('month'));
    assertEquals(1, this.c.get('day'));
    assertEquals(now.getHours(), this.c.get('hour'));
    assertEquals(now.getMinutes(), this.c.get('minute'));
    assertEquals(now.getSeconds(), this.c.get('second'));
  }

});
