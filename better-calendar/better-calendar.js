//A better date/time selector. WIP.
Calendar = Base.extend({

  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

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
  getMonthNameValue: function(){
    return this.monthNames[this.get('month')-1];
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

  getHourValue: function(){ return this.get('date').getHours(); },
  setHourValue: function(h){
    var d = this._cloneDate(this.get('date'));
    d.setHours(h);
    this.set('date', d);
  },

  getMinuteValue: function(){ return this.get('date').getMinutes(); },
  setMinuteValue: function(h){
    var d = this._cloneDate(this.get('date'));
    d.setMinutes(h);
    this.set('date', d);
  },

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

  _cloneDate: function(d){
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());
  }

});


CalendarRenderer = Base.extend({

  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

  labels: {
    prev_year: '◀',
    next_year: '▶',
    prev_month: '◀',
    next_month: '▶',
    today: 'Today'
  },

  attributeNotFound: function(name){
    var m, m2, label;
    if (m = name.match(/(.+)_label$/)) {
      if (m2 = m[1].match(/^month_(\d+)$/)) label = this.monthNames[m2[1]];
      else label = this.labels[m[1]];
    }
    return label;
  },

  init: function(c){
    this._super();
    if (!c) c = new Calendar();
    this.set('calendar', c);
  },

  draw: function(table){
    var calendar = this.get('calendar'),
        table = new Element('table', {id:'calendar'}),
        thead = new Element('thead'),
        selector = new Element('tr', {'class':'selector'}),
        year = new Element('td', {'class':'year', colspan:'3'}),
        prevYear = new Element('span', {'class':'prev'}).update(this.get('prev_year_label')),
        yearContainer = new Element('span', {'class':'container'}).update(calendar.get('year')),
        nextYear = new Element('span', {'class':'next'}).update(this.get('next_year_label')),
        today = new Element('td', {'class':'today'}).update(this.get('today_label')),
        month = new Element('td', {'class':'month', colspan:'3'}),
        prevMonth = new Element('span', {'class':'prev'}).update(this.get('prev_month_label')),
        monthContainer = new Element('span', {'class':'container'}).update(calendar.get('month_name')),
        nextMonth = new Element('span', {'class':'next'}).update(this.get('next_month_label')),
        tbody = new Element('tbody', {'class':'dates'});

    prevYear.observe('click', function(){ calendar.prevYear(); });
    nextYear.observe('click', function(){ calendar.nextYear(); });
    today.observe('click', function(e){
      if (e.detail == 2) {//Second click in a double click
        calendar.fire('im done get me outta here');
      } else {//First click, whether it's double or not
        calendar.set('date', new Date());
        calendar.fire('date selected', calendar.get('date'));
      }
    });
    prevMonth.observe('click', function(){ calendar.prevMonth(); });
    nextMonth.observe('click', function(){ calendar.nextMonth(); });
    calendar.listen('date value changed', function(){ yearContainer.update(calendar.get('year')); monthContainer.update(calendar.get('month_name')); });

    year.insert(prevYear).insert(yearContainer).insert(nextYear);
    month.insert(prevMonth).insert(monthContainer).insert(nextMonth);
    selector.insert(year).insert(today).insert(month);
    thead.insert(selector);
    thead.insert('<tr class="weekdays"><td>M</td><td>T</td><td>W</td><td>T</td><td>F</td><td>S</td><td>S</td></tr>');

    table.insert(thead);
    this.drawDates(tbody);
    table.insert(tbody);

    calendar.listen('date value changed', function(nd, od){
      tbody.update();
      this.drawDates(tbody);
    }, this);

    return table;
  },

  drawDates: function(table){
    var calendar = this.get('calendar'),
        tds = {},
        current;

    calendar.get('weeks').each(function(week){
      var tr = new Element('tr', {'class':'week'});
      week.each(function(day){
        var td = new Element('td');
        tds[day] = td;
        td.update(day || '');
        if (day) {
          td.addClassName('day');
          td.observe('click', function(e){
            e.stop();
            if (e.detail == 2) {//Second click in a double click
              calendar.fire('im done get me outta here');
            } else {//First click, whether it's double or not
              calendar.set('day', day);
              calendar.fire('date selected', calendar.get('date'));
            }
          });
        }
        tr.insert(td);
      });
      table.insert(tr);
    });

    current = tds[calendar.get('day')];
    current.addClassName('selected');
    calendar.listen('day value changed', function(d){
      current.removeClassName('selected');
      current = tds[d];
      current.addClassName('selected');
    });
  }

});


TemplateCalendar = Base.extend({

  days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
  
  getSelectedValue: function(){
    var el = this.templates.weeksParent && this.templates.weeksParent.down('.day.selected');
    return el && parseInt(el.innerHTML);
  },
  setSelectedValue: function(day){
    if (this.templates.weeksParent) {
      var current = this.templates.weeksParent.down('.day.selected');
          next = this.templates.weeksParent.select('.day').find(function(el){
            return el.innerHTML == day;
          });
      current && current.removeClassName('selected');
      next && next.addClassName('selected');
    }
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
        weeksParent = week && week.up(),
        year = template.down('.year'),
        month = template.down('.month'),
        monthNames = month && (''+month.readAttribute('data-names')).split(' ');
    week = week && $(week.cloneNode(true));

    return {week:week, weeksParent:weeksParent, year:year, month:month, monthNames:monthNames};
  },
  
  buildWeeks: function(weeks, weekTemplate){
    var that = this;

    return weeks.map(function(week){
      var el = $(weekTemplate.cloneNode(true));
      week.each(function(day,i){
        var d = el.down('.'+that.days[i]);
        d && d.update(day);
      });
      return el;
    });
  },
  
  drawWeeks: function(){
    var cal = this.get('calendar'),
        target = this.templates.weeksParent,
        week = this.templates.week;

    if (cal && target && week) {
      target.update();
      this.buildWeeks(cal.get('weeks'), week).each(function(wk){
        target.insert(wk);
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


  observe: function(){
    var that = this,

        onClick = function(e){
          var target = e.element(),
              cal = that.get('calendar'),
              el;
          if (target.up('.week') && (target.hasClassName('day') || target.up('.day'))) {
            el = target.hasClassName('day') ? target : target.up('.day');
            if (el.innerHTML) that.set('selected', parseInt(el.innerHTML));
          } else if (target.hasClassName('select-today') || target.up('.select-today')) {
            cal.set('date', new Date());
          } else if (target.hasClassName('prev-month') || target.up('.prev-month')) {
            cal.prevMonth();
          } else if (target.hasClassName('next-month') || target.up('.next-month')) {
            cal.nextMonth();
          } else if (target.hasClassName('prev-year') || target.up('.prev-year')) {
            cal.prevYear();
          } else if (target.hasClassName('next-year') || target.up('.next-year')) {
            cal.nextYear();
          }
        },

        calendarDateChange = function(nd, od){
          if (nd.getFullYear() != od.getFullYear() || nd.getMonth() != od.getMonth()){
            that.drawWeeks();
          } else if (nd.getDate() != od.getDate()) {
            that.set('selected', nd.getDate());
          }
        };

    this.listen('template value changed', function(t){
      that.templates = that.extractTemplates(t);
      t.observe('click', onClick);
      that.drawWeeks();
    });

    this.listen('calendar value changed', function(cal, oldCal){
      that.drawWeeks();
      oldCal && oldCal.stopListening('date value changed', calendarDateChange);
      cal && cal.listen('date value changed', calendarDateChange);
    });

    this.listen('selected value changed', function(day){
      that.get('calendar').set('day', day);
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
  
  getDateValue: function(){
    return new Date(this.get('year'), this.get('month')-1, this.get('day'));
  },
  setDateValue: function(d){
    this.set('year', d.getFullYear());
    this.set('month', d.getMonth()+1);
    this.set('day', d.getDate());
  },

  init: function(calendar, year, month, day){
    this._super();
    this.observe();
    if (year) this.set('year select', year);
    if (month) this.set('month select', month);
    if (day) this.set('day select', day);
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
  }

});
