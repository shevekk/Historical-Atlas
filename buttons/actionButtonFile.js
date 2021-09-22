
class ActionButtonFile extends ActionButton
{
  /*
   * Button of manage load file
   * @property {L.Dom}             _menu                 The menu div of choose file
   * @param {L.Dom}                container             The contener element
   * @param {String}               imgSrc                The image src
   * @param {String}               title                 The button title 
   * @param {PaintLayer}           paintParams           The paint parameters
   * @param {LoadSaveManager}      loadSaveManager       Load and Save Manager
   */
  constructor(container, imgSrc, title, paintParams, loadSaveManager)
  {
    super(container, imgSrc, title, null, 'a', 'action-button');

    this.importInit = false;

    this._menu = L.DomUtil.create('div', 'leaflet-bar leaflet-control-div-slider', container);
    L.DomEvent.disableClickPropagation(this._menu);

    var menuContent = L.DomUtil.create('div', 'leaflet-control-div-slider-content', this._menu);
    var importInput = L.DomUtil.create('input', '', menuContent);
    importInput.type = "file";
    importInput.accept = ".json";
    importInput.id = "inputImportFile";
    
    L.DomEvent.on(this.buttonDom, 'click', function(e) { paintParams.uiClick = true; this._clickRangeButton(e); if(!this.importInit) { this.importInit = true; loadSaveManager.importManagement() } }, this);
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
}