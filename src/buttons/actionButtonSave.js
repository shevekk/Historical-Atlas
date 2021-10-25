

class ActionButtonSave extends ActionButton
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
    this.savNameInput = L.DomUtil.create('input', '', menuContent);
    this.savNameInput.type = "text";
    this.savNameInput.id = "input-sav-file-name";

    var buttonSave = L.DomUtil.create('button', '', menuContent);
    buttonSave.type = "text";
    buttonSave.innerHTML = "Save";

    L.DomEvent.on(this.buttonDom, 'click', function(e) { loadSaveManager.checkValidUser(); paintParams.uiClick = true; this._clickRangeButton(e) }, this);
    L.DomEvent.on(buttonSave, 'click', function(e) { loadSaveManager.save(this.savNameInput.value); }, this);

    this.visibleState = false;
  }

  /*
   * Set the name of the save file
   * @param {String}               name                The name
   */
  setFileName(name)
  {
    this.savNameInput.value = name;
  }

  /*
   * Change the display state
   * @param {Boolean}               display                The display state
   */
  changeDisplay(display)
  {
    if(display)
    {
      this._menu.style["display"] = "block";
      this.buttonDom.style["display"] = "inline-block";
      this.visibleState = true;
    }
    else
    {
      this._menu.style["display"] = "none";
      this.buttonDom.style["display"] = "none";
      this.visibleState = false;
    }
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
   * Hide the button and menu
   */
  hide()
  {
    this._closeMenu();

    super.hide();
  }

  /*
   * Show the button
   */
  show()
  {
    if(this.visibleState)
    {
      super.show();
    }
  }
}