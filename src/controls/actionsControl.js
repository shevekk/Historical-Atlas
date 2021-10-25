
/*
 * Controller of buttons actions
 */
var ActionsControl = L.Control.extend({  

  /*
   * Options of the painter
   */
  options: {
    position: 'topleft'
  },
 
  /*
  * @property {ActionButton[]}       buttons                 Button list
  * @property {L.Map}                map                     The map
  * @property {CursorManager}        cursorManager           The cursor manager
  * @property {LayersManager}        layersManager           The layerd manager
  * @property {PaintParams}          paintParams             The paint params
  * @property {LoadSaveManager}      loadSaveManager         The load and save manager
  * @property {LayersControl}        layersControl           The layer control
  * @property {Params}               params                  The params
   */
  initialize: function (options) 
  {
    this.buttons = {};

    this.map;

    this.cursorManager = options.cursorManager;
    this.layersManager = options.layersManager;
    this.paintParams = options.paintParams;
    this.loadSaveManager = options.loadSaveManager;
    this.layersControl = options.layersControl;

    this.params = options.params;

    this.logged = localStorage.getItem('session-id-histoatlas');
  },
  
  /*
   * Add map, init content and manage action in map
   * @param {L.Map}               map                   The map
   */
  onAdd: function(map) 
  {
    let me = this;
    me.map = map;
    
    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    this._createMenu();

    this.buttons["color"].setValue(this.layersManager.selectedLayer.polygonOptions.color);

    if(!this.params.editMode)
    {
      this._container.style["display"] = "none";
    }

    return this._container;
  },
  
  /*
   * Create the menu (left buttons)
   */
  _createMenu: function() 
  {
    let me = this;

    this.buttons["connexion_state"] = new ActionButtonConnexionState(this._container);

    this.buttons["selection"] = new ActionButtonSimple(this._container, "img/mouse-pointer-solid.svg", "Activer la selection", function(e) { me.paintParams.uiClick = true; me._changeSelectionState(e); });

    this.buttons["back"] = new ActionButtonSimple(this._container, "img/arrow-left-solid.svg", "Retour", function(e) { me.paintParams.uiClick = true; me.backToMain(); });

    this.buttons["paint"] = new ActionButtonSimple(this._container, "img/paint-brush-solid.svg", "Activer le dessin", function(e) { me.paintParams.uiClick = true; me.enablePaint(); });

    this.buttons["erase"] = new ActionButtonSimple(this._container, "img/eraser-solid.svg", "Activer le retait de contenu", function(e) { me.paintParams.uiClick = true; me.enableRemove(e); });

    this.buttons["erase_all"] = new ActionButtonSimple(this._container, "img/paint-roller-solid.svg", "Activer le retait de contenu sur toutes les couches", function(e) { me.paintParams.uiClick = true; me._changeRemovalAllState(); });

    this.buttons["cursor_size"] = new ActionButtonSlider(this._container, "img/cursor-size.svg", "Choix de la taille du curseur", function(e) { me._cursorSizeMove(e) }, 5, 50, this.paintParams.cursorRaduis, this.paintParams);

    this.buttons["color"] = new ActionButtonColor(this._container, "Choix de la couleur de la couche", function(e) { me.paintParams.uiClick = true }, function (e) { me._changeColor(e.target.value); });

    this.buttons["border_size"] = new ActionButtonSlider(this._container, "img/border-style-solid.svg", "Choix de la taille de la bordure", function(e) { me._cursorBorderSizeMove(e) }, 0, 20, this.paintParams.borderWeight, this.paintParams);

    this.buttons["opacity"] = new ActionButtonSlider(this._container, "img/opacity.png", "Choix l'opacité de la couche", function(e) { me._cursorOpacityMove(e) }, 0, 100, this.paintParams.opacity * 100, this.paintParams);

    this.buttons["label"] = new ActionButtonSimple(this._container, "img/tag-solid.svg", "Actions sur le label",  function(e) { me.paintParams.uiClick = true; me.openLabelMenu()  });

    this.buttons["label_size"] = new ActionButtonSlider(this._container, "img/text-width-solid.svg", "Choix de la taille du label", function(e) { me._cursorLabelSizeMove(e) }, 0, 50, this.layersManager.selectedLayer.label.textSize, this.paintParams);

    this.buttons["move_label"] = new ActionButtonSimple(this._container, "img/arrows-alt-solid.svg", "Deplacer le label",  function(e) { me.paintParams.uiClick = true; me.changeMoveLabelState()  });

    this.buttons["import_export"] = new ActionButtonSimple(this._container, "img/file.svg", "Menu import/export",  function(e) { me.paintParams.uiClick = true; me.openImportExportMenu(); });

    this.buttons["export"] = new ActionButtonSimple(this._container, "img/file-download-solid.svg", "Exporter la visualistion",  function(e) { me.paintParams.uiClick = true; me.loadSaveManager.export(); });

    this.buttons["import"] = new ActionButtonFile(this._container, "img/file-import-solid.svg", "Importer une visualistion (fichier json)", this.paintParams, me.loadSaveManager);

    this.buttons["save"] = new ActionButtonSave(this._container, "img/save-regular.svg", "Sauvegarder la carte sur le server", me.paintParams, me.loadSaveManager);

    this.backToMain();
  },

  /*
   * Update logged state, change button color and save button visibility
   * @param {Boolean}               loggedState                   The logged state
   */
  updateLoggedState : function(loggedState)
  {
    if(loggedState)
    {
      this.buttons["connexion_state"].setLoggedState(true);
      this.buttons["save"].changeDisplay(true);
    }
    else
    {
      this.buttons["connexion_state"].setLoggedState(false);
      this.buttons["save"].changeDisplay(false);
    }
  },

  /*
   * Back to main menu
   */
  backToMain : function()
  {
    // Change buttons visibility
    this.buttons["connexion_state"].show();
    this.buttons["erase"].show();
    this.buttons["import_export"].show();
    this.buttons["save"].show();
    this.buttons["selection"].show();
    this.buttons["paint"].show();
    this.buttons["label"].show();

    this.buttons["cursor_size"].hide();
    this.buttons["border_size"].hide();
    this.buttons["opacity"].hide();
    this.buttons["color"].hide();
    this.buttons["back"].hide();
    this.buttons["export"].hide();
    this.buttons["import"].hide();
    this.buttons["erase_all"].hide();
    this.buttons["label_size"].hide();
    this.buttons["move_label"].hide();


    this.enableScroll();
    this.map.dragging.enable();
    this.paintParams.removalContent = false;
    this.paintParams.moveLabel = false;

    if(this.paintParams.selectionState)
    {
      this._changeSelectionState();
    }
  },

  /*
   * Enable paint mode, open paint menu
   */
  enablePaint : function()
  {
    // Change button visibility
    this.buttons["erase"].hide();
    this.buttons["import_export"].hide();
    this.buttons["save"].hide();
    this.buttons["selection"].hide();
    this.buttons["paint"].hide();
    this.buttons["label"].hide();
    this.buttons["connexion_state"].hide();

    this.buttons["cursor_size"].show();
    this.buttons["border_size"].show();
    this.buttons["opacity"].show();
    this.buttons["color"].show();
    this.buttons["back"].show();

    this.disableScroll();
    this.map.dragging.disable();
  },

  /*
   * Open import and export menu
   */
  openImportExportMenu : function()
  {
    this.buttons["export"].show();
    this.buttons["import"].show();
    this.buttons["back"].show();

    this.buttons["erase"].hide();
    this.buttons["import_export"].hide();
    this.buttons["save"].hide();
    this.buttons["selection"].hide();
    this.buttons["paint"].hide();
    this.buttons["label"].hide();
    this.buttons["connexion_state"].hide();
  },

  /*
   * Enable remove mode, open remove content menu
   */
  enableRemove : function()
  {
    this.buttons["erase_all"].show();
    this.buttons["back"].show();
    this.buttons["cursor_size"].show();

    this.buttons["erase"].hide();
    this.buttons["import_export"].hide();
    this.buttons["save"].hide();
    this.buttons["selection"].hide();
    this.buttons["paint"].hide();
    this.buttons["label"].hide();
    this.buttons["connexion_state"].hide();

    this.disableScroll();
    this.map.dragging.disable();
    this.paintParams.removalContent = true;
  },

  /*
   * Open label menu
   */
  openLabelMenu : function()
  {
    this.buttons["erase"].hide();
    this.buttons["import_export"].hide();
    this.buttons["save"].hide();
    this.buttons["selection"].hide();
    this.buttons["paint"].hide();
    this.buttons["label"].hide();
    this.buttons["connexion_state"].hide();

    this.buttons["back"].show();
    this.buttons["label_size"].show();
    this.buttons["move_label"].show();
  },

  /*
   * Change the label move state, and disable selection and draw
   */
  changeMoveLabelState : function()
  {
    this.paintParams.moveLabel = !this.paintParams.moveLabel;

    if(this.paintParams.moveLabel)
    {
      this.paintParams.moveLabel = true;

      this.buttons["move_label"].setSelectedState(true);
    }
    else
    {
      this.buttons["move_label"].setSelectedState(false);
    }
  },

  /*
   * Change the label size of the selected layer
   * @param {Event}               e                    The event with slider value
   */
  _cursorLabelSizeMove : function(e)
  {
    this.layersManager.selectedLayer.label.updateSize(e.target.valueAsNumber, this.paintParams.zoomLevel);
    this.layersManager.selectedLayer.label.redraw(this.layersManager.selectedLayer.layer, this.layersManager.selectedLayer.selectedZone.geom, this.layersManager.selectedLayer.selectedZone.number);
  },

  /*
   * Menage change color input, change selected layer color
   * @param {String}               color                    The color value
   */
  _changeColor : function(color)
  {
    this.layersManager.selectedLayer.polygonOptions.color = color;
    this.layersManager.selectedLayer.redraw();
    this.cursorManager.updateCursorPosition(null, this.layersManager.selectedLayer);

    this.layersControl.updateLineColor(this.layersManager.selectedLayer);
  },
  
  /* 
   * Cursor size move
   * @param {Event}               e                    The event with slider value
   */
  _cursorSizeMove: function(e)
  {
    this.setRadius(e.target.valueAsNumber);
  },

  /* 
   * Cursor border size move, update border size value
   * @param {Event}               e                    The event with slider value
   */
  _cursorBorderSizeMove: function(e)
  {
    this.paintParams.borderWeight = e.target.valueAsNumber;
    this.layersManager.selectedLayer.polygonOptions.weight = e.target.valueAsNumber;

    if(this.layersManager.selectedLayer)
    {
      this.layersManager.selectedLayer.redraw();
    }
  },

  /* 
   * Cursor opacity state move, update opacity value
   * @param {Event}               e                    The event with slider value
   */
  _cursorOpacityMove : function(e)
  {
    this.paintParams.opacity = e.target.valueAsNumber / 100;
    this.layersManager.selectedLayer.polygonOptions.fillOpacity = e.target.valueAsNumber / 100;

    if(this.layersManager.selectedLayer)
    {
      this.layersManager.selectedLayer.redraw();
    }
  },
  
  /* 
   * Set raduis value
   * @param {Number}               raduis                    Raduis value
   */
  setRadius: function(raduis)
  {
    this.paintParams.cursorRaduis = raduis;
    
    if(this.paintParams.scrollDisable)
    {
      this.cursorManager.updateCursorPosition(null, this.layersManager.selectedLayer);
    }
  },

  /* 
   * Change the selection state
   * @param {Event}               e                    The event
   */
  _changeSelectionState : function(e)
  {
    if(this.paintParams.selectionState)
    {
      this.paintParams.selectionState = false;
      this.buttons["selection"].setSelectedState(false);
    }
    else
    {
      this.paintParams.selectionState = true;
      this.buttons["selection"].setSelectedState(true);
    }
  },
  
  /* 
   * Change the remove all state
   * @param {Event}               e                    The event
   */
  _changeRemovalAllState : function()
  {
    this.paintParams.removalAll = !this.paintParams.removalAll;
    
    if(this.paintParams.removalAll)
    {
      this.buttons["erase_all"].changeImageAndTitle("", "Désactiver le retait de contenu sur toutes les couches");
    }
    else
    {
      this.buttons["erase_all"].changeImageAndTitle("", "Activer le retait de contenu sur toutes les couches");
    }
    this.buttons["erase_all"].setSelectedState(this.paintParams.removalAll);
  },

  /*
   * Enable scrool map mode (disable paint)
   */
  enableScroll : function()
  {
    this.paintParams.scrollDisable = false;
    this.cursorManager.layer.clearLayers();
  },

  /*
   * Disable scrool map mode (enable paint)
   */
  disableScroll : function()
  {
    this.paintParams.scrollDisable = true;
  },

  /*
   * Manage the selection of layer
   * @param {Object}               e                   Event with lat, long
   */
  manageSelection : function(e)
  {
    this.layersManager.manageSelection(e);

    if(this.layersManager.selectedLayer)
    {
      this.updateParamsFromLayerOptions(this.layersManager.selectedLayer.polygonOptions);

      if(this.paintParams.scrollDisable)
      {
        this.cursorManager.updateCursorPosition(null, this.layersManager.selectedLayer);
      }

      this.layersControl.changeSelection(this.layersManager.selectedLayer);
    }
  },

  /*
   * Update the params from the current layer option
   * @param {Object}              polygonOptions                   Polygon options
   */
  updateParamsFromLayerOptions : function(polygonOptions)
  {
    this.buttons["color"].setValue(polygonOptions.color);
    this.buttons["border_size"].setValue(polygonOptions.weight);
    this.buttons["opacity"].setValue(polygonOptions.fillOpacity * 100);
    this.buttons["label_size"].setValue(this.layersManager.selectedLayer.label.textSize);
  }
});
