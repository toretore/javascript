//A better date/time selector. WIP.
BetterCalendar = {

  observe: function(el, ev, fn){
    if (el.attachEvent) el.attachEvent('on'+ev, fn);
    else el.addEventListener(ev, fn, false);
  },

  stopObserving: function(el, ev, fn){
    if (el.detachEvent) el.detachEvent(ev, fn);
    else el.removeEventListener(ev, fn, false);
  },

  object: function(o){
    var F = function(){};
    F.prototype = o;
    return new F();
  },

  cloneDate: function(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  },

  //Returns the number of days between d1 and d2. Does not take time of day into account.
  daysBetween: function(d1, d2){
    return((
      Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate(), 0, 0, 0, 0) -
      Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate(), 0, 0, 0, 0)
    ) / 86400000)
  },

  //Returns the number of days included in the range d1..d2, including both d1 and d2
  numberOfDays: function(d1, d2){
    return this.daysBetween(d1, d2) + 1;
  }

};



/* Calendar is the part that joins everything together. Its only purpose is to contain
 * a date and allow manipulating it with accessors for year, month, etc. Other classes
 * then use Calendars as their source for date information. A Calendar instance can be
 * shared between many Templates, InputBridges, etc so you can create a single Calendar,
 * then add a Template for controlling it and an InputBridge which is updated when the
 * date is changed through the Template. Here's a fancy diagram of an example setup:
 *
 *     Popup
 *       |
 *    Template  Template
 *          |    |
 *         Calendar
 *          |    |
 *  InputBridge SelectBridge
 *     |            |
 *  <input>      <selects>
 *
 * Example: A template that's a popup, one that isn't a popup, an input bridge and a select bridge,
 *          all joined together by a Calendar, meaning they're all in sync with each other.
 */
BetterCalendar.Calendar = Base.extend({

  init: function(d){
    this._super();
    if (!d) d = new Date(); //Today
    this.set('date', d);
  },

  getYearValue: function(){
    return this.get('date').getFullYear();
  },
  setYearValue: function(y){
    var d = this._cloneDate(this.get('date')),
        m = d.getMonth();
    d.setFullYear(y);
    if (d.getMonth() != m) d.setDate(0);
    this.set('date', d)
  },

  prevYear: function(){ this.set('year', this.get('year')-1); },
  nextYear: function(){ this.set('year', this.get('year')+1); },

  getMonthValue: function(){
    return this.get('date').getMonth()+1;
  },
  setMonthValue: function(m){
    var d = this._cloneDate(this.get('date')),
        dd = d.getDate();
    d.setMonth(m-1);
    if (d.getDate() != dd) d.setDate(0);
    this.set('date', d);
  },

  prevMonth: function(){ this.set('month', this.get('month')-1); },
  nextMonth: function(){ this.set('month', this.get('month')+1); },

  getDayValue: function(){
    return this.get('date').getDate();
  },
  setDayValue: function(d){
    var da = this._cloneDate(this.get('date'));
    da.setDate(d);
    this.set('date', da);
  },

  prevDay: function(){ this.set('day', this.get('day')-1); },
  nextDay: function(){ this.set('day', this.get('day')+1); },

  getHourValue: function(){ return this.get('date').getHours(); },
  setHourValue: function(h){
    var d = this._cloneDate(this.get('date'));
    d.setHours(h);
    this.set('date', d);
  },

  prevHour: function(){ this.set('hour', this.get('hour')-1); },
  nextHour: function(){ this.set('hour', this.get('hour')+1); },

  getMinuteValue: function(){ return this.get('date').getMinutes(); },
  setMinuteValue: function(h){
    var d = this._cloneDate(this.get('date'));
    d.setMinutes(h);
    this.set('date', d);
  },

  prevMinute: function(){ this.set('minute', this.get('minute')-1); },
  nextMinute: function(){ this.set('minute', this.get('minute')+1); },

  getSecondValue: function(){ return this.get('date').getSeconds(); },
  setSecondValue: function(h){
    var d = this._cloneDate(this.get('date'));
    d.setSeconds(h);
    this.set('date', d);
  },

  prevSecond: function(){ this.set('second', this.get('second')-1); },
  nextSecond: function(){ this.set('second', this.get('second')+1); },


  setToday: function(){
    var today = new Date(),
        d = this._cloneDate(this.get('date'));
    d.setFullYear(today.getFullYear());
    d.setMonth(today.getMonth());
    d.setDate(today.getDate());
    this.set('date', d);
  },
  setNow: function(){
    var today = new Date(),
        d = this._cloneDate(this.get('date'));
    d.setHours(today.getHours());
    d.setMinutes(today.getMinutes());
    d.setSeconds(today.getSeconds());
    this.set('date', d);
  },


  //Returns an array of arrays for the current month where each array is a week.
  //The first and last is padded with null values representing dates in the
  //previous and next month.
  getWeeksValue: function(){
    var m = this.get('month')-1,
        d = new Date(this.get('year'), m, 1),
        w = [],
        cw, i;

    while (d.getMonth() == m) {
      cw = [];
      w.push(cw);
      for (i=0;i<7;i++) {
        if ((d.getDay()+6) % 7 == i && d.getMonth() == m) { cw.push(d.getDate()); d.setDate(d.getDate()+1); }
        else { cw.push(null); }
      }
    }

    return w;
  },

  isToday: function(){
    var today = new Date();
    return today.getFullYear() == this.get('year') && today.getMonth() == this.get('month')-1 &&
      today.getDate() == this.get('day');
  },

  _cloneDate: function(d){
    return BetterCalendar.cloneDate(d);
  }

});





/* Template is a container element linked to a Calendar. Elements inside it can have values that are
 * synced with the calendar based on their class names (Template is_an ElementBase).
 *
 * The following class names signify elements that are updated:
 * - year
 * - month (can have a data-month-names attribute with a space-separated list of month names)
 * - day (the day of the month)
 * - hour
 * - minute
 * - week: This element represents the days of the week. You just need one element, it will
 *         be duplicated for the required amount fo weeks for a given month. Descendant elements
 *         with the class 'day' and one of (mon,tue,wed,thu,fri,sat,sun) will receive the date
 *         for the week in question which falls on that day.
 *
 * Additionally, any element can be a control by having the data-control attribute whose content is the
 * name of the control. For a list of controls, see the 'controls' property.
 *
 * Here's a very simple example template consisting of just the weeks and month name with controls for prev- and next-month:
 *
 *   <table class="my-simple-calendar">
 *    <tr><td colspan="7"><a data-control="prev-month">prev</a><span class="month"></span><a data-control="next-month">next</a></td></tr>
 *     <tr class="week">
 *       <td class="day mon"></td><td class="day tue"></td><td class="day wed"></td><td class="day thu"></td>
 *       <td class="day fri"></td><td class="day sat"></td><td class="day sun"></td>
 *     </tr>
 *   </table>
 *
 * The containing element (<table> in the example above) will receive the class 'today' when today's date is selected.
 *
 * The element will have no styling. That's what CSS is for.
 */
BetterCalendar.Template = ElementBase.extend({

  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  //Defaults. Can be overridden.
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  _parseInt: function(str){
    if (str.match(/^0+$/)) return 0;
    return parseInt(str.replace(/^0+/, ''));
  },
  _padInt: function(i){
    return (i < 10 ? '0' : '') + i;
  },
  _readInt: function(key){
    var v = this.getValueByElement(key);
    v = v && this._parseInt(v);
    return isNaN(v) ? null : v;
  },

  extractValueFromElement: function(el){
    var v = el.getValue ? el.getValue() : el.innerHTML;
    //Remove dirty, filthy HTML from contenteditable elements
    return typeof v == 'string' ? v.replace(/<[^>]*>/, '') : v;
  },
  insertValueInElement: function(el, v){
    if (el.getValue) el.value = v;
    else el.innerHTML = v;
  },

  //Reads a value from the template. If it makes sense (is a number), pass that value back
  //to the calendar.
  reverseSet: function(key){
    var cal = this.get('calendar'),
        newVal = this.get(key);
    if (newVal != null) cal.set(key, newVal);
    else this.set(key, cal.get(key));
  },

  getTodayValue: function(){ return this.element.hasClassName('today'); },
  setTodayValue: function(b){ this.element[b ? 'addClassName' : 'removeClassName']('today'); },

  //Get the selected day. May be null.
  //If your template has disabled days this should be checked first because
  //the calendar will always have a date set but it might not be a settable one.
  //
  //var selectedDate = template.get('day') ? null : calendar.get('date');
  getDayValue: function(){
    var el = this.element.down('.week .day.selected');
    return el ? parseInt(el.innerHTML) : null;
  },
  //Sets the selected day.
  //
  //NOTE: Determines "settable" days by the presence of data-control="set-day" and
  //      data-control-param, with the selected day being the one for which
  //      data-control-param matches. If no day matching those criteria is
  //      found, no day is selected. This can be the case if the calendar's
  //      day is set to a disabled/non-settable day in the template, but
  //      the calendar will always have a day set even if the template doesn't.
  setDayValue: function(day){
    var current = this.element.down('.week .day.selected');
        next = this.element.select('.week .day[data-control=set-day]').find(function(el){
          return el.readAttribute('data-control-param') == day;
        });

    current && current.removeClassName('selected');
    next && next.addClassName('selected');
  },

  getHourValue: function(){ return this._readInt('hour'); },
  setHourValue: function(h){ this.setValueByElement('hour', this._padInt(h)); },

  getMinuteValue: function(){ return this._readInt('minute'); },
  setMinuteValue: function(h){ this.setValueByElement('minute', this._padInt(h)); },

  getSecondValue: function(){ return this._readInt('second'); },
  setSecondValue: function(h){ this.setValueByElement('second', this._padInt(h)); },

  getYearValue: function(){ return this._readInt('year'); },

  //TODO: get/setMonth is probably a little inefficient. "Works fast" may trump "just magically works".
  getMonthNamesValue: function(){
    var el = this.getElement('month');

    if (el && el.tagName.toLowerCase() == 'select') return el.select('option').pluck('innerHTML');
    else {
      var s = el && el.readAttribute('data-names');
      return s ? s.split(' ') : this.monthNames;
    }
  },
  setMonthNamesValue: function(m){
    var el = this.getElement('month');
    if (el && el.tagName.toLowerCase() == 'select') el.select('option').each(function(o,i){ o.innerHTML = m[i]; });
    else { el ? el.writeAttribute('data-names', m.join(' ')) : this.monthNames = m; }
  },

  getMonthValue: function(){
    var names = this.get('month_names'),
        n = names && names.indexOf(this.getValueByElement('month'));
    return n >= 0 ? n + 1 : null;
  },
  setMonthValue: function(n){
    var names = this.get('month_names');
    names && this.setValueByElement('month', names[n-1]);
  },

  defaultOptions: {
    fillBlanks: true, //Include days from prev&next months in first&last weeks
    sixWeeks: true //Always include 6 weeks to avoid calendar size changing all the time
  },

  init: function(element, calendar, options){
    this._super(element);
    this.controls = BetterCalendar.object(this.controls); //Allow instance-specific controls
    this.set('options', Object.extend(BetterCalendar.object(this.defaultOptions), options || {}));
    this.observe();
    this.set('calendar', calendar || new BetterCalendar.Calendar());
  },

  //Controls are executed when an element inside the template is clicked and its data-control
  //attribute has a corresponding control function.
  //<a data-control="Today">Today</a> will execute the 'today' control.
  //If a data-param attribute is present, its value will be passed to the control.
  //
  //You can add or override controls for a template object:
  //var t = new Template(element)
  //t.controls.say = function(what){ console.log(what); };
  //<a data-control="say" data-control-param="hello world">Say something</a>
  controls: {
    'prev-year': function(){ this.get('calendar').prevYear(); },
    'next-year': function(){ this.get('calendar').nextYear(); },
    'prev-month': function(){ this.get('calendar').prevMonth(); },
    'next-month': function(){ this.get('calendar').nextMonth(); },
    'prev-day': function(){ this.get('calendar').prevDay(); },
    'next-day': function(){ this.get('calendar').nextDay(); },
    'prev-hour': function(){ this.get('calendar').prevHour(); },
    'next-hour': function(){ this.get('calendar').nextHour(); },
    'prev-minute': function(){ this.get('calendar').prevMinute(); },
    'next-minute': function(){ this.get('calendar').nextMinute(); },
    'prev-second': function(){ this.get('calendar').prevSecond(); },
    'next-second': function(){ this.get('calendar').nextSecond(); },
    'today': function(){ this.get('calendar').setToday(); },
    'now': function(){ this.get('calendar').setNow(); },
    'today-now': function(){ var c=this.get('calendar'); c.set('date', new Date()) },
    'set-day': function(day){
      var c = this.get('calendar');
      c.set('day', parseInt(day));
      this.fire('date selected', c.get('date'));
    },
    'set-date': function(d){ //Set a new date. d is in y-m-d format, no 0 padding, m is 0-indexed
      var c = this.get('calendar'),
          dd = BetterCalendar.cloneDate(this.get('calendar').get('date')),
          els = d.split('-');
      c.set('date', new Date(parseInt(els[0]), parseInt(els[1]), parseInt(els[2]), dd.getHours(), dd.getMinutes(), dd.getSeconds()));
      this.fire('date selected', c.get('date'));
    },
    'disabled-day': function(day){} //Allows marking days as disabled/non-clickable. Doesn't do anything, but its presence will prevent default action on the target.
  },

  //Draw the dates in the current month (from the associated Calendar)
  //Finds the first .week element, duplicates it and fills in the dates.
  drawWeeks: function(){
    var that = this,
        el = that.get('element'),
        cal = that.get('calendar'),
        weekTemplate = this._weekTemplate || el.down('.week'),
        target;

    if (cal && weekTemplate){

      //Cache weekTemplate first time
      if (!this._weekTemplate) {
        //Detect where to insert week elements. Only done on first draw.
        if (weekTemplate.previous()) {//If no previous sibling, insert at top of parent element
          target = {position: 'after', element: weekTemplate.previous()};
        } else {//If there's a prev sibling, insert after it
          target = {position: 'top', element: weekTemplate.up()};
        }
        this._weekTemplate = weekTemplate;
        this._target = target;
      } else {
        target = this._target;
      }

      weekTemplate = $(weekTemplate.cloneNode(true));

      //Remove any week elements already in the target. If target.position is 'top', target.element
      //is the parent, otherwise it's a sibling, so do up() to get parent.
      (target.position == 'top' ? target.element : target.element.up()).select('.week').invoke('remove');

      this.getWeeks().reverse().each(function(week){
        var weekEl = weekTemplate.cloneNode(true),
            ins = {};
        ins[target.position] = weekEl;
        target.element.insert(ins);

        week.each(function(day, i){
          var dayEl = weekEl.down('.'+that.days[i % 7]); //.down('.mon')
          if (dayEl) that.drawDay(dayEl, day);
        });
      });

    }
  },

  //Returns an array of arrays representing each week in the current month.
  //Each week array has 7 Dates representing the week's days.
  //If options.fillBlanks, dates from the previous and next months in the
  //first and last weeks are included, otherwise they're null.
  //If options.sixWeeks (and fillBlanks), it will always return six weeks, the
  //additional week(s) being added to the end using dates from next month.
  getWeeks: function(){
    var opts = this.get('options'),
        weeks = [[]];
        week = weeks[0],
        startDate = BetterCalendar.cloneDate(this.get('calendar').get('date')),
        endDate = BetterCalendar.cloneDate(this.get('calendar').get('date')),
        currentMonth = startDate.getMonth();

    startDate.setDate(1);
    while (startDate.getDay() != 1) startDate.setDate(startDate.getDate()-1) //If first of month is not monday, go back to start of week (prev month)
    endDate.setDate(1); //Avoid overflow for e.g. jan 31 > feb (resulting in march 2 or 3)
    endDate.setMonth(endDate.getMonth()+1); //Skip to next month
    endDate.setDate(0); //Then go back to last day of current month
    while (endDate.getDay() != 0) endDate.setDate(endDate.getDate()+1) //If last of month is not sunday, go forward to end of week (next month)
    if (opts.fillBlanks && opts.sixWeeks) {
      //Keep adding dates until there are 42 days (6 weeks)
      while (BetterCalendar.numberOfDays(startDate, endDate) < 42) endDate.setDate(endDate.getDate()+1);
    }

    while (startDate <= endDate) {
      if (week.length == 7){
        week = [];
        weeks.push(week)
      }
      week.push(opts.fillBlanks || startDate.getMonth() == currentMonth ? startDate : null);
      startDate = BetterCalendar.cloneDate(startDate);
      startDate.setDate(startDate.getDate()+1);
    }

    return weeks;
  },

  //Override this to return true for dates that are disabled.
  //E.g. return d.getDay() == 6 || d.getDay() == 0; //Weekends
  isDayDisabled: function(d){ return false; },

  drawDay: function(el, d){
    if (d) {
      var opts = this.get('options'),
          dd = this._calendarDate;
          prevYear = d.getFullYear() < dd.getFullYear(),
          prevMonth = prevYear || d.getMonth() < dd.getMonth(),
          nextYear = d.getFullYear() > dd.getFullYear(),
          nextMonth = nextYear || d.getMonth() > dd.getMonth(),
          now = new Date(),
          today = d.getFullYear() == now.getFullYear() && d.getMonth() == now.getMonth() && d.getDate() == now.getDate();

      el.update(d.getDate());

      if (prevYear) el.addClassName('prev-year');
      if (prevMonth) el.addClassName('prev-month');
      if (nextYear) el.addClassName('next-year');
      if (nextMonth) el.addClassName('next-month');
      if (today) el.addClassName('today');

      if (this.isDayDisabled(d)) {
        el.writeAttribute('data-control', 'disabled-day');
        el.addClassName('disabled');
      } else if (prevMonth || nextMonth) {
        el.writeAttribute('data-control', 'set-date');
        el.writeAttribute('data-control-param', d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate());
      } else {
        el.writeAttribute('data-control', 'set-day');
        el.writeAttribute('data-control-param', ''+d.getDate());
      }

    } else {
      el.update();
      el.addClassName('empty');
    }
  },

  //Draw everything. Weeks, month name, year etc.
  draw: function(){
    var that = this,
        c = this.get('calendar');

    if (c) {
    //console.log(this.element);
    //console.time('draw');
      this.drawWeeks();
      ['year', 'month', 'day', 'hour', 'minute', 'second'].each(function(p){
        that.set(p, c.get(p));
      });
    //console.timeEnd('draw');
    }
  },

  observe: function(){
    var that = this,

        preventDefault = false,

        //Execute controls indicated by elements within the bubble range. That is,
        //between the event target and that.element.
        executeControls = function(e){
          var controls = [],
              el = e.element(),
              stop = that.element.up(), //Stop checking elements at that.element
              name, param, control;
          while (el != stop) {
            name = el.readAttribute('data-control');
            param = el.readAttribute('data-control-param');
            control = name && that.controls[name];
            if (control) controls.push([name, control, param]);
            el = el.up();
          }

          preventDefault = !!controls.length; //preventDefault only if >= 1 controls are found
          controls.each(function(c){
            c[1].call(that, c[2], e);
            that.fire('control executed', c[0], c[2]);
          });
        },

        isMouse = false,
        timeout = null, //Not sure if some browsers will choke on non-last var without assignment
        interval = null,
        html = $$('html')[0],

        //Simulate repeat-click when holding down button
        onMouseDown = function(e){
          html.observe('mouseup', onMouseUp);
          isMouse = true;
          executeControls(e); //First, "normal" click
          timeout = setTimeout(function(){//Then, after a second
            executeControls(e);//Execute again
            interval = setInterval(function(){//And then every 200ms after that
              executeControls(e);
            }, 200);
          }, 1000);
        },
        onMouseUp = function(e){//Until button is released
          clearTimeout(timeout);
          clearInterval(interval);
          html.stopObserving('mouseup', onMouseUp);
        },
        onClick = function(e){
          //If keyboard was used, execute control onclick because mousedown/up won't have been fired
          if (!isMouse) executeControls(e);
          isMouse = false;//Reset
          //Only prevent default if an action was executed
          if (preventDefault) e.preventDefault();
        },

        onBlur = function(e){
          var p = e.target.readAttribute('data-property'),
              form = e.target.getValue; //Form elements will have a getValue fn
          if (p && !form) that.reverseSet(p);
        },
        onChange = function(e){
          var p = e.target.readAttribute('data-property'),
              form = e.target.getValue; //Form elements will have a getValue fn
          if (p && form) that.reverseSet(p);
        },

        calendarDateChange = function(nd, od){
          that._calendarDate = nd; //Cache it
          if (nd.getFullYear() != od.getFullYear() || nd.getMonth() != od.getMonth()){
            that.draw(); //Only redraw everything when year or month has changed
          } else {
            if (nd.getDate() != od.getDate()) that.set('day', nd.getDate());
            if (nd.getHours() != od.getHours()) that.set('hour', nd.getHours());
            if (nd.getMinutes() != od.getMinutes()) that.set('minute', nd.getMinutes());
            if (nd.getSeconds() != od.getSeconds()) that.set('second', nd.getSeconds());
          }
        };

    this.element.observe('mousedown', onMouseDown);
    this.element.observe('click', onClick);
    this.element.addEventListener && this.element.addEventListener('blur', onBlur, true);
    this.element.observe('change', onChange);
    this.listen('element value changed', function(e, oe){
      that.draw();
      e.observe('mousedown', onMouseDown);
      e.observe('click', onClick);
      e.addEventListener && e.addEventListener('blur', onBlur, true);
      e.observe('change', onChange);
      oe.stopObserving('mousedown', onMouseDown);
      oe.stopObserving('click', onClick);
      oe.removeEventListener && oe.removeEventListener('blur', onBlur, true);
      oe.stopObserving('change', onChange);
    });

    this.listen('calendar value changed', function(cal, oldCal){
      that._calendarDate = cal.get('date'); //Cache it
      that.draw();
      oldCal && oldCal.stopListening('date value changed', calendarDateChange);
      cal && cal.listen('date value changed', calendarDateChange);
    });

    this.listen('day value changed', function(){
      this.set('today', this.get('calendar').isToday());
    });

    this.listen('month_names value changed', function(){
      this.set('month', this.get('calendar').get('month'));
    });
  }

});



/* Popup contains a Template that is floated above other elements and shown
 * when necessary. Trigger elements can be specified which will open up the
 * calendar when clicked. The popup will be positioned where the pointer was
 * registered. Clicking anywhere outside the popup closes it.
 *
 * Example:
 *
 * new Popup({openers:[$('open-calendar')], input:$('date-value')});
 *
 * Available options:
 *
 * - openers: An array of elements that will open the popup when clicked
 * - input: A single input element for which an InputBridge will be created
 * - selects: An array of select elements that will be passed on to a SelectBridge
 * - class: The class name of the container element [better-calendar]
 * - insertAt: The element into which the container will be inserted
 * - content: The content of the popup. This is essentially the content that
 *            will be used by the associated Template instance.
 */
BetterCalendar.Popup = Base.extend({

  setOrDefault: function(key, val, def){
    this.set(key, val === undefined ? def : val);
  },

  getCalendarValue: function(){ return this.get('template').get('calendar'); },
  setCalendarValue: function(c){ this.get('template').set('calendar', c); },

  getContentValue: function(){ return this.element.down; },
  setContentValue: function(t){ this.element.update(t); },

  getElementValue: function(){ return this.element; },
  setElementValue: function(e){ this.element = e; },

  getOpenersValue: function(){
    var o = this.values.openers
    if (!o) o = []; //Make sure
    else if (typeof o.length != 'number') o = [o]; //..it's an array
    return o;
  },

  init: function(options){
    options = options || {};
    this._super();
    this.setOrDefault('insertion_point', options.insertAt, document.body);
    if (options.opener) this.set('openers', [options.opener]);
    else if (options.openers) this.set('openers', options.openers);
    if (options.selects) this.set('selects', options.selects);
    if (options.input) this.set('input', options.input);
    this.setOrDefault('class', options['class'], 'better-calendar');
    this.set('element', this.buildContainer());
    this.set('content', options.content || this.buildContent());
    this.set('template', new BetterCalendar.Template(this.get('element'), options.calendar, options.template));
    this.get('insertion_point').insert(this.get('element'));
    this.observe();
  },

  isOpen: function(){ return this.element.visible(); },

  open: function(x, y){
    this.element.setStyle({'left':x+'px', 'top':y+'px'});
    this.element.show();
    this.get('openers').invoke('addClassName', 'active');
    this.fire('opened');
  },

  close: function(){
    this.element.hide();
    this.get('openers').invoke('removeClassName', 'active');
    this.fire('closed');
  },

  buildContainer: function(){
    return new Element('div', {'class':this.get('class'), style:'display:none; position:absolute; z-index:9001'});
  },

  //The default content of the popup unless otherwise is specified
  //TODO Make this a little better
  buildContent: function(){
    return '<table><thead>'+
      '<tr class="controls"><td colspan="7"><a href="#" class="control prev-year" data-control="prev-year">≤</a><a href="#" class="control prev-month" data-control="prev-month">&lt;</a>'+
      '<span class="month" data-names="Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec"></span>'+
      '<a href="#" class="control today" data-control="today">⊚</a><span class="year"></span>'+
      '<a href="#" class="control next-month" data-control="next-month">&gt;</a><a href="#" class="control next-year" data-control="next-year">≥</a></td></tr>'+
      '<tr class="weekdays"><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>'+
      '</thead><tbody><tr class="week">'+
      '<td><a href="#" class="day mon"></a></td>'+
      '<td><a href="#" class="day tue"></a></td>'+
      '<td><a href="#" class="day wed"></a></td>'+
      '<td><a href="#" class="day thu"></a></td>'+
      '<td><a href="#" class="day fri"></a></td>'+
      '<td><a href="#" class="day sat"></a></td>'+
      '<td><a href="#" class="day sun"></a></td>'+
      '</tr></tbody>'+
      '<tfoot><tr class="time"><td colspan="7">'+
      '<a href="#" class="control prev-minute" data-control="prev-minute">«</a>' +
      '<a href="#" class="control prev-hour" data-control="prev-hour">&lt;</a>' +
      '<span class="hour"></span><a href="#" class="control separator" data-control="now">:</a><span class="minute"></span>' +
      '<a href="#" class="control next-hour" data-control="next-hour">&gt;</a>' +
      '<a href="#" class="control next-minute" data-control="next-minute">»</a>'+
      '</td></tr></tfoot>'+
      '</table>';
  },

  //Returns the [x,y] for the container element's top and left attributes. This is called
  //when an opener element triggers opening, and it receives the event object.
  getPosition: function(e){
    return [e.pointerX()+20, e.pointerY()];
  },

  observe: function(){
    var openers = this.get('openers'),
        that = this,
        html = $$('html')[0];

    //Add a single delegating observer to <html>
    html.observe('click', function(e){
      var el = e.element(),
          target;

      //Move up the DOM until an interesting element is found
      while(!target) {
        if (el == that.element) { break; } //Click occured inside the popup, don't do anything
        else if (el == html) { target = 'close'; } //Click occured outside calendar, close if open
        else if (openers.any(function(o){ return el == o; })) { //Click occured inside an opener element
          e.preventDefault();
          target = that.isOpen() ? 'close' : 'open'; //If popup is open, this just a click outside the popup, so close it
        }
        else { el = el.up(); }
      }

      if (target == 'open') that.open.apply(that, that.getPosition(e));
      else if (target == 'close' && that.isOpen()) that.close();
    });

    if (this.get('selects')) { //For convenience, allow passing an array of selects to bridge with
      var bridge = BetterCalendar.object(BetterCalendar.SelectBridge.prototype);
      BetterCalendar.SelectBridge.apply(bridge, [this.get('calendar')].concat(this.get('selects')));
      this.set('select_bridge', bridge);
    }

    if (this.get('input')) { //Ditto for input
      this.set('input_bridge', new BetterCalendar.InputBridge(this.get('calendar'), this.get('input')));
    }
  }

});



//Updates a text (or hidden) input whenever the calendar's date changes
//Also parses the input value when it's changed and updates the calendar (probably doesn't work with hidden)
//Only works with the YYYY-MM-DD HH:MM:SS format. Not at all flexible. For now.
BetterCalendar.InputBridge = Base.extend({

  init: function(calendar, input){
    this._super();
    this.observe();
    this.set('calendar', calendar);
    this.set('input', input);
  },

  observe: function(){
    var that = this,
        dateChange = function(d){
          that.get('input').value = that.format(d);
        },
        onChange = function(e){
          var cal = that.get('calendar'),
              d = that.parse(that.get('input').value);
          if (d) cal.set('date', d);
          else dateChange(cal.get('date')); //Couldn't parse, reset
        };

    this.listen('calendar value changed', function(nc, oc){
      if (oc) oc.stopListening('date value changed', dateChange);
      if (nc) nc.listen('date value changed', dateChange);
    });

    this.listen('input value changed', function(ni, oi){
      if (oi) BetterCalendar.stopObserving(oi, 'change', onChange);
      if (ni) BetterCalendar.observe(ni, 'change', onChange);
    });
  },

  format: function(d){
    return d.getFullYear()+'-'+this._pad(d.getMonth()+1)+'-'+
      this._pad(d.getDate())+' '+this._pad(d.getHours())+':'+
      this._pad(d.getMinutes())+':'+this._pad(d.getSeconds());
  },

  parse: function(s){
    var m = s.match(/^(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)$/),
        v;

    if (m) {
      v = m.map(function(s){
        return parseInt(s.replace(/^0/, ''));
      });
      return new Date(v[1], v[2]-1, v[3], v[4], v[5], v[6]);
    } else {
      return false;
    }
  },

  _pad: function(num){
    return num < 10 ? '0'+num : ''+num;
  }

});



//Provides a bridge between select elements that represent a date and time and
//a calendar. Updates the selects when the calendar's date changes and vice versa.
//
//A SelectBridge will set the associated Calendar instance's date to that which is
//specified in the selects on load.
BetterCalendar.SelectBridge = Base.extend({

  _readSelect: function(name){
    var select = this.get(name+' select');
    return select && select.options[select.selectedIndex].value;
  },
  _writeSelect: function(name, value){
    var select = this.get(name+' select'),
        oldOption, newOption, i;
    //All this to avoid dependencies
    if (select) {
      oldOption = select.options[select.selectedIndex];
      for (i=0; i<select.options.length; i++) {
        if (select.options[i].value == value) {
          newOption = select.options[i]; //Found an option with the given value
          break;
        }
      }
      if (newOption) {
        select.selectedIndex = i;
        oldOption.removeAttribute('selected');
        newOption.setAttribute('selected', 'selected');
      }
    }
  },

  _readInt: function(name){
    var val = parseInt(this._readSelect(name));
    return isNaN(val) ? null : val;
  },

  getYearValue: function(){ return this._readInt('year'); },
  setYearValue: function(v){ this._writeSelect('year', v); },
  getMonthValue: function(){ return this._readInt('month'); },
  setMonthValue: function(v){ this._writeSelect('month', v); },
  getDayValue: function(){ return this._readInt('day'); },
  setDayValue: function(v){ this._writeSelect('day', v); },
  getHourValue: function(){ return this._readInt('hour'); },
  setHourValue: function(v){ this._writeSelect('hour', v); },
  getMinuteValue: function(){ return this._readInt('minute'); },
  setMinuteValue: function(v){ this._writeSelect('minute', v); },
  getSecondValue: function(){ return this._readInt('second'); },
  setSecondValue: function(v){ this._writeSelect('second', v); },

  getDateValue: function(){
    return new Date(this.get('year'), this.get('month')-1, this.get('day'), this.get('hour'), this.get('minute'), this.get('second'));
  },
  setDateValue: function(d){
    this.set('year', d.getFullYear());
    this.set('month', d.getMonth()+1);
    this.set('day', d.getDate());
    this.set('hour', d.getHours());
    this.set('minute', d.getMinutes());
    this.set('second', d.getSeconds());
  },

  init: function(calendar, year, month, day, hour, minute, second){
    this._super();
    this.observe();
    if (year) this.set('year select', year);
    if (month) this.set('month select', month);
    if (day) this.set('day select', day);
    if (hour) this.set('hour select', hour);
    if (minute) this.set('minute select', minute);
    if (second) this.set('second select', second);
    this.set('calendar', calendar);
  },

  //Follow an attribute that is a select element. Attaches and deattaches
  //a listener to the 'change' event.
  followSelect: function(name, callback){
    this.listen(name+' select value changed', function(n, o){
      if (o) BetterCalendar.stopObserving(o, 'change', callback); //Stop listening to the old element
      if (n) BetterCalendar.observe(n, 'change', callback); //Start listening to the new
    });
  },

  observe: function(){
    var that = this,
        dateChange = function(d){ that.set('date', d); };
    this.listen('calendar value changed', function(n, o){
      if (o) o.stopListening('date value changed', dateChange);
      if (n) {
        n.listen('date value changed', dateChange);
        n.set('date', that.get('date'));
      }
    });
    this.followSelect('year', function(){ that.get('calendar').set('year', that.get('year')); })
    this.followSelect('month', function(){ that.get('calendar').set('month', that.get('month')); })
    this.followSelect('day', function(){ that.get('calendar').set('day', that.get('day')); })
    this.followSelect('hour', function(){ that.get('calendar').set('hour', that.get('hour')); })
    this.followSelect('minute', function(){ that.get('calendar').set('minute', that.get('minute')); })
    this.followSelect('second', function(){ that.get('calendar').set('second', that.get('second')); })
  }

});
