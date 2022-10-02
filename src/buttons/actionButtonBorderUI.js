
class ActionButtonBorderIU extends ActionButton
{
  /*
   * Button of manage Slider
   * @property {L.Dom}             cursor                Cursor component (input slider)
   * @property {L.Dom}             _menu                 The menu div of choose file
   * @param {L.Dom}                container             The contener element
   * @param {String}               imgSrc                The image src
   * @param {String}               title                 The button title 
   * @param {LayersManager}        layersManager         The Layers Manager
   * @param {LayersControl}        layersControl         The Layers Control
   * @param {PaintLayer}           paintParams           The paint parameters
   */
  constructor(container, imgSrc, title, layersManager, layersControl, paintParams)
  {
    super(container, imgSrc, title, null, 'a', 'action-button');

    let me = this;

    me.layersManager = layersManager;
    me.layersControl = layersControl;

    // Create menu
    this._menu = L.DomUtil.create('div', 'leaflet-bar leaflet-control-div-slider', container);
    L.DomEvent.disableClickPropagation(this._menu);
    this.menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._menu);
    this.menuContent.style = "width : 270px;height : 130px;";

    // Image for close the UI
    this.closeImg = L.DomUtil.create('img', '', this.menuContent);
    this.closeImg.src = "img/actions/times-solid.svg";
    this.closeImg.style = "float:right;width : 18px;height : 18px;margin-right:10px;";
    L.DomEvent.on(this.closeImg, 'click', () => {me._closeMenu()}, this);

    // Cursor for change size
    this.divSize = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this.menuContent);
    this.divSize.style = "display : flex";
    this.textSize = L.DomUtil.create('p', '', this.divSize);
    this.textSize.innerHTML = Dictionary.get("MAP_ACTIONS_BORDER_SIZE");
    this.cursorSize = L.DomUtil.create('input', '', this.divSize);
    this.cursorSize.type = "range";
    this.cursorSize.value = 0;
    this.cursorSize.min = 0;
    this.cursorSize.max = 10;
    L.DomEvent.on(this.cursorSize, 'input change', function(e) { paintParams.uiClick = true; this._changeSize(e) }, this);

    // Enable color change or same color for border
    let sameColorCheckBoxDiv = L.DomUtil.create('div', '', this.menuContent);
    sameColorCheckBoxDiv.style = "display: flex; align-items: center;";
    this.sameColorCheckBox = L.DomUtil.create('input', '', sameColorCheckBoxDiv);
    this.sameColorCheckBox.type = "checkbox";
    this.sameColorCheckBox.style = "margin-right:5px;";
    let sameColorLabel = L.DomUtil.create('label', '', sameColorCheckBoxDiv);
    sameColorLabel.innerHTML = Dictionary.get("MAP_ACTIONS_BORDER_PERSO_LABEL");
    L.DomEvent.on(this.sameColorCheckBox, 'input change', function(e) { paintParams.uiClick = true; this._changeCheckBoxState() }, this);

    // Color of the div
    this.divColor = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this.menuContent);
    this.divColor.style = "display: flex; align-items: center;";
    this.textColor = L.DomUtil.create('p', '', this.divColor);
    this.textColor.innerHTML = Dictionary.get("MAP_ACTIONS_BORDER_COLOR_PICKER");
    this.colorPicker = L.DomUtil.create('input', '', this.divColor);
    this.colorPicker.type="color";
    this.colorPicker.style = "margin-left : 5px;"
    L.DomEvent.on(this.colorPicker, 'input change', function(e) { paintParams.uiClick = true; this._changeColor(e.target.value) }, this);

    // Click in button
    L.DomEvent.on(this.buttonDom, 'click', function(e) { paintParams.uiClick = true; this._clickRangeButton(e) }, this);

    this.setValues(this.layersManager.selectedLayer.polygonOptions);
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
   * Set the ui border values
   * @param {Object}          polygonOptions                Polygons options
   */
  setValues(polygonOptions)
  {
    this.cursorSize.value = polygonOptions.weight;
    this.colorPicker.value = polygonOptions.color;

    this.sameColorCheckBox.checked = !(this.layersManager.selectedLayer.polygonOptions.color == this.layersManager.selectedLayer.polygonOptions.fillColor);

    this.colorPicker.disabled = true;
    this.colorPicker.style["background-color"] = "#aaaaaa";
  }

  /*
   * Hide the button and menu
   */
  hide()
  {
    this._closeMenu();

    super.hide();
  }

  /*
   * Change the color 
   * @param {String}          colorValue                The color value
   */
  _changeColor(colorValue) {
    this.layersManager.selectedLayer.polygonOptions.color = colorValue;

    if(this.layersManager.selectedLayer)
    {
      this.layersManager.selectedLayer.redraw();
    }

    this.layersControl.updateLineColor(this.layersManager.selectedLayer);
  }

  /*
   * Change the size 
   * @param {Object}          e                Event 
   */
  _changeSize(e) {
    this.layersManager.selectedLayer.polygonOptions.weight = e.target.valueAsNumber;

    if(this.layersManager.selectedLayer)
    {
      this.layersManager.selectedLayer.redraw();
    }
  }

  /*
   * Change the checkbox state, enable color picker
   */
  _changeCheckBoxState() {
    this.colorPicker.disabled = !this.sameColorCheckBox.checked;

    if(!this.colorPicker.disabled) {
      this.colorPicker.style["background-color"] = "#eeeeee";
    }
    else {
      this.colorPicker.style["background-color"] = "#aaaaaa";

      this._changeColor(this.layersManager.selectedLayer.polygonOptions.fillColor);
      this.colorPicker.value = this.layersManager.selectedLayer.polygonOptions.fillColor;
    }
  }
}