
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
    this.leftButton.title = "Déplacer vers l'événement précédent";

    this.rightButton = L.DomUtil.create('img', 'timeControl-change-img', this._container);
    this.rightButton.src = "img/menu/caret-right-solid.svg";
    this.rightButton.title = "Déplacer vers l'événement suivant";

    this.title = L.DomUtil.create('p', 'time-slider-title', this._container);
    this.title.innerHTML = this.value;

    //var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._container);
    this.cursor = L.DomUtil.create('input', 'time-slider', this._container);
    this.cursor.type = "range";
    this.cursor.value = this.value;
    this.cursor.min = this.params.timeMin;
    this.cursor.max = this.params.timeMax;

    L.DomEvent.addListener(this._container, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this._container, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.disable(); } });
    L.DomEvent.addListener(this._container, 'mouseup', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.enable(); } });

    L.DomEvent.on(this.rightButton, 'click', function(e) { this.moveWithButton(true) }, this);
    L.DomEvent.on(this.leftButton, 'click', function(e) { this.moveWithButton(false) }, this);

    L.DomEvent.on(this.cursor, 'input change', this.changeValue, this);

    return this._container;
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
    }
    else
    {
      this._container.style = "display : none";
      this.layersManager.changeSelectZoneWithoutTime();
    }
  }
});