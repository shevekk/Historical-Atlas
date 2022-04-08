
/*
 * Controlleur settings params
 */
var SettingsControl = L.Control.extend({  

  /*
   * Options of the painter
   */
  options: {
    position: 'bottomleft'
  },
 
  /*
   * @property {L.Dom}                 _container              The content container
   * @property {L.PaintLayer}          paintParams             The paint params
   * @property {Params}                params                  The settings
   * @property {Object}                jsonBackgrounds         Background json file content
   * @property {BackgroundControl}     backgroundControl       The background control
   */
  initialize: function (options) 
  {
    this.paintParams = options.paintParams;
    this.params = options.params;
    this.jsonBackgrounds = options.jsonBackgrounds;
    this.backgroundControl = options.backgroundControl;
    this.timeControl = options.timeControl;
    this.layersControl = options.layersControl;
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd: function(map) 
  {
    this.map = map;

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

    L.DomEvent.on(this._container, 'click', function(e) { this.paintParams.uiClick = true; }, this);
    L.DomEvent.addListener(this._container, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this._container, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); });
    L.DomEvent.addListener(this._container, 'mouseup', function(e) { L.DomEvent.stopPropagation(e); });

    this.initOpenButton();

    if(!this.params.editMode)
    {
      this._container.style["display"] = "none";
    }

    return this._container;
  },

  /*
   * Redraw for lang change
   */
  redraw()
  {
    this.buttonOpen.title = Dictionary.get("MAP_PARAMS_OPEN");
  },

  /* 
   * Open the menu, create content
   */
  openMenu: function()
  {
    L.DomUtil.addClass(this._container, "layers-control");
    L.DomUtil.remove(this.buttonOpen);

    // Create title
    let titleDiv = L.DomUtil.create('div', 'layers-list-title', this._container);
    let title = L.DomUtil.create('b', '', titleDiv);
    title.innerHTML = Dictionary.get("MAP_PARAMS_TITLE");

    let imageClose = L.DomUtil.create('img', 'settings-icon-close', titleDiv);
    imageClose.src = "img/actions/times-solid.svg";

    // Create content
    let contentDiv = L.DomUtil.create('div', '', this._container);

    let zoomDefaultDiv = L.DomUtil.create('div', '', contentDiv);
    let labelZoomDefault = L.DomUtil.create('label', '', zoomDefaultDiv);
    labelZoomDefault.for = "zoomDefault";
    labelZoomDefault.innerHTML = Dictionary.get("MAP_PARAMS_ZOOM_DEFAULT");
    let inputZoomDefault = L.DomUtil.create('input', 'settings-zoom-input', zoomDefaultDiv);
    inputZoomDefault.type = "number";
    inputZoomDefault.name = "zoomDefault";
    inputZoomDefault.value = this.params.zoom;
    inputZoomDefault.max = 22;
    inputZoomDefault.min = 0;
    let buttonZoomDefault = L.DomUtil.create('button', 'settings-button-target', zoomDefaultDiv);
    buttonZoomDefault.innerHTML = `<img src="img/actions/dot-circle-solid.svg" style="width:12px;height:10px;" />`;
    buttonZoomDefault.title = Dictionary.get("MAP_PARAMS_GET_CURRENT_ZOOM");

    let zoomMinDiv = L.DomUtil.create('div', '', contentDiv);
    let labelZoomMin = L.DomUtil.create('label', '', zoomMinDiv);
    labelZoomMin.for = "zoomMin";
    labelZoomMin.innerHTML = Dictionary.get("MAP_PARAMS_ZOOM_MIN");
    let inputZoomMin = L.DomUtil.create('input', 'settings-zoom-input', zoomMinDiv);
    inputZoomMin.type = "number";
    inputZoomMin.name = "zoomMin";
    inputZoomMin.value = this.params.minZoom;
    inputZoomMin.max = 22;
    inputZoomMin.min = 0;
    let buttonZoomMin = L.DomUtil.create('button', 'settings-button-target', zoomMinDiv);
    buttonZoomMin.innerHTML = `<img src="img/actions/dot-circle-solid.svg" style="width:12px;height:10px;" />`;
    buttonZoomMin.title = Dictionary.get("MAP_PARAMS_GET_CURRENT_ZOOM");

    let zoomMaxDiv = L.DomUtil.create('div', '', contentDiv);
    let labelZoomMax = L.DomUtil.create('label', '', zoomMaxDiv);
    labelZoomMax.for = "zoomMax";
    labelZoomMax.innerHTML = Dictionary.get("MAP_PARAMS_ZOOM_MAX");
    let inputZoomMax = L.DomUtil.create('input', 'settings-zoom-input', zoomMaxDiv);
    inputZoomMax.type = "number";
    inputZoomMax.name = "zoomMax";
    inputZoomMax.value = this.params.maxZoom;
    inputZoomMax.max = 22;
    inputZoomMax.min = 0;
    let buttonZoomMax = L.DomUtil.create('button', 'settings-button-target', zoomMaxDiv);
    buttonZoomMax.innerHTML = `<img src="img/actions/dot-circle-solid.svg" style="width:12px;height:10px;" />`;
    buttonZoomMax.title = Dictionary.get("MAP_PARAMS_GET_CURRENT_ZOOM");

    let positionDiv = L.DomUtil.create('div', '', contentDiv);
    let labelPosition = L.DomUtil.create('label', '', positionDiv);
    labelPosition.innerHTML = Dictionary.get("MAP_PARAMS_POSITION");
    let inputPositionLat = L.DomUtil.create('input', 'settings-zoom-input', positionDiv);
    inputPositionLat.type = "number";
    inputPositionLat.name = "positionLat";
    inputPositionLat.value = this.params.defaultPosition[0];
    let inputPositionLong = L.DomUtil.create('input', 'settings-zoom-input', positionDiv);
    inputPositionLong.type = "number";
    inputPositionLong.name = "positionLong";
    inputPositionLong.value = this.params.defaultPosition[1];
    let buttonPosition = L.DomUtil.create('button', 'settings-button-target', positionDiv);
    buttonPosition.innerHTML = `<img src="img/actions/dot-circle-solid.svg" style="width:12px;height:10px;" />`;
    buttonPosition.title = Dictionary.get("MAP_PARAMS_GET_CURRENT_POSITION");

    let backgroundDefaultDiv = L.DomUtil.create('div', '', contentDiv);
    let labelbackgroundDefault = L.DomUtil.create('label', '', backgroundDefaultDiv);
    labelbackgroundDefault.innerHTML = Dictionary.get("MAP_PARAMS_BACKGROUND_DEFAULT");
    let selectBackgroundDefault = L.DomUtil.create('select', '', backgroundDefaultDiv);
    for(let prop in this.jsonBackgrounds)
    {
      if(this.params.backgroundDefault == prop)
      {
        selectBackgroundDefault.innerHTML += `<option id="${prop}" value="${prop}" selected>${this.jsonBackgrounds[prop]["name"]}</option>`;
      }
      else
      {
        selectBackgroundDefault.innerHTML += `<option id="${prop}" value="${prop}">${this.jsonBackgrounds[prop]["name"]}</option>`;
      }
    }

    let backgroundsDisplayDiv = L.DomUtil.create('div', '', contentDiv);
    let labelbackgroundDisplay = L.DomUtil.create('label', '', backgroundsDisplayDiv);
    labelbackgroundDisplay.innerHTML = Dictionary.get("MAP_PARAMS_BACKGROUNDS");
    let selectBackgroundDisplay = L.DomUtil.create('select', '', backgroundsDisplayDiv);
    selectBackgroundDisplay.multiple = true;
    for(let prop in this.jsonBackgrounds)
    {
      if(this.params.backgrounds.includes(prop) || this.params.backgrounds.length == 0)
      {
        selectBackgroundDisplay.innerHTML += `<option id="${prop}" value="${prop}" selected>${this.jsonBackgrounds[prop]["name"]}</option>`;
      }
      else
      {
        selectBackgroundDisplay.innerHTML += `<option id="${prop}" value="${prop}">${this.jsonBackgrounds[prop]["name"]}</option>`;
      }
    }

    // Create time settings
    let timeCheckBoxDiv = L.DomUtil.create('div', '', contentDiv);
    let inputTimeCheckBox = L.DomUtil.create('input', 'settings-zoom-input', timeCheckBoxDiv);
    inputTimeCheckBox.type = "checkbox";
    inputTimeCheckBox.name = "timeCheckbox";
    inputTimeCheckBox.checked = this.params.timeEnable;
    let labelTimeCheckBox = L.DomUtil.create('label', '', timeCheckBoxDiv);
    labelTimeCheckBox.for = "timeCheckbox";
    labelTimeCheckBox.innerHTML = Dictionary.get("MAP_PARAMS_ACTIVE_TIME_BAR");

    let timeMaxMinDiv = L.DomUtil.create('div', '', contentDiv);
    let labelTimeMin = L.DomUtil.create('label', '', timeMaxMinDiv);
    labelTimeMin.for = "timeMin";
    labelTimeMin.innerHTML = Dictionary.get("MAP_PARAMS_DATE_MIN");
    let inputTimeMin = L.DomUtil.create('input', 'settings-time-input', timeMaxMinDiv);
    //inputTimeMin.type = "number";
    inputTimeMin.name = "timeMin";
    inputTimeMin.value = this.params.timeMin;
    let labelTimeMax = L.DomUtil.create('label', '', timeMaxMinDiv);
    labelTimeMax.for = "timeMax";
    labelTimeMax.innerHTML = " " + Dictionary.get("MAP_PARAMS_DATE_MAX");
    let inputTimeMax = L.DomUtil.create('input', 'settings-time-input', timeMaxMinDiv);
    //inputTimeMax.type = "number";
    inputTimeMax.name = "timeMax";
    inputTimeMax.value = this.params.timeMax;

    let typeDateDiv = L.DomUtil.create('div', '', contentDiv);
    let labelTypeDate = L.DomUtil.create('label', '', typeDateDiv);
    labelTypeDate.innerHTML = Dictionary.get("MAP_PARAMS_DATE_TYPE");
    let selectTypeDate = L.DomUtil.create('select', '', typeDateDiv);
    selectTypeDate.innerHTML += `<option id="years" value="years">${Dictionary.get("MAP_PARAMS_TIME_TYPE_YEARS")}</option>`;
    selectTypeDate.innerHTML += `<option id="months" value="months">${Dictionary.get("MAP_PARAMS_TIME_TYPE_MONTHS")}</option>`;
    selectTypeDate.innerHTML += `<option id="days" value="days">${Dictionary.get("MAP_PARAMS_TIME_TYPE_DAYS")}</option>`;

    selectTypeDate.value = this.params.typeTime;

    // Size of the time bar
    let timeBarBigSizeDiv = L.DomUtil.create('div', '', contentDiv);
    let inputTimeBarBigSize = L.DomUtil.create('input', '', timeBarBigSizeDiv);
    inputTimeBarBigSize.type = "checkbox";
    inputTimeBarBigSize.name = "dateBarSize";
    inputTimeBarBigSize.checked = this.params.timeBarBigSize;
    let labelTimeBarBigSize = L.DomUtil.create('label', '', timeBarBigSizeDiv);
    labelTimeBarBigSize.for = "dateBarSize";
    labelTimeBarBigSize.innerHTML = Dictionary.get("MAP_PARAMS_DATE_BAR_SIZE");

    // 
    let divProps = L.DomUtil.create('div', 'settings-prop-div', contentDiv);
    let propertiesForm = L.DomUtil.create('button', '', divProps);
    propertiesForm.innerHTML = Dictionary.get("MAP_PARAMS_OPEN_PROP_FORM");
    propertiesForm.title = Dictionary.get("MAP_PARAMS_OPEN_PROP_FORM_TITLE");

    // Add sav button
    let buttonSav = L.DomUtil.create('button', 'settings-button-sav', contentDiv);
    buttonSav.innerHTML = Dictionary.get("MAP_PARAMS_UPDATE_BUTTON");

    // Manage actions
    L.DomEvent.on(imageClose, 'click', function(e) { this.closeMenu(titleDiv, contentDiv) }, this);

    L.DomEvent.on(buttonPosition, 'click', function(e) { this.getActualPosition(inputPositionLat, inputPositionLong) }, this);
    L.DomEvent.on(buttonZoomDefault, 'click', function(e) { this.getActualZoom(inputZoomDefault) }, this);
    L.DomEvent.on(buttonZoomMin, 'click', function(e) { this.getActualZoom(inputZoomMin) }, this);
    L.DomEvent.on(buttonZoomMax, 'click', function(e) { this.getActualZoom(inputZoomMax) }, this);
    L.DomEvent.on(propertiesForm, 'click', function(e) { this.openPropForm() }, this);

    //L.DomEvent.on(inputTimeCheckBox, 'click', function(e) { this.changeTimeState(e) }, this);

    L.DomEvent.on(buttonSav, 'click', function(e) { this.sav(inputPositionLat, inputPositionLong, inputZoomDefault, inputZoomMin, inputZoomMax, selectBackgroundDefault, selectBackgroundDisplay, inputTimeCheckBox, inputTimeMin, inputTimeMax, selectTypeDate, inputTimeBarBigSize) }, this);    
  },

  /*
   * Close the menu 
   * @param {L.Dom}               titleDiv                  The title menu div
   * @param {L.Dom}               contentDiv                The title content div
   */
  closeMenu: function(titleDiv, contentDiv)
  {
    L.DomUtil.removeClass(this._container, "layers-control");

    L.DomUtil.remove(titleDiv);
    L.DomUtil.remove(contentDiv);

    this.initOpenButton();
  },

  /*
   * Init the button for open menu
   */
  initOpenButton()
  {
    this.buttonOpen = L.DomUtil.create('a', 'ui_button', this._container);
    this.buttonOpen.title = Dictionary.get("MAP_PARAMS_OPEN");

    let imageOpen = L.DomUtil.create('img', '', this.buttonOpen);
    imageOpen.src = "img/actions/cogs-solid.svg";
    imageOpen.style = "margin-top : 5px;margin-left:0px;width:20px;height:20px"

    L.DomEvent.addListener(this.buttonOpen, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonOpen, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonOpen, 'mouseup', L.DomEvent.stop);

    L.DomEvent.on(this.buttonOpen, 'click', this.openMenu, this);
  },

  /*
   * Manage button get actual map position
   * @param {L.Dom}               inputPositionLat                 The input of the lat default position
   * @param {L.Dom}               inputPositionLong                The input of the long default position
   */
  getActualPosition(inputPositionLat, inputPositionLong)
  {
    inputPositionLat.value = this.map.getCenter().lat;
    inputPositionLong.value = this.map.getCenter().lng;
  },

  /*
   * Manage button get actual map zoom
   * @param {L.Dom}               inputZoom                 The target zoom input
   */
  getActualZoom(inputZoom)
  {
    inputZoom.value = this.map.getZoom();
  },

  /*
   * Sav data to params class and update map and backgoundControl
   * @param {L.Dom}               inputPositionLat                        The input of the lat default position
   * @param {L.Dom}               inputPositionLong                       The input of the long default position
   * @param {L.Dom}               inputZoomDefault                        The default zoom input
   * @param {L.Dom}               inputZoomMin                            The min zoom input
   * @param {L.Dom}               inputZoomMax                            The max zoom input
   * @param {L.Dom}               selectBackgroundDefault                 The select input default backgroung
   * @param {L.Dom}               selectBackgroundDisplay                 The select input display backgroungs
   * @param {L.Dom}               inputTimeMin                            The input time min
   * @param {L.Dom}               inputTimeMax                            The input time max
   * @param {L.Dom}               selectTypeDate                          The select input of type date
   * @param {L.Dom}               inputTimeBarBigSize                     The input for big size of bar time
   */
  sav(inputPositionLat, inputPositionLong, inputZoomDefault, inputZoomMin, inputZoomMax, selectBackgroundDefault, selectBackgroundDisplay, inputTimeCheckBox, inputTimeMin, inputTimeMax, selectTypeDate, inputTimeBarBigSize)
  {
    this.params.defaultPosition = [];
    this.params.defaultPosition.push(parseFloat(inputPositionLat.value));
    this.params.defaultPosition.push(parseFloat(inputPositionLong.value));

    this.params.zoom = inputZoomDefault.value;
    this.params.minZoom = inputZoomMin.value;
    this.params.maxZoom = inputZoomMax.value;

    this.params.updateMap(this.map);

    this.params.backgroundDefault = selectBackgroundDefault.value;

    this.params.backgrounds = [];
    for(let i = 0; i < selectBackgroundDisplay.options.length; i++)
    {
      if(selectBackgroundDisplay.options[i].selected)
      {
        this.params.backgrounds.push(selectBackgroundDisplay.options[i].value);
      }
    }

    this.backgroundControl.setBackground(this.params.backgroundDefault);
    this.backgroundControl.updateList(this.params.backgrounds, this.jsonBackgrounds);

    // Update time param
    this.params.timeEnable = inputTimeCheckBox.checked;

    if(DateConverter.checkDateValid(inputTimeMin.value))
    {
      this.params.timeMin = inputTimeMin.value;
    }
    else
    {
      inputTimeMin.value = this.params.timeMin;
    }

    if(DateConverter.checkDateValid(inputTimeMax.value))
    {
      this.params.timeMax = inputTimeMax.value;
    }
    else
    {
      inputTimeMax.value = this.params.timeMax;
    }

    if(selectTypeDate.value != this.params.typeTime)
    {
      this.layersControl.layersManager.updateTypeDate(this.params.typeTime, selectTypeDate.value)
    }

    this.params.typeTime = selectTypeDate.value;

    this.params.timeBarBigSize = inputTimeBarBigSize.checked;

    this.timeControl.updateFromParams();

    this.layersControl.updateLayersContent(this.layersControl.layersManager)
  },

  /*
   * Change the time state
   * @param {Event}               e                    The event with checkbox value
   */
  changeTimeState(e)
  {
    if(e.target.checked)
    {
      this.params.timeEnable = true;

      this.timeControl.enable();
    }
    else
    {
      this.params.timeEnable = false;

      this.timeControl.disable();
    }
  },

  /*
   * Open the properties form
   */
  openPropForm()
  {
    PropertiesForm.display();
  }

});