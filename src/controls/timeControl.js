
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

    this.title = L.DomUtil.create('p', 'time-slider-title', this._container);
    this.title.innerHTML = this.value;

    //var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._container);
    this.cursor = L.DomUtil.create('input', 'time-slider', this._container);
    this.cursor.type = "range";
    this.cursor.value = this.value;
    this.cursor.min = this.params.timeMin;
    this.cursor.max = this.params.timeMax;
    this.cursor.title = this.cursor.value;    

    //L.DomEvent.on(this.div, 'click', function(e) { this.paintParams.uiClick = true; }, this);
    L.DomEvent.addListener(this._container, 'hover', function(e) { alert("hello") });
    L.DomEvent.addListener(this._container, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this._container, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.disable(); } });
    L.DomEvent.addListener(this._container, 'mouseup', function(e) { L.DomEvent.stopPropagation(e); if(!me.paintParams.scrollDisable) { me.map.dragging.enable(); } });
    //L.DomEvent.addListener(this._container, 'mouseup', L.DomEvent.stop);

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
   * Set the value of the time control
   * @param {Number}               value                    The value
   */
  setValue(value)
  {
    this.value = value;

    this.cursor.value = value;

    this.title.innerHTML = DateConverter.numberToDate(this.value, this.params);

    this.layersManager.changeTime(value);
    //this.layersManager.layersControl.changeTime(value);
    this.layersManager.layersControl.changeSelectedZone();
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
      //this.cursor.title = this.cursor.value;
      //this.title.innerHTML = this.cursor.value;

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