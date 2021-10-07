
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

    this.parentLineDiv = L.DomUtil.create('div', 'layers-list-line-parent', this.div);

    let selectDiv = L.DomUtil.create('div', 'layers-list-line-select', this.parentLineDiv);

    this.colorDiv = L.DomUtil.create('div', 'layers-list-color', selectDiv);
    this.colorDiv.style = `background-color:${this.parentLayer.polygonOptions.color}`;
    this.colorDiv.number = this.parentLayer.number;

    let nameCmp = L.DomUtil.create('p', 'layers-list-text', selectDiv);
    nameCmp.innerHTML = this.parentLayer.label.value;

    // Add icons
    let imageEdit = null;
    let imageReOrder = null;
    let imageDelete = null;
    if(this.params.editMode)
    {
      if(this.parentLayer.number >= 1)
      {
        imageDelete = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
        imageDelete.src = "img/trash-solid.svg";
        imageDelete.title = "Supprimer la couche";
        L.DomEvent.on(imageDelete, 'click', function(e) { this.delete(); } , this);
      }

      imageReOrder = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
      imageReOrder.src = "img/sync-solid.svg";
      imageReOrder.title = "Ré-ordonné";

      imageEdit = L.DomUtil.create('img', 'layers-list-icon', this.parentLineDiv);
      imageEdit.src = "img/edit-solid.svg";
      imageEdit.title = "Editer le nom";
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

      // Add zone
      if(this.params.editMode)
      {
        this.divAddPaintZone = L.DomUtil.create('div', 'layers-list-line-add-child', this.div);

        let imageAddPaintZoneDiv = L.DomUtil.create('div', 'layers-list-line-add-child-icon-div', this.divAddPaintZone); 

        let imageAddPaintZone = L.DomUtil.create('img', 'layers-list-line-add-child-icon', imageAddPaintZoneDiv);
        imageAddPaintZone.src = "img/plus-solid.svg";

        L.DomEvent.on(imageAddPaintZoneDiv, 'click', function(e) { this.addPaintZoneForm(imageAddPaintZoneDiv) } , this);
      }
    }

    if(this.params.editMode)
    {
      L.DomEvent.on(imageEdit, 'click', function(e) { this.editValue(this.parentLineDiv, selectDiv, imageEdit, imageReOrder, imageDelete, this.paintZoneDiv, this.divAddPaintZone); } , this);

      L.DomEvent.on(imageReOrder, 'click', function(e) { this.reOrder(); } , this);
    }

    L.DomEvent.on(selectDiv, 'click', function(e) { this.select(); } , this);
    L.DomEvent.on(selectDiv, 'dblclick', function(e) { this.zoomInLayer(); } , this);

    if(this.selected)
    {
      this.parentLineDiv.style = "background-color : #c7e0f0";
    }
  }

  /*
   * Click add a new paint zone, creta form for choise zone to copy
   * @param {L.DomUtil}                  imageAddPaintZoneDiv                    Image div to remove
   */
  addPaintZoneForm(imageAddPaintZoneDiv)
  {
    L.DomUtil.remove(imageAddPaintZoneDiv);

    let label = L.DomUtil.create('label', '', this.divAddPaintZone);
    label.innerHTML = "Couche à copier : ";

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
    btnOk.innerHTML = "OK";

    L.DomEvent.on(btnOk, 'click', function(e) { this.addPaintZone(selectZone.options[selectZone.selectedIndex].number) } , this);
  }

  /*
   * Add a new paint zone 
   * @param {Number}                  numberZoneToCopy                    The number of the zone to copy (-1 for empty)
   */
  addPaintZone(numberZoneToCopy)
  {
    this.parentLayer.addPaintZone(numberZoneToCopy);
    this.redraw();

    this.paintZoneDiv[this.paintZoneDiv.length -1].select();
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
    if(confirm(`Etes-vous sur de vouloir supprimer la couche "${this.parentLayer.label.value}" `))
    {
      this.layersManager.removeALayerGroup(this.parentLayer);
      
      L.DomUtil.remove(this.div);

      // Change selection
      this.layersControl.selectLine(this.layersManager.selectedLayer);

      // remove
      for(let i = 0; i < this.layersControl.parentsLayersDiv.length; i++)
      {
        if(this.layersControl.parentsLayersDiv[i] == this)
        {
          this.layersControl.parentsLayersDiv.splice(i, 1);
        }
      }
    }
  }

  /*
   * Edit name : Add input for change the layer name
   * @param {L.DomUtil}          lineDiv                 Div of the line
   * @param {L.DomUtil}          selectDiv               Div of the line selection part
   * @param {L.DomUtil}          imageEdit               The img edit
   * @param {L.DomUtil}          imageReOrder            The img reorder
   * @param {L.DomUtil}          imageDelete             The img delete
   * @param {L.DomUtil}          paintZoneDiv            Div zone of the paint zone
   * @param {L.DomUtil}          divAddPaintZone         Div of add paint zone button
   */
  editValue(lineDiv, selectDiv, imageEdit, imageReOrder, imageDelete, paintZoneDiv, divAddPaintZone)
  {
    L.DomUtil.remove(selectDiv);
    L.DomUtil.remove(imageEdit);
    L.DomUtil.remove(imageReOrder);
    if(imageDelete)
    {
      L.DomUtil.remove(imageDelete);
    }

    let inputName = L.DomUtil.create('input', 'layers-list-input', lineDiv);
    inputName.value = this.parentLayer.label.value;

    let btnOk = L.DomUtil.create('button', 'layers-list-input', lineDiv);
    btnOk.innerHTML = "OK";

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
   * @param {String}         color          The color value
   */
  setColor(color)
  {
    this.colorDiv.style = `background-color:${color}`;
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
    this.selected = false;
    this.parentLineDiv.style = "background-color : #ffffff";
    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      this.paintZoneDiv[i].unselect();    
    }
  }

  /*
   * Change the zone selection from time change
   * @param {TimeValue}         timeValue          The time value
   */
   /*
  changeTime(timeValue)
  {
    //let select = false;
    for(let i = 0; i < this.paintZoneDiv.length; i++)
    {
      this.paintZoneDiv[i].unselect();

      //if(!select && timeValue >= this.paintZoneDiv[i].paintZone.startDate && timeValue <= this.paintZoneDiv[i].paintZone.endDate)
      if(timeValue >= this.paintZoneDiv[i].paintZone.startDate && timeValue <= this.paintZoneDiv[i].paintZone.endDate)
      {
        //select = true;
        this.paintZoneDiv[i].changeLineColor();
      }
    }
  }
  */

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