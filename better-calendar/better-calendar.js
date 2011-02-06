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
  }

};


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
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  }

});






BetterCalendar.Template = ElementBase.extend({

  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],

  _parseInt: function(str){
    return parseInt(str.replace(/^0/, ''));
  },
  _padInt: function(i){
    return (i < 10 ? '0' : '') + i;
  },
  _readInt: function(key){
    var v = this.getValueByElement(key);
    return v && this._parseInt(v);
  },

  getTodayValue: function(){ return this.element.hasClassName('today'); },
  setTodayValue: function(b){ this.element[b ? 'addClassName' : 'removeClassName']('today'); },

  getDayValue: function(){
    var el = this.element.down('.week .day.selected');
    return el && parseInt(el.innerHTML);
  },
  setDayValue: function(day){
    var current = this.element.down('.week .day.selected');
        next = this.element.select('.week .day').find(function(el){
          return el.innerHTML == day;
        });
    current && current.removeClassName('selected');
    next && next.addClassName('selected');
  },

  getHourValue: function(){ return this._readInt('hour'); },
  setHourValue: function(h){ this.setValueByElement('hour', this._padInt(h)); },

  getMinuteValue: function(){ return this._readInt('minute'); },
  setMinuteValue: function(h){ this.setValueByElement('minute', this._padInt(h)); },

  getMonthNamesValue: function(){
    var el = this.getElement('month');
    return el ? el.readAttribute('data-names').split(' ') : this.values.month_names;
  },
  setMonthNamesValue: function(m){
    var el = this.getElement('month');
    el ? el.writeAttribute('data-names', m.join(' ')) : this.values.month_names = m;
  },

  getMonthValue: function(){
    var names = this.get('month_names');
    return names && names.indexOf(this.getValueByElement('month')) + 1;
  },
  setMonthValue: function(n){
    var names = this.get('month_names');
    names && this.setValueByElement('month', names[n-1]);
  },

  init: function(element, calendar){
    this._super(element);
    this.controls = BetterCalendar.object(this.controls); //Allow instance-specific controls
    this.observe();
    this.set('calendar', calendar || new BetterCalendar.Calendar());
  },

  //Controls are executed when an element inside the template is clicked and its data-control
  //attribute has a corresponding control function.
  //<a data-control="Today">Today</a> will execute the 'today' control.
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
    'today': function(){ this.get('calendar').setToday(); },
    'now': function(){ this.get('calendar').setNow(); },
    'today-now': function(){ var c=this.get('calendar'); c.set('date', new Date()) },
    'set-day': function(day){ this.get('calendar').set('day', parseInt(day)); }
  },

  executeControl: function(name){
    this.controls[name].apply(this, $A(arguments).slice(1));
  },

  drawWeeks: function(){
    var that = this,
        el = that.get('element'),
        cal = that.get('calendar'),
        weekTemplate = el.down('.week'),
        target;

    if (cal && weekTemplate){
      //Detect where to insert week elements.
      if (weekTemplate.previous()) {//If no previous sibling, insert at top of parent element
        target = {position: 'after', element: weekTemplate.previous()};
      } else {//If there's a prev sibling, insert after it
        target = {position: 'top', element: weekTemplate.up()};
      }
      weekTemplate = $(weekTemplate.cloneNode(true));

      //Remove any week elements already in the target. If target.position is 'top', target.element
      //is the parent, otherwise it's a sibling, so do up() to get parent.
      (target.position == 'top' ? target.element : target.element.up()).select('.week').invoke('remove');
      //Insert weeks, last week first because each week is inserted before the previous
      cal.get('weeks').reverse().each(function(week){
        var el = $(weekTemplate.cloneNode(true)),
            ins = {};
        ins[target.position] = el; //{top: el} or {after: el}
        target.element.insert(ins);
        //Insert days in week template
        week.each(function(day,i){
          var d = el.down('.'+that.days[i]);
          if (d) {
            d.removeClassName('selected');
            if (day) {
              d.update(day);
              d.writeAttribute('data-control', 'set-day');
              d.writeAttribute('data-control-param', day);
              d.removeClassName('empty');
            } else {
              d.update();
              d.addClassName('empty');
            }
          }
        });
      });
    }
  },

  draw: function(){
    var that = this,
        c = this.get('calendar');

    if (c) {
      this.drawWeeks();
      ['year', 'month', 'day', 'hour', 'minute'].each(function(p){
        that.set(p, c.get(p));
      });
    }
  },

  observe: function(){
    var that = this,

        executeControl = function(e){
          var target = e.element(),
              name = target.readAttribute('data-control'),
              param = target.readAttribute('data-control-param');
              control = name && that.controls[name];

          if (control) {
            preventDefault = true;
            param ? control.call(that, param) : control.call(that);
            that.fire('control executed', name, param);
          } else {
            preventDefault = false;
          }
        },

        isMouse = false,
        timeout = null, //Not sure if some browsers will choke on non-last var without assignment
        interval = null,
        html = $$('html')[0],

        //Simulate repeat-click when holding down button
        //TODO Make this more resistant. If mouseup for some reason happens outside this element it's not
        //     registered and the interval goes on forever
        onMouseDown = function(e){
          html.observe('mouseup', onMouseUp);
          isMouse = true;
          executeControl(e); //First, "normal" click
          timeout = setTimeout(function(){//Then, after a second
            executeControl(e);//Execute again
            interval = setInterval(function(){//And then every 200ms after that
              executeControl(e);
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
          if (!isMouse) executeControl(e);
          isMouse = false;//Reset
          //Only prevent default action if target was a control
          if (preventDefault) e.preventDefault();
        },

        calendarDateChange = function(nd, od){
          if (nd.getFullYear() != od.getFullYear() || nd.getMonth() != od.getMonth()){
            that.draw();
          } else {
            if (nd.getDate() != od.getDate()) that.set('day', nd.getDate());
            if (nd.getHours() != od.getHours()) that.set('hour', nd.getHours());
            if (nd.getMinutes() != od.getMinutes()) that.set('minute', nd.getMinutes());
          }
        };

    this.element.observe('mousedown', onMouseDown);
    this.element.observe('click', onClick);
    this.listen('element value changed', function(e, oe){
      that.draw();
      e.observe('mousedown', onMouseDown);
      e.observe('click', onClick);
      oe.stopObserving('mousedown', onMouseDown);
      oe.stopObserving('click', onClick);
    });

    this.listen('calendar value changed', function(cal, oldCal){
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




//TODO Old version of Template, remove
BetterCalendar.TemplateCalendar = Base.extend({

  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],

  getSelectedValue: function(){
    var el = this.templates.template.down('.week .day.selected');
    return el && parseInt(el.innerHTML);
  },
  setSelectedValue: function(day){
    var current = this.templates.template.down('.week .day.selected');
        next = this.templates.template.select('.week .day').find(function(el){
          return el.innerHTML == day;
        });
    current && current.removeClassName('selected');
    next && next.addClassName('selected');
  },

  init: function(t, c){
    this._super();
    //Inherit the prototype controls property so you can add a control to a single
    //instance without sharing it with all other instances because it's on the prototype
    this.controls = BetterCalendar.object(this.controls);
    this.observe();
    if (!c) c = new BetterCalendar.Calendar();
    this.set('template', t);
    this.set('calendar', c);
  },

  extractTemplates: function(template){
    var week = template.down('.week'),
        year = template.down('.year'),
        month = template.down('.month'),
        hour = template.down('.hour'),
        minute = template.down('.minute'),
        monthNames = month && (''+month.readAttribute('data-names')).split(' '),
        today = template.down('[data-control=today]'),
        weekInsertionPoint;

    if (week) {
      //Detect where to insert week elements.
      if (week.previous()) {//If no previous sibling, insert at top of parent element
        weekInsertionPoint = {position: 'after', element: week.previous()};
      } else {//If there's a prev sibling, insert after it
        weekInsertionPoint = {position: 'top', element: week.up()};
      }
      week = $(week.cloneNode(true));
    }

    return {template:template, week:week, weekInsertionPoint:weekInsertionPoint,
      year:year, month:month, monthNames:monthNames, today:today, hour:hour, minute:minute};
  },

  draw: function(){
    var that = this,
        cal = this.get('calendar'),
        target = this.templates.weekInsertionPoint,
        weekTemplate = this.templates.week;

    if (cal && target && weekTemplate) {
      //Remove any week elements already in the target. If target.position is 'top', target.element
      //is the parent, otherwise it's a sibling, so do up() to get parent.
      (target.position == 'top' ? target.element : target.element.up()).select('.week').invoke('remove');
      //Insert weeks, last week first because each week is inserted before the previous
      cal.get('weeks').reverse().each(function(week){
        var el = $(weekTemplate.cloneNode(true)),
            ins = {};
        ins[target.position] = el; //{top: el} or {after: el}
        target.element.insert(ins);
        //Insert days in week template
        week.each(function(day,i){
          var d = el.down('.'+that.days[i]);
          if (d && day) {
            d.update(day);
            d.writeAttribute('data-control', 'set-day');
            d.writeAttribute('data-control-param', day);
          } else if (d) {
            d.addClassName('empty');
          }
        });
      });
      this.set('selected', cal.get('day'));
      this.setYear(cal.get('year'));
      this.setMonth(cal.get('month'));
    }
    if (cal) {
      this.setHour(cal.get('hour'));
      this.setMinute(cal.get('minute'));
    }
  },

  setYear: function(y){
    this.templates.year && this.templates.year.update(y);
  },
  setMonth: function(m){
    this.templates.month && this.templates.monthNames && this.templates.month.update(this.templates.monthNames[m-1]);
  },
  setHour: function(h){
    if (h < 10) h = '0'+h;
    this.templates.hour && this.templates.hour.update(h);
  },
  setMinute: function(m){
    if (m < 10) m = '0'+m;
    this.templates.minute && this.templates.minute.update(m);
  },
  //TODO: Add seconds
  markToday: function(b){
    this.templates.today && this.templates.today[b ? 'addClassName' : 'removeClassName']('active');
  },

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
    'today': function(){ this.get('calendar').setToday(); },
    'now': function(){ this.get('calendar').setNow(); },
    'today-now': function(){ var c=this.get('calendar'); c.set('date', new Date()) },
    'set-day': function(day){ this.get('calendar').set('day', parseInt(day)); }
  },

  observe: function(){
    var that = this,

        executeControl = function(e){
          var target = e.element(),
              name = target.readAttribute('data-control'),
              param = target.readAttribute('data-control-param');
              control = name && that.controls[name];

          if (control) {
            preventDefault = true;
            param ? control.call(that, param) : control.call(that);
            that.fire('control executed', name, param);
          } else {
            preventDefault = false;
          }
        },

        isMouse = false,
        timeout = null, //Not sure if some browsers will choke on non-last var without assignment
        interval = null,

        //Simulate repeat-click when holding down button
        //TODO Make this more resistant. If mouseup for some reason happens outside this element it's not
        //     registered and the interval goes on forever
        onMouseDown = function(e){
          isMouse = true;
          executeControl(e); //First, "normal" click
          timeout = setTimeout(function(){//Then, after a second
            executeControl(e);//Execute again
            interval = setInterval(function(){//And then every 200ms after that
              executeControl(e);
            }, 200);
          }, 1000);
        },
        onMouseUp = function(e){//Until button is released
          clearTimeout(timeout);
          clearInterval(interval);
        },
        onClick = function(e){
          //If keyboard was used, execute control onclick because mousedown/up won't have been fired
          if (!isMouse) executeControl(e);
          isMouse = false;//Reset
          //Only prevent default action if target was a control
          if (preventDefault) e.preventDefault();
        },

        calendarDateChange = function(nd, od){
          if (nd.getFullYear() != od.getFullYear() || nd.getMonth() != od.getMonth()){
            that.draw();
          } else if (nd.getDate() != od.getDate()) {
            that.set('selected', nd.getDate());
          }
          if (nd.getHours() != od.getHours()) that.setHour(nd.getHours());
          if (nd.getMinutes() != od.getMinutes()) that.setMinute(nd.getMinutes());
        };

    this.listen('template value changed', function(t, ot){
      that.templates = that.extractTemplates(t);
      if (ot) ot.stopObserving('mousedown', onMouseDown);
      if (ot) ot.stopObserving('mouseup', onMouseUp);
      if (ot) ot.stopObserving('click', onClick);
      t.observe('mousedown', onMouseDown);
      t.observe('mouseup', onMouseUp);
      t.observe('click', onClick);
      that.draw();
    });

    this.listen('calendar value changed', function(cal, oldCal){
      that.draw();
      oldCal && oldCal.stopListening('date value changed', calendarDateChange);
      cal && cal.listen('date value changed', calendarDateChange);
    });

    this.listen('selected value changed', function(day){
      var cal = that.get('calendar');
      that.markToday(cal.isToday());
    });
  }

});



BetterCalendar.Popup = Base.extend({

  setOrDefault: function(key, val, def){
    this.set(key, val === undefined ? def : val);
  },

  getCalendarValue: function(){ return this.get('template_calendar').get('calendar'); },
  setCalendarValue: function(c){ this.get('template_calendar').set('calendar', c); },

  getTemplateValue: function(){ return this.element.down; },
  setTemplateValue: function(t){ this.element.update(t); },

  getElementValue: function(){ return this.element; },
  setElementValue: function(e){ this.element = e; },

  getOpenersValue: function(){
    var o = this.values.openers
    if (!o) o = [];
    else if (typeof o.length != 'number') o = [o];
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
    this.set('template', options.template || this.buildTemplate());
    this.set('template_calendar', new BetterCalendar.Template(this.get('element'), options.calendar));
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

  buildTemplate: function(){
    return '<table><thead>'+
      '<tr class="controls"><td colspan="7"><a href="#" class="control prev-year">≤</a><a href="#" class="control prev-month" data-control="prev-month">&lt;</a>'+
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

  observe: function(){
    var openers = this.get('openers'),
        that = this,
        html = $$('html')[0];

    html.observe('click', function(e){
      var el = e.element(),
          target;

      while(!target) {
        if (el == that.element) break;
        else if (el == html) target = 'close';
        else if (openers.any(function(o){ return el == o; })) { e.preventDefault(); target = that.isOpen() ? 'close' : 'open'; }
        else el = el.up();
      }

      if (target == 'open') that.open(e.pointerX()+20, e.pointerY());
      else if (target == 'close' && that.isOpen()) that.close();
    });

    if (this.get('selects')) {
      var bridge = BetterCalendar.object(BetterCalendar.SelectBridge.prototype);
      BetterCalendar.SelectBridge.apply(bridge, [this.get('calendar')].concat(this.get('selects')));
      this.set('select_bridge', bridge);
    }

    if (this.get('input')) {
      this.set('input_bridge', new BetterCalendar.InputBridge(this.get('calendar'), this.get('input')));
    }

    this.listen('template value changed', function(t){
      this.get('template_calendar').set('template', t);
    });
  }

});


//Updates a text (or hidden) input whenever the calendar's date changes
//Also parses the input value when it's changed and updates the calendar (probably doesn't work with hidden)
//Only works with the YYYY-MM-DD HH:MM:SS format. Not at all flexible.
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

  getDateValue: function(){
    return new Date(this.get('year'), this.get('month')-1, this.get('day'), this.get('hour'), this.get('minute'));
  },
  setDateValue: function(d){
    this.set('year', d.getFullYear());
    this.set('month', d.getMonth()+1);
    this.set('day', d.getDate());
    this.set('hour', d.getHours());
    this.set('minute', d.getMinutes());
  },

  init: function(calendar, year, month, day, hour, minute){
    this._super();
    this.observe();
    if (year) this.set('year select', year);
    if (month) this.set('month select', month);
    if (day) this.set('day select', day);
    if (hour) this.set('hour select', hour);
    if (minute) this.set('minute select', minute);
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
  }

});
