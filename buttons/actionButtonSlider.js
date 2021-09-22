
class ActionButtonSlider extends ActionButton
{
  /*
   * Button of manage load file
   * @property {L.Dom}             cursor                Cursor component (input slider)
   * @property {L.Dom}             _menu                 The menu div of choose file
   * @param {L.Dom}                container             The contener element
   * @param {String}               imgSrc                The image src
   * @param {String}               title                 The button title 
   * @param {Function}             functionChange        The function call when slider value change
   * @param {Number}               minValue              Min value of the slider
   * @param {Number}               maxValue              Max value of the slider
   * @param {Number}               value                 Default value of the slider
   * @param {PaintLayer}           paintParams           The paint parameters
   */
  constructor(container, imgSrc, title, functionChange, minValue, maxValue, value, paintParams)
  {
    super(container, imgSrc, title, null, 'a', 'action-button');

    this._menu = L.DomUtil.create('div', 'leaflet-bar leaflet-control-div-slider', container);
    L.DomEvent.disableClickPropagation(this._menu);

    var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._menu);
    this.cursor = L.DomUtil.create('input', '', menuContent);
    this.cursor.type = "range";
    this.cursor.value = value;
    this.cursor.min = minValue;
    this.cursor.max = maxValue;
    
    L.DomEvent.on(this.cursor, 'input change', functionChange, this);
    L.DomEvent.on(this.buttonDom, 'click', function(e) { paintParams.uiClick = true; this._clickRangeButton(e) }, this);
  }

  /* 
   * Click in a range button
   * @param {Event}               e                    The event
   */
  _clickRangeButton(e)
  {
    if (!L.DomUtil.hasClass(this._menu, 'leaflet-control-div-slider-open')) {
        this._openMenu();
    } else {
        this._closeMenu();
    }
  }
  
  /* 
   * Open a UI menu
   */
  _openMenu() {
      L.DomUtil.addClass(this._menu, "leaflet-control-div-slider-open");
  }

  /* 
   * Close a UI menu
   */
  _closeMenu() {
      L.DomUtil.removeClass(this._menu, "leaflet-control-div-slider-open");
  }

  /* 
   * Set the cursor value
   * @param {String}          value                The cursor value
   */
  setValue(value)
  {
    this.cursor.value = value;
  }
}