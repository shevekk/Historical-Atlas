
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

    //var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._container);
    this.cursor = L.DomUtil.create('input', 'time-slider', this._container);
    this.cursor.type = "range";
    this.cursor.value = this.value;
    this.cursor.min = this.params.timeMin;
    this.cursor.max = this.params.timeMax;
    this.cursor.title = this.cursor.value;

    this.title = L.DomUtil.create('p', 'time-slider-title', this._container);
    this.title.innerHTML = this.cursor.value;

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

    this.cursor.title =  value;
    this.title.innerHTML = this.value;
    this.cursor.value = value;

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
      this.value = this.params.timeMin;
      this._container.style = "display : inline-block";
      this.cursor.min = this.params.timeMin;
      this.cursor.max = this.params.timeMax;
      this.cursor.value = this.params.timeMin;
      this.cursor.title = this.cursor.value;
      this.title.innerHTML = this.cursor.value;

      this.layersManager.changeTime(this.params.timeMin);
    }
    else
    {
      this._container.style = "display : none";
      this.layersManager.changeSelectZoneWithoutTime();
    }
  }
});