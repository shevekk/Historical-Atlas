﻿
/*
 * Layer with layer list
 */
var LayersControl = L.Control.extend({  

  options: {
      position: 'topright'
  },

  /* 
   * Initialize the layersControl
   * @property {ActionsControl}             actionsControl             The action control
   * @property {PaintParams}                paintParams                The paint param
   * @property {ParentLayerDiv[]}           parentsLayersDiv           The layers div
   * @property {LayersManager}              layersManager              The layers manager
   * @property {Params}                     params                     The params
   * @property {TimeControl}                timeControl                The time controlleur
   * @property {L.DomUtil}                  _menu                      The menu containing the lines
   * @property {L.DomUtil}                  imageHide                  The image dom for hide menu
   */
  initialize: function (options) 
  {
    this.actionsControl = null;
    this.paintParams = options.paintParams;

    this.parentsLayersDiv = [];

    this.layersManager = null;

    this.params = options.params;
    this.timeControl = options.timeControl;

    this.actionsList = options.actionsList;

    this.markersControl = new MarkersControl(this.params, this.paintParams, this.timeControl, this, this.actionsList);

    this._menu = null;
  },

  /* 
   * Build the base control
   * @param {L.Map}        map           The map
   */
  onAdd(map)
  {
    let me = this;

    this.map = map;

    var div = L.DomUtil.create('div', 'layers-control');

    this.div = div;

    let titleDiv = L.DomUtil.create('div', 'layers-list-title', div);
    this.title = L.DomUtil.create('b', '', titleDiv);
    this.title.innerHTML = Dictionary.get("MAP_LAYERS_TITLE");
    this.imageHide = L.DomUtil.create('img', 'layers-list-icon-hide', titleDiv);
    this.imageHide.src = "img/menu/minus-solid.svg";

    this._menu = L.DomUtil.create('div', '', div);
    this._menu.id = "layersList";

    // Add new layer component
    if(this.params.editMode)
    {
      this.divAddParentLayer = L.DomUtil.create('div', 'layers-list-line-add-parent-layer', div);

      let colorDiv = L.DomUtil.create('div', 'layers-list-color', this.divAddParentLayer);
      colorDiv.style = `background-color:#cccccc; border: 2px solid black`;

      this.nameAddCmp = L.DomUtil.create('p', 'layers-list-text', this.divAddParentLayer);
      this.nameAddCmp.innerHTML = Dictionary.get("MAP_LAYERS_ADD_LAYER");

      L.DomEvent.on(this.divAddParentLayer, 'click', function(e) { this.addParentLayer() } , this);
    }

    L.DomEvent.on(div, 'click', function(e) { this.actionInDiv() }, this);
    L.DomEvent.addListener(div, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(div, 'mousedown', function(e) { L.DomEvent.stopPropagation(e);  if(!me.paintParams.scrollDisable) { me.map.dragging.disable(); } });
    L.DomEvent.addListener(div, 'mouseup', function(e) { L.DomEvent.stopPropagation(e);  if(!me.paintParams.scrollDisable) { me.map.dragging.enable(); } } );
    // manage scroll
    L.DomEvent.addListener(div, 'mousewheel', function(e) { L.DomEvent.stopPropagation(e); } );

    L.DomEvent.on(this.imageHide, 'click', function(e) { this.changeVisibilityState();  } , this);

    // Init dialog Update PopUp
    let dialogUpdatePopUp = $("#dialog-modify-popUp").dialog({
      autoOpen: false,
      height: 400,
      width: 500,
      modal: true,
      buttons: {
      },
      close: function() {
      }
    });

    return div;
  },

  /* 
   * Change the visibility state
   */
  changeVisibilityState()
  {
    if(this._menu.style["display"] == "none")
    {
      this._menu.style["display"] = "inline-block";
      this.imageHide.src = "img/menu/minus-solid.svg";

      this.markersControl.div.style["display"] = "inline";

      this.div.style["background"] = "rgba(255, 255, 255, 1)";

      if(this.divAddParentLayer)
      {
        this.divAddParentLayer.style["display"] = "block";
      }
    }
    else
    {
      this._menu.style["display"] = "none";
      this.imageHide.src = "img/menu/plus-solid.svg";

      this.markersControl.div.style["display"] = "none";

      this.div.style["background"] = "rgba(255, 255, 255, 0.5)";

      if(this.divAddParentLayer)
      {
        this.divAddParentLayer.style["display"] = "none";
      }
    }
  },

  /*
   * Disable all actions if click in the layers div
   */
  actionInDiv()
  {
    this.paintParams.uiClick = true;

    if(this.paintParams.selectionState)
    {
      this.actionsControl._changeSelectionState();
    }
    if(this.paintParams.scrollDisable)
    {
      //this.actionsControl.changeScrollDisableState();
    }
    if(this.paintParams.moveLabel)
    {
      this.actionsControl.changeMoveLabelState();
    }
  },

  /*
   * Update layer list content from layerManager
   * @param {L.PaintLayer}        layersManager           The layer manager
   */
  updateLayersContent(layersManager)
  {
    this.layersManager = layersManager;

    // Remove content
    for(let i = 0; i < this.parentsLayersDiv.length; i++)
    {
      L.DomUtil.remove(this.parentsLayersDiv[i].div);
    }
    
    this.parentsLayersDiv = [];

    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      if(this.layersManager.layerGroups[i] == this.layersManager.selectedLayer)
      {
        this.addLayer(this.layersManager.layerGroups[i], true);
      }
      else
      {
        this.addLayer(this.layersManager.layerGroups[i], false);
      }
    }

    this._menu.style["display"] = "inline-block";

    this.markersControl.initContent(this.div, this.map, layersManager);
  },

  /*
   * Add a new layer
   * @param {ParentLayer}          parentLayer           The layer manager
   * @param {Boolean}              selected              True if the layer is curently selected
   */
  addLayer(parentLayer, selected)
  {
    this.parentsLayersDiv.push(new ParentLayerDiv(this._menu, parentLayer, this.params, this.map, this));
    this.parentsLayersDiv[this.parentsLayersDiv.length - 1].redraw();

    if(selected)
    {
      this.parentsLayersDiv[this.parentsLayersDiv.length - 1].select();
    }
  },

  /*
   * Click on line = select layer in map and actionsControl
   * @param {ParentLayer}         paintLayer          The paint layer of the line
   */
  selectLine(parentLayer)
  {
    this.changeSelection(parentLayer);
    this.layersManager.selectedLayer = parentLayer;
    this.actionsControl.updateParamsFromLayerOptions(parentLayer.polygonOptions);
  },

  /*
   * Update color of the line from paintLayer
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  updateLineColor(parentLayer)
  {
    for(let i = 0; i < this.parentsLayersDiv.length; i++)
    {
      if(this.parentsLayersDiv[i].parentLayer.number == parentLayer.number)
      {
        this.parentsLayersDiv[i].setColor(parentLayer.polygonOptions);
      }
    }
  },

  /*
   * Change selection in map, update selected line in layersControl
   * @param {PaintLayer}         selectedLayer          The new selected layer
   */
   changeSelection(selectedLayer)
   {
      let selectDiv = null
      for(let i = 0; i < this.parentsLayersDiv.length; i++)
      {
        if(this.parentsLayersDiv[i].parentLayer == selectedLayer)
        {
          this.parentsLayersDiv[i].select();
        }
      }
   },

   /*
    * Unselect all layers
    */
    unselectAll()
    {
      for(let i = 0; i < this.parentsLayersDiv.length; i++)
      {
        this.parentsLayersDiv[i].unselect();
      }
    },

    changeSelectedZone()
    {
      for(let i = 0; i < this.parentsLayersDiv.length; i++)
      {
        if(this.parentsLayersDiv[i].selected)
        {
          this.parentsLayersDiv[i].changeSelectedZone();
        }
      }
    },

    /*
     * Add a new parent layer (bouton click)
     */
    addParentLayer()
    {
      this.layersManager.addNewLayer();
      this.actionsControl.updateParamsFromLayerOptions(this.layersManager.selectedLayer.polygonOptions);

      this.actionsList.addActionAddLayer(this.layersManager.selectedLayer, this, this.layersManager);
    },

    /*
     * Redraw for lang change
     */
    redraw()
    {
      for(let i = 0; i < this.parentsLayersDiv.length; i++)
      {
        this.parentsLayersDiv[i].redraw();
      }

      if(this.params.editMode)
      {
        this.nameAddCmp.innerHTML = Dictionary.get("MAP_LAYERS_ADD_LAYER");
      }
      this.title.innerHTML = Dictionary.get("MAP_LAYERS_TITLE");

      this.markersControl.redraw();
    }
});
