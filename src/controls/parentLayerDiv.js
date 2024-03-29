﻿
/*
 * Display in layer control a parent layer div
 */
class ParentLayerDiv
{
  /* 
   * Initialize the parent layer div
   * @param {L.DomUtil}                  menu                    Div of the menu
   * @property {L.DomUtil}               div                     The div containing content
   * @property {L.DomUtil}               colorDiv                The color div (color square)
   * @property {ParentLayer}             parentLayer             The parent layer display
   * @property {Params}                  params                  The params
   * @property {L.map}                   map                     The map
   * @property {LayersManager}           layersManager           The layer manager
   * @property {LayersControl}           layersControl           The layer control
   * @property {PaintZoneDiv[]}          paintZoneDiv            The children paint zone div
   * @property {Boolean}                 selected                The selection state
   */
  constructor(menu, parentLayer, params, map, layersControl)
  {
    this.div = L.DomUtil.create('div', 'layers-list-line', menu);
    this.div.id = "lineContent"+parentLayer.number;
    this.div.number = parentLayer.number;

    this.colorDiv = null;

    this.parentLayer = parentLayer;
    this.params = params;
    this.map = map;
    this.layersManager = layersControl.layersManager;
    this.layersControl = layersControl;

    this.propertyMenu = new PropertyLayerForm();

    this.paintZoneDiv = [];
    this.selected = false;
  }

  /*
   * Init design of Parent layer div
   */
  redraw()
  {
    if(this.parentLineDiv)
      L.DomUtil.remove(this.parentLineDiv);
    if(this.divAddPaintZone)
      L.DomUtil.remove(this.divAddPaintZone);
    if(this.paintZoneDom)
      L.DomUtil.remove(this.paintZoneDom);

    this.paintZoneDiv = [];
    let opacityCode = parseInt(this.parentLayer.polygonOptions.fillOpacity * 255).toString(16);

    this.parentLineDiv = L.DomUtil.create('div', 'layers-list-line-parent', this.div);

    let selectDiv = L.DomUtil.create('div', 'layers-list-line-select', this.parentLineDiv);

    this.colorDiv = L.DomUtil.create('div', 'layers-list-color', selectDiv);
    this.colorDiv.style = `background-color:${this.parentLayer.polygonOptions.fillColor}${opacityCode}; border:2px solid ${this.parentLayer.polygonOptions.color};`;
    this.colorDiv.number = this.parentLayer.number;

    let nameCmp = L.DomUtil.create('p', 'layers-list-text', selectDiv);
    nameCmp.innerHTML = this.parentLayer.label.value;

    // Add icons
    let imageEdit = null;
    let imageReOrder = null;
    let imageDelete = null;
    let imagePopUp = null;
    let imagePropMenu = null;
    if(this.params.editMode)
    {
      if(this.layersManager.layerGroups.length > 1)
      {
        imageDelete = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
        imageDelete.src = "img/menu/trash-solid.svg";
        imageDelete.title = Dictionary.get("MAP_LAYERS_PARENTLAYER_DELETE");
        L.DomEvent.on(imageDelete, 'click', function(e) { this.delete(); } , this);
      }

      imagePropMenu = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
      imagePropMenu.src = "img/menu/source_icons_google-docs.svg";
      imagePropMenu.title = Dictionary.get("MAP_LAYERS_PARENTLAYER_PROP_MENU");

      if(this.params.timeEnable)
      {
        imageReOrder = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
        imageReOrder.src = "img/menu/sync-solid.svg";
        imageReOrder.title = Dictionary.get("MAP_LAYERS_PARENTLAYER_REORDER");
      }
      else
      {
        // Change PopUp text
        imagePopUp = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
        imagePopUp.src = "img/menu/comment-alt-solid.svg";
        imagePopUp.title = Dictionary.get("MAP_LAYERS_PARENTLAYER_POPUP");
        L.DomEvent.on(imagePopUp, 'click', function(e) { this.modifyPopUp(); } , this);
      }

      imageEdit = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
      imageEdit.src = "img/menu/edit-solid.svg";
      imageEdit.title = Dictionary.get("MAP_LAYERS_PARENTLAYER_EDIT");
    }

    // Add sub lines
    this.paintZoneDom = null;
    this.divAddPaintZone = null;
    if(this.params.timeEnable)
    {
      this.paintZoneDom = L.DomUtil.create('div', '', this.div);
      for(let i = 0; i < this.parentLayer.paintZones.length; i++)
      {
        this.paintZoneDiv.push(new PaintZoneDiv(this.paintZoneDom, this, this.parentLayer.paintZones[i]));

        if(this.selected && this.parentLayer.selectedZone == this.parentLayer.paintZones[i])
        {
          this.paintZoneDiv[this.paintZoneDiv.length - 1].changeLineColor();
        }
      }

      // Hide paintZoneDom (sub-layer)
      if(this.paintZoneDom) {
        this.paintZoneDom.style.display = "none";
      }

      // Add zone
      if(this.params.editMode)
      {
        this.divAddPaintZone = L.DomUtil.create('div', 'layers-list-line-add-child', this.div);

        let imageAddPaintZoneDiv = L.DomUtil.create('div', 'layers-list-line-add-child-icon-div', this.divAddPaintZone); 

        let imageAddPaintZone = L.DomUtil.create('img', 'layers-list-line-add-child-icon', imageAddPaintZoneDiv);
        imageAddPaintZone.src = "img/menu/plus-solid.svg";

        L.DomEvent.on(imageAddPaintZoneDiv, 'click', function(e) { this.addPaintZoneForm(imageAddPaintZoneDiv) } , this);
      }
    }

    if(this.params.editMode)
    {
      L.DomEvent.on(imageEdit, 'click', function(e) { this.editValue(this.parentLineDiv, selectDiv, imageEdit, imageReOrder, imageDelete, imagePopUp, this.paintZoneDiv, this.divAddPaintZone); } , this);

      if(this.params.timeEnable)
      {
        L.DomEvent.on(imageReOrder, 'click', function(e) { this.reOrder(); } , this);
      }

      L.DomEvent.on(imagePropMenu, 'click', function(e) { this.propertyMenu.display(this.parentLayer, this.params) } , this);
    }

    L.DomEvent.on(selectDiv, 'click', function(e) { this.select(); } , this);
    L.DomEvent.on(selectDiv, 'dblclick', function(e) { this.zoomInLayer(); } , this);

    if(this.selected)
    {
      this.parentLineDiv.style = "background-color : #c7e0f0";
    }
  }


  /*
   * Action of modify popup content
   */
  modifyPopUp()
  {
    $("#textAreaModifyPopUp").val(this.parentLayer.paintZones[0].popupContent.replaceAll("<br/>\n", "\n"));

    let me = this;

    let dialogUpdatePopUp = $("#dialog-modify-popUp").dialog({
      autoOpen: false,
      height: 400,
      width: 500,
      modal: true,
      title: Dictionary.get("MAP_LAYERS_POPUP_WINDOW_TITLE"),
      buttons: {
        Cancel: function() {
          dialogUpdatePopUp.dialog( "close" );
        },
        OK: function() {
          me.savModifyPopUp(me);
          dialogUpdatePopUp.dialog( "close" );
        }
      },
      close: function() {
        dialogUpdatePopUp.dialog( "close" );
      }
    });

    dialogUpdatePopUp.dialog( "open" );

    $("#dialog-modify-popUp").prop('title', Dictionary.get("MAP_LAYERS_POPUP_WINDOW_TITLE")); 
  }

  /*
   * Sav the modification of the popup content
   */
  savModifyPopUp(me)
  {
    me.layersControl.actionsList.addActionPopUpContent(me.parentLayer.paintZones[0], me.parentLayer);

    me.parentLayer.paintZones[0].popupContent = $("#textAreaModifyPopUp").val().replaceAll("\n", "<br/>\n");
    me.parentLayer.redraw();
  }

  /*
   * Click add a new paint zone, creta form for choise zone to copy
   * @param {L.DomUtil}                  imageAddPaintZoneDiv                    Image div to remove
   */
  addPaintZoneForm(imageAddPaintZoneDiv)
  {
    L.DomUtil.remove(imageAddPaintZoneDiv);

    let label = L.DomUtil.create('label', '', this.divAddPaintZone);
    label.innerHTML = Dictionary.get("MAP_LAYERS_PARENTLAYER_CHOISE_ZONE_COPY");

    let selectZone = L.DomUtil.create('select', '', this.divAddPaintZone);

    let emptyOption = L.DomUtil.create('option', '', selectZone);
    emptyOption.innerHTML = "Vide";
    emptyOption.number = -1;

    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      let option = L.DomUtil.create('option', '', selectZone);
      option.innerHTML = this.paintZoneDiv[i].label;
      option.number = this.paintZoneDiv[i].paintZone.number;
    }

    let btnOk = L.DomUtil.create('button', 'layers-list-input', this.divAddPaintZone);
    btnOk.innerHTML = Dictionary.get("MAP_LAYERS_OK");

    L.DomEvent.on(btnOk, 'click', function(e) { this.addPaintZone(selectZone.options[selectZone.selectedIndex].number) } , this);
  }

  /*
   * Add a new paint zone 
   * @param {Number}                  numberZoneToCopy                    The number of the zone to copy (-1 for empty)
   */
  addPaintZone(numberZoneToCopy)
  {
    this.parentLayer.addPaintZone(numberZoneToCopy, true);
    this.redraw();

    if(this.paintZoneDom) {
      this.paintZoneDom.style.display = "inline";
    }

    this.paintZoneDiv[this.paintZoneDiv.length -1].select();

    this.layersControl.actionsList.addActionAddZone(this.parentLayer.paintZones[this.parentLayer.paintZones.length - 1], this.parentLayer, this, this.layersManager);
  }

  /*
   * ReOrder the paintZones divs
   */
  reOrder()
  {
    this.parentLayer.paintZones.sort((a, b) => { return a.startDate - b.startDate });
    this.redraw();
  }

  /*
   * Action of delete the parent layer
   */
  delete()
  {
    if(confirm(`${Dictionary.get("MAP_LAYERS_PARENTLAYER_DELETE_VALIDATION")} "${this.parentLayer.label.value}" `))
    {
      this.layersControl.actionsList.addActionDeleteLayer(this.parentLayer, this.layersControl, this.layersManager);

      this.layersManager.removeALayerGroup(this.parentLayer);
      
      L.DomUtil.remove(this.div);

      // Redraw all for remove delete icon for the last layer
      if(this.layersManager.layerGroups.length == 1)
      {
        this.layersControl.updateLayersContent(this.layersManager);
      }

      // remove
      for(let i = 0; i < this.layersControl.parentsLayersDiv.length; i++)
      {
        if(this.layersControl.parentsLayersDiv[i] == this)
        {
          this.layersControl.parentsLayersDiv.splice(i, 1);
        }
      }

      // Change selection
      this.layersControl.selectLine(this.layersManager.selectedLayer);
    }
  }

  /*
   * Edit name : Add input for change the layer name
   * @param {L.DomUtil}          lineDiv                 Div of the line
   * @param {L.DomUtil}          selectDiv               Div of the line selection part
   * @param {L.DomUtil}          imageEdit               The img edit
   * @param {L.DomUtil}          imageReOrder            The img reorder
   * @param {L.DomUtil}          imageDelete             The img delete
   * @param {L.DomUtil}          imagePopUp              The img popup
   * @param {L.DomUtil}          paintZoneDiv            Div zone of the paint zone
   * @param {L.DomUtil}          divAddPaintZone         Div of add paint zone button
   */
  editValue(lineDiv, selectDiv, imageEdit, imageReOrder, imageDelete, imagePopUp, paintZoneDiv, divAddPaintZone)
  {
    L.DomUtil.remove(selectDiv);
    L.DomUtil.remove(imageEdit);
    if(imageReOrder)
    {
      L.DomUtil.remove(imageReOrder);
    }
    if(imageDelete)
    {
      L.DomUtil.remove(imageDelete);
    }
    if(imagePopUp)
    {
      L.DomUtil.remove(imagePopUp);
    }

    let inputName = L.DomUtil.create('input', 'layers-list-input-text', lineDiv);
    inputName.value = this.parentLayer.label.value;

    let btnOk = L.DomUtil.create('button', 'layers-list-input', lineDiv);
    btnOk.innerHTML = Dictionary.get("MAP_LAYERS_OK");;

    L.DomEvent.on(btnOk, 'click', function(e) { this.savValue(lineDiv, selectDiv, inputName, btnOk, paintZoneDiv, divAddPaintZone); } , this);
  }

  /*
   * Sav the name : Reinit line normal design
   * @param {L.DomUtil}          lineDiv                 Div of the line
   * @param {L.DomUtil}          selectDiv               Div of the line selection part
   * @param {L.DomUtil}          inputName               Input for change name
   * @param {L.DomUtil}          btnOk                   Button ok for change name
   * @param {L.DomUtil}          imageEdit               The img edit
   * @param {L.DomUtil}          imageReOrder            The img reorder
   * @param {L.DomUtil}          imageDelete             The img delete
   * @param {L.DomUtil}          paintZoneDiv            Div zone of the paint zone
   * @param {L.DomUtil}          divAddPaintZone         Div of add paint zone button
   */
  savValue(lineDiv, selectDiv, inputName, btnOk, paintZoneDiv, divAddPaintZone)
  {
    L.DomUtil.remove(inputName);
    L.DomUtil.remove(btnOk);
    if(paintZoneDiv != null)
      L.DomUtil.remove(paintZoneDiv);
    if(divAddPaintZone != null)
      L.DomUtil.remove(divAddPaintZone);

    this.layersControl.actionsList.addActionRenameLayer(this.parentLayer, this);

    this.parentLayer.label.value = inputName.value;

    if(this.parentLayer.selectedZone && this.parentLayer.selectedZone.geom)
    {
      this.parentLayer.label.redraw(this.parentLayer.layer, this.parentLayer.selectedZone.geom);
    }

    this.redraw();
  }

  /*
   * Map zoom in a paintlayer bounds (db-click)
   * @param {PaintLayer}         paintLayer          The paint layer of the line
   */
  zoomInLayer()
  {
    this.map.fitBounds([[this.parentLayer.layer.getBounds().getNorth(), this.parentLayer.layer.getBounds().getEast()], [this.parentLayer.layer.getBounds().getSouth(), this.parentLayer.layer.getBounds().getWest()]])
  }

  /*
   * Change the color of the parent layer
   * @param {Object}         polygonOptions          polygon options with colors
   */
  setColor(polygonOptions)
  {
    let opacityCode = parseInt(this.parentLayer.polygonOptions.fillOpacity * 255).toString(16);
    this.colorDiv.style = `background-color:${polygonOptions.fillColor}${opacityCode}; border:2px solid ${polygonOptions.color}`;
  }

  /*
   * Selection of a paint zone in UI
   */
  childPaintZoneSelection()
  {
    this.parentLineDiv.style = "background-color : #c7e0f0";
    this.layersManager.selectedLayer = this.parentLayer;
    this.selected = true;
  }

  /*
   * Selection of the parent layer 
   */
  select()
  {
    this.layersControl.unselectAll();

    if(this.paintZoneDom) {
      if(this.paintZoneDom.style.display == "none") {
        this.paintZoneDom.style.display = "inline";
      }
      else {
        this.paintZoneDom.style.display = "none";
      }
    }

    this.parentLineDiv.style = "background-color : #c7e0f0";
    this.layersManager.selectedLayer = this.parentLayer;
    this.selected = true;

    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      if(this.layersControl.timeControl.value >= this.paintZoneDiv[i].paintZone.startDate && this.layersControl.timeControl.value <= this.paintZoneDiv[i].paintZone.endDate)
      {
        this.paintZoneDiv[i].changeLineColor();
      }
    }

    this.layersControl.actionsControl.updateParamsFromLayerOptions(this.parentLayer.polygonOptions);
  }

  /*
   * Unselect of the parent layer
   */
  unselect()
  {
    this.parentLayer.redraw(false);
    
    this.selected = false;
    this.parentLineDiv.style = "background-color : #ffffff";
    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      this.paintZoneDiv[i].unselect();    
    }
  }

  changeSelectedZone()
  {
    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      if(this.paintZoneDiv[i].paintZone == this.parentLayer.selectedZone)
      {
        this.paintZoneDiv[i].changeLineColor();
      }
      else
      {
        this.paintZoneDiv[i].unselect();
      }
    }
  }
}