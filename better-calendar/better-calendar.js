//A better date/time selector. WIP.
Calendar = Base.extend({

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



TemplateCalendar = Base.extend({

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
    this.observe();
    if (!c) c = new Calendar();
    this.set('template', t);
    this.set('calendar', c);
  },
  
  extractTemplates: function(template){
    var week = template.down('.week'),
        year = template.down('.year'),
        month = template.down('.month'),
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
      year:year, month:month, monthNames:monthNames, today:today};
  },
  
  buildWeeks: function(weeks, weekTemplate){
    var that = this;

    return weeks.map(function(week){
      var el = $(weekTemplate.cloneNode(true));
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
      return el;
    });
  },
  
  drawWeeks: function(){
    var cal = this.get('calendar'),
        target = this.templates.weekInsertionPoint,
        week = this.templates.week;

    if (cal && target && week) {
      //Remove any week elements already in the target. If target.position is 'top', target.element
      //is the parent, otherwise it's a sibling, so do up() to get parent.
      (target.position == 'top' ? target.element : target.element.up()).select('.week').invoke('remove');
      //Insert weeks, last week first because each week is inserted before the previous
      this.buildWeeks(cal.get('weeks'), week).reverse().each(function(wk){
        var ins = {};
        ins[target.position] = wk; //{top: wk} or {after: wk}
        target.element.insert(ins);
      });
      this.set('selected', cal.get('day'));
      this.setYear(cal.get('year'));
      this.setMonth(cal.get('month'));
    }
  },
  
  setYear: function(y){
    this.templates.year && this.templates.year.update(y);
  },
  setMonth: function(m){
    this.templates.month && this.templates.monthNames && this.templates.month.update(this.templates.monthNames[m-1]);
  },
  setHour: function(h){
    this.templates.hour && this.templates.hour.update(h);
  },
  setMinute: function(m){
    this.templates.minute && this.templates.minute.update(m);
  },
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
    'today': function(){ this.get('calendar').set('date', new Date()); },
    'set-day': function(day){ this.get('calendar').set('day', parseInt(day)); }
  },


  observe: function(){
    var that = this,

        executeControl = function(e){
          var target = e.element(),
              control = target.readAttribute('data-control'),
              param = target.readAttribute('data-control-param');

          control = control && that.controls[control];

          if (control) param ? control.call(that, param) : control.call(that);
        },

        timeout = null, //Not sure if some browsers will choke on non-last var without assignment
        interval = null,

        //Simulate repeat-click when holding down button
        //TODO: Does this work with kb?
        onMouseDown = function(e){
          executeControl(e); //First, "normal" click
          timeout = setTimeout(function(){//Then, after a second
            executeControl(e);//Execute again
            interval = setInterval(function(){//And then every 200ms after that
              executeControl(e);
            }, 200);
          }, 1000);
        },
        onMouseUp = function(){//Until button is released
          clearTimeout(timeout);
          clearInterval(interval);
        },

        calendarDateChange = function(nd, od){
          if (nd.getFullYear() != od.getFullYear() || nd.getMonth() != od.getMonth()){
            that.drawWeeks();
          } else if (nd.getDate() != od.getDate()) {
            that.set('selected', nd.getDate());
          }
        };

    this.listen('template value changed', function(t, ot){
      that.templates = that.extractTemplates(t);
      if (ot) ot.stopObserving('mousedown', onMouseDown);
      if (ot) ot.stopObserving('mouseup', onMouseUp);
      t.observe('mousedown', onMouseDown);
      t.observe('mouseup', onMouseUp);
      that.drawWeeks();
    });

    this.listen('calendar value changed', function(cal, oldCal){
      that.drawWeeks();
      oldCal && oldCal.stopListening('date value changed', calendarDateChange);
      cal && cal.listen('date value changed', calendarDateChange);
    });

    this.listen('selected value changed', function(day){
      var cal = that.get('calendar');
      cal.set('day', day);
      console.log(cal.get('date'));
      that.markToday(cal.isToday());
    });
  }

});


//2 way
InputBridge = Base.extend();

//ditto
SelectBridge = Base.extend({

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

  getYearValue: function(){ return parseInt(this._readSelect('year')); },
  setYearValue: function(v){ this._writeSelect('year', v); },
  getMonthValue: function(){ return parseInt(this._readSelect('month')); },
  setMonthValue: function(v){ this._writeSelect('month', v); },
  getDayValue: function(){ return parseInt(this._readSelect('day')); },
  setDayValue: function(v){ this._writeSelect('day', v); },
  getHourValue: function(){ return parseInt(this._readSelect('hour')); },
  setHourValue: function(v){ this._writeSelect('hour', v); },
  getMinuteValue: function(){ return parseInt(this._readSelect('minute')); },
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
      if (o) o.stopObserving('change', callback); //Stop listening to the old element
      if (n) n.observe('change', callback); //Start listening to the new
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
