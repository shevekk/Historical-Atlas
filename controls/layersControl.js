
/*
 * Layer with layer list
 */
var LayersControl = L.Control.extend({  

  options: {
      position: 'topright'
  },

  /* 
   * Initialize the layersControl
   * @property {ActionsControl}        actionsControl           The action control
   * @property {PaintParams}           paintParams              The paint param
   * @property {L.DomUtil[]}           lineDiv                  The div of the lines
   * @property {L.DomUtil[]}           colorDiv                 The div of the colors frame
   * @property {L.DomUtil}             selectedLine             The selected line
   * @property {LayerManager}          layersManager            The layers manager
   * @property {Params}                params                   The params
   * @property {L.DomUtil}             _menu                    The menu containing the lines
   */
  initialize: function (options) 
  {
    this.actionsControl = null;
    this.paintParams = options.paintParams;

    this.lineDiv = [];
    this.colorDiv = [];

    this.selectedLine = null;
    this.layersManager = null;

    this.params = options.params;

    this._menu = null;
  },

  /* 
   * Build the base control
   * @param {L.Map}        map           The map
   */
  onAdd(map)
  {
    this.map = map;

    var div = L.DomUtil.create('div', 'layers-control');

    let titleDiv = L.DomUtil.create('div', 'layers-list-title', div);
    let title = L.DomUtil.create('b', '', titleDiv);
    title.innerHTML = "Couches :";
    imageHide = L.DomUtil.create('img', 'layers-list-icon-hide', titleDiv);
    imageHide.src = "img/minus-solid.svg";

    this._menu = L.DomUtil.create('div', '', div);
    this._menu.id = "layersList";

    L.DomEvent.on(div, 'click', function(e) { this.actionInDiv() }, this);
    L.DomEvent.addListener(div, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(div, 'mousedown', function(e) { L.DomEvent.stopPropagation(e); });
    L.DomEvent.addListener(div, 'mouseup', L.DomEvent.stop);

    L.DomEvent.on(imageHide, 'click', function(e) { this.changeVisibilityState(imageHide);  } , this);

    return div;
  },

  /* 
   * Change the visibility state
   * @param {L.DomUtil}        imageHide           The image dom
   */
  changeVisibilityState(imageHide)
  {
    if(this._menu.style["display"] == "none")
    {
      this._menu.style["display"] = "inline-block";
      imageHide.src = "img/minus-solid.svg";
    }
    else
    {
      this._menu.style["display"] = "none";
      imageHide.src = "img/plus-solid.svg";
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
      this.actionsControl._changeScrollDisableState();
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

    let content = "";

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
  },

  /*
   * Add a new layer
   * @param {PaintLayer}          paintLayer           The layer manager
   * @param {Boolean}             selected             True if the layer is curently selected
   */
  addLayer(paintLayer, selected)
  {
    for(let i = 0; i < this.colorDiv.length; i++)
    {
      if(this.colorDiv[i].number == paintLayer.number)
      {
        return;
      }
    }

    let lineDiv = L.DomUtil.create('div', 'layers-list-line', this._menu);
    lineDiv.id = "lineContent"+paintLayer.number;
    lineDiv.number = paintLayer.number;
    this.lineDiv.push(lineDiv);

    this.initLine(lineDiv, paintLayer);

    // Manage selected line
    if(selected)
    {
      if(this.selectedLine)
      {
        this.selectedLine.style["background-color"] = "#ffffff";
      }
      
      lineDiv.style["background-color"] = "#c7e0f0";
      this.selectedLine = lineDiv;
    }
  },

  /*
   * Init normal design of the line
   * @param {L.DomUtil}          lineDiv             Div of the line
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  initLine(lineDiv, paintLayer)
  {
    let selectDiv = L.DomUtil.create('div', 'layers-list-line-select', lineDiv);

    let colorDiv = L.DomUtil.create('div', 'layers-list-color', selectDiv);
    colorDiv.style = `background-color:${paintLayer.polygonOptions.color}`;
    colorDiv.number = paintLayer.number;
    this.colorDiv.push(colorDiv);

    let nameCmp = L.DomUtil.create('p', 'layers-list-text', selectDiv);
    nameCmp.innerHTML = paintLayer.label.value;

    if(this.params.editMode)
    {
      let imageEdit = L.DomUtil.create('img', 'layers-list-icon', lineDiv);
      imageEdit.src = "img/edit-solid.svg";

      L.DomEvent.on(imageEdit, 'click', function(e) { this.editValue(lineDiv, selectDiv, imageEdit, paintLayer); } , this);
    }

    L.DomEvent.on(selectDiv, 'click', function(e) { this.selectLine(paintLayer); } , this);
    L.DomEvent.on(selectDiv, 'dblclick', function(e) { this.zoomInLayer(paintLayer); } , this);
  },

  /*
   * Edit name : add input for change the layer name
   * @param {L.DomUtil}          lineDiv             Div of the line
   * @param {L.DomUtil}          selectDiv           Div of the line selection part
   * @param {L.DomUtil}          imageEdit           The img edit
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  editValue(lineDiv, selectDiv, imageEdit, paintLayer)
  {
    L.DomUtil.remove(selectDiv);
    L.DomUtil.remove(imageEdit);

    let inputName = L.DomUtil.create('input', 'layers-list-input', lineDiv);
    inputName.value = paintLayer.label.value;

    let btnOk = L.DomUtil.create('button', 'layers-list-input', lineDiv);
    btnOk.innerHTML = "OK";

    L.DomEvent.on(btnOk, 'click', function(e) { this.savValue(lineDiv, selectDiv, inputName, btnOk, paintLayer); } , this);
  },

  /*
   * Sav the name : Reinit line normal design
   * @param {L.DomUtil}          lineDiv             Div of the line
   * @param {L.DomUtil}          selectDiv           Div of the line selection part
   * @param {L.DomUtil}          inputName           Input for change name
   * @param {L.DomUtil}          btnOk               Button ok for change name
   * @param {L.DomUtil}          imageEdit           The img edit
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  savValue(lineDiv, selectDiv, inputName, btnOk, paintLayer)
  {
    L.DomUtil.remove(inputName);
    L.DomUtil.remove(btnOk);

    paintLayer.label.value = inputName.value;
    paintLayer.label.redraw(paintLayer.layer, paintLayer.geom);

    this.initLine(lineDiv, paintLayer);
  },

  /*
   * Map zoom in a paintlayer bounds (db-click)
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  zoomInLayer(paintLayer)
  {
    this.map.fitBounds([[paintLayer.layer.getBounds().getNorth(), paintLayer.layer.getBounds().getEast()], [paintLayer.layer.getBounds().getSouth(), paintLayer.layer.getBounds().getWest()]])
  },

  /*
   * Click on line = select layer in map and actionsControl
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  selectLine(paintLayer)
  {
    this.changeSelection(paintLayer);
    this.layersManager.selectedLayer = paintLayer;
    this.actionsControl.updateParamsFromLayerOptions(paintLayer.polygonOptions);
  },

  /*
   * Update color of the line from paintLayer
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  updateLineColor(paintLayer)
  {
    //$("#lineContent" + paintLayer.number).html(this.createLineContent(paintLayer));
    for(let i = 0; i < this.colorDiv.length; i++)
    {
      if(this.colorDiv[i].number == paintLayer.number)
      {
        this.colorDiv[i].style = `background-color:${paintLayer.polygonOptions.color}`;
      }
    }
  },

  /*
   * Change selection in map, update selected line in layersControl
   * @param {PaintLayer}         selectedLayer          The new selected layer
   */
   changeSelection(selectedLayer)
   {
      if(this.selectedLine)
      {
        this.selectedLine.style["background-color"] = "#ffffff";
      }

      let lineDiv = null
      for(let i = 0; i < this.lineDiv.length; i++)
      {
        if(this.lineDiv[i].number == selectedLayer.number)
        {
          lineDiv = this.lineDiv[i];
        }
      }
      
      if(lineDiv != null)
      {
        lineDiv.style["background-color"] = "#c7e0f0";
        this.selectedLine = lineDiv;
      }
   }
});
