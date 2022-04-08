
/*
 * Time Controller
 */
var TimeControl = L.Control.extend({  

  /*
   * Options
   */
  options: {
    position: 'bottomright'
  },
 
  /*
   * Init the Time Control
   * @property {Params}                params                  The settings
   */
  initialize(options) 
  {
    this.params = options.params;
    this.layersManager = options.layersManager;
    this.paintParams = options.paintParams;
    this.value = this.params.timeMin;
    this.labelDate = options.labelDate;
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd(map) 
  {
    this.map = map;
    let me = this;

    this._container = L.DomUtil.create('div', 'time-control');

    this.leftButton = L.DomUtil.create('img', 'timeControl-change-img', this._container);
    this.leftButton.src = "img/menu/caret-left-solid.svg";
    this.leftButton.title = Dictionary.get("MAP_TIME_LAST");

    L.DomEvent.addListener(this.leftButton, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.leftButton, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.leftButton, 'mouseup', L.DomEvent.stop);

    this.rightButton = L.DomUtil.create('img', 'timeControl-change-img', this._container);
    this.rightButton.src = "img/menu/caret-right-solid.svg";
    this.rightButton.title = Dictionary.get("MAP_TIME_NEXT");

    L.DomEvent.addListener(this.rightButton, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.rightButton, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.rightButton, 'mouseup', L.DomEvent.stop);

    this.timeAreaButton = L.DomUtil.create('img', 'timeControl-change-img', this._container);
    this.timeAreaButton.src = "img/menu/calendar-days-solid.svg";
    this.timeAreaButton.title = Dictionary.get("MAP_TIMEAREA_DESCRIPTION");

    L.DomEvent.addListener(this.timeAreaButton, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.timeAreaButton, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.timeAreaButton, 'mouseup', L.DomEvent.stop);

    this.title = L.DomUtil.create('p', 'time-slider-title', this._container);
    this.title.innerHTML = this.value;

    //var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._container);
    this.cursor = L.DomUtil.create('input', 'time-slider', this._container);
    this.cursor.type = "range";
    this.cursor.id = "time-slider";
    this.cursor.value = this.value;
    this.cursor.min = this.params.timeMin;
    this.cursor.max = this.params.timeMax;

    L.DomEvent.addListener(this.cursor, 'click', function(e) { this.paintParams.uiClick = true; }, this);

    L.DomEvent.addListener(this._container, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this._container, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.disable(); } });
    L.DomEvent.addListener(this._container, 'mouseup', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.enable(); } });

    L.DomEvent.on(this.rightButton, 'click', function(e) { this.moveWithButton(true); this.paintParams.uiClick = true; }, this);
    L.DomEvent.on(this.leftButton, 'click', function(e) { this.moveWithButton(false); this.paintParams.uiClick = true; }, this);
    L.DomEvent.on(this.timeAreaButton, 'click', function(e) { this.moveWithButton(false); this.initTimeAreaForm(); }, this);

    L.DomEvent.on(this.cursor, 'input change', this.changeValue, this);

    return this._container;
  },

  /*
   * Redraw for lang change
   */
  redraw()
  {
    this.leftButton.title = Dictionary.get("MAP_TIME_LAST");
    this.rightButton.title = Dictionary.get("MAP_TIME_NEXT");
    this.timeAreaButton.title = Dictionary.get("MAP_TIMEAREA_DESCRIPTION");
  },

  /*
   * Init the form for launch timeArea - display a dialog
   */
  initTimeAreaForm()
  {
    let me = this;

    $("#dialog-time-area").prop("title", Dictionary.get("MAP_TIMEAREA_TITLE"));

    let content = `<p>${Dictionary.get("MAP_TIMEAREA_DESCRIPTION")}</p>
                  <div id="dialog-timeArea-start-div"><label for="dialog-timeArea-start">${Dictionary.get("MAP_TIMEAREA_START_DATE")}</label><input id="dialog-timeArea-start" type="text" style="width: 200px;"><br/><br/></div>
                  <div id="dialog-timeArea-end-div"><label for="dialog-timeArea-end">${Dictionary.get("MAP_TIMEAREA_END_DATE")}</label><input id="dialog-timeArea-end" type="text" style="width: 200px;"><br/><br/></div>`;

    $("#dialog-time-area").html(content);

    me.dialogTimeArea = $("#dialog-time-area").dialog({
      autoOpen: false,
      height: 300,
      width: 400,
      modal: true,
      buttons: {
        Cancel: function() {
          me.dialogTimeArea.dialog( "close" );
        },
        OK: function() {
          me.launchTimeArea();
        }
      },
      close: function() {
        me.dialogTimeArea.dialog( "close" );
      }
    });

    me.dialogTimeArea.dialog( "open" );
  },

  /*
   * launch time area update visibility
   */
  launchTimeArea()
  {
    let startDateStr = $("#dialog-timeArea-start").val();
    let endDateStr = $("#dialog-timeArea-end").val();
    let startDate = null;
    let endDate = null;

    if(DateConverter.checkDateValid(startDateStr) && startDateStr != "")
    {
      startDate = DateConverter.dateToNumber(startDateStr, false, this.params);
    }
    else
    {
      alert(Dictionary.get("MAP_MARKER_START_DATE_INVALID"))
    }

    if(DateConverter.checkDateValid(endDateStr) && endDateStr != "")
    {
      endDate = DateConverter.dateToNumber(endDateStr, true, this.params);
    }
    else
    {
      alert(Dictionary.get("MAP_MARKER_END_DATE_INVALID"));
    }

    if(startDate != null && endDate != null)
    {
      if(endDate >= startDate)
      {
        this.dialogTimeArea.dialog( "close" );

        // markers
        this.setValue(startDate);
        this.layersManager.displayTimeArea(startDate, endDate);
      }
      else
      {
        alert(Dictionary.get("MAP_TIMEAREA_END_DATE_GREATER_START_DATE"));
      }
    }
  },

  /*
   * Change the value
   * @param {Event}               e                    The event with slider value
   */
  changeValue(e)
  {
    let value = e.target.valueAsNumber;

    this.setValue(value);
  },

  /*
   * Change the value with move buttons
   * @param {Boolean}               right                    True if move with the right button, false for left button
   */
  moveWithButton(right)
  {
    let targetValue = 0;

    if(right)
    {
      targetValue = DateConverter.dateToNumber(this.params.timeMax, true, this.params);
    }
    else
    {
      targetValue = DateConverter.dateToNumber(this.params.timeMin, false, this.params);
    }

    // paintZones
    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      for(let j = 0; j < this.layersManager.layerGroups[i].paintZones.length; j++)
      {
        if(right)
        {
          let startDate = this.layersManager.layerGroups[i].paintZones[j].startDate;
          if(startDate > this.value && startDate < targetValue)
          {
            targetValue = startDate;
          }
        }
        else
        {
          let endDate = this.layersManager.layerGroups[i].paintZones[j].endDate;
          if(endDate < this.value && endDate > targetValue)
          {
            targetValue = endDate;
          }
        }
      }
    }

    // markers
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      if(right)
      {
        let startDate = this.layersManager.markers[i].startDate;
        if(startDate > this.value && startDate < targetValue)
        {
          targetValue = startDate;
        }
      }
      else
      {
        let endDate = this.layersManager.markers[i].endDate;
        if(endDate < this.value && endDate > targetValue)
        {
          targetValue = endDate;
        }
      }
    }

    this.setValue(targetValue);
  },

  /*
   * Disable the left button if not time to change
   */
  checkDisableLeftButton()
  {
    let targetValue = DateConverter.dateToNumber(this.params.timeMin, false, this.params);

    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      for(let j = 0; j < this.layersManager.layerGroups[i].paintZones.length; j++)
      {
        let endDate = this.layersManager.layerGroups[i].paintZones[j].endDate;
        if(endDate < this.value && endDate > targetValue)
        {
          targetValue = endDate;
        }
      }
    }

    // markers
    for(let i = 0; i < this.layersManager.markers.length; i++)
    { 
      let endDate = this.layersManager.markers[i].endDate;
      if(endDate < this.value && endDate > targetValue)
      {
        targetValue = endDate;
      }
    }

    if(targetValue == this.value)
    {
      L.DomUtil.addClass(this.leftButton, 'timeControl-change-img-disable');
      
    }
    else
    {
      L.DomUtil.removeClass(this.leftButton, 'timeControl-change-img-disable');
    }
  },

  /*
   * Disable the right button if not time to change
   */
  checkDisableRightButton()
  {
    let targetValue = DateConverter.dateToNumber(this.params.timeMax, true, this.params);

    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      for(let j = 0; j < this.layersManager.layerGroups[i].paintZones.length; j++)
      {
        let startDate = this.layersManager.layerGroups[i].paintZones[j].startDate;
        if(startDate > this.value && startDate < targetValue)
        {
          targetValue = startDate;
        }
      }
    }

    // markers
    for(let i = 0; i < this.layersManager.markers.length; i++)
    { 
      let startDate = this.layersManager.markers[i].startDate;
      if(startDate > this.value && startDate < targetValue)
      {
        targetValue = startDate;
      }
    }

    if(targetValue == this.value)
    {
      L.DomUtil.addClass(this.rightButton, 'timeControl-change-img-disable');
    }
    else
    {
      L.DomUtil.removeClass(this.rightButton, 'timeControl-change-img-disable');
    }
  },

  /*
   * Set the value of the time control
   * @param {Number}               value                    The value
   */
  setValue(value)
  {
    this.value = value;

    this.cursor.value = value;

    this.title.innerHTML = DateConverter.numberToDate(this.value, this.params);

    this.layersManager.changeTime(value);
    this.layersManager.layersControl.changeSelectedZone();

    this.labelDate.display(this.value);

    this.checkDisableLeftButton();
    this.checkDisableRightButton();


  },

  /*
   * Update cursor from params
   */
  updateFromParams()
  {
    if(this.params.timeEnable)
    {
      let minStr = this.params.timeMin;
      let maxStr = this.params.timeMax;
      
      let min = DateConverter.dateToNumber(minStr, false, this.params);
      let max = DateConverter.dateToNumber(maxStr, true, this.params);

      let value = min;

      this.value = value;
      this._container.style = "display : inline-block";
      this.cursor.min = min;
      this.cursor.max = max;
      this.cursor.value = value;

      this.setValue(value);

      this.layersManager.changeTime(value);

      // Get size of time bar
      if(this.params.timeBarBigSize)
      {
        $(".time-slider").css("width", "600px");
      }
      else
      {
        $(".time-slider").css("width", "300px");
      }
    }
    else
    {
      this._container.style = "display : none";
      this.layersManager.changeSelectZoneWithoutTime();
    }
  }
});