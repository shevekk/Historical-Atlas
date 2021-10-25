
/*
 * Display in layer control a paint zone div
 */
class PaintZoneDiv
{
  /* 
   * Initialize the paint zone div
   * @param {L.DomUtil}                  paintZoneDiv            Parent div
   * @property {L.DomUtil}               div                     The div containing content
   * @property {ParentLayer}             parentLayer             The parent layer display
   * @property {Params}                  params                  The params
   * @property {LayersManager}           layersManager           The layer manager
   * @property {LayersControl}           layersControl           The layer control
   * @property {ParentLayerDiv}          parentLayerDiv          The parent 
   * @property {Boolean}                 selected                The selection state
   * @property {String}                  label                   The label of the line
   * @property {PaintZone}               paintZone               The paint zone of the line
   */
  constructor(paintZoneDiv, parentLayerDiv, paintZone)
  {
    this.params = parentLayerDiv.params;
    this.paintZone = paintZone;
    this.parentLayer = parentLayerDiv.parentLayer;
    this.parentLayerDiv = parentLayerDiv;
    this.layersManager = parentLayerDiv.layersManager;
    this.layersControl = parentLayerDiv.layersControl;

    this.div = L.DomUtil.create('div', 'layers-list-line-child', paintZoneDiv);
    this.label = "";

    this.redraw();

    this.selected = false;
  }

  /*
   * Redraw the line
   */
  redraw()
  {
    let selectDiv = L.DomUtil.create('div', 'layers-list-line-select', this.div);

    let namePaintZone = L.DomUtil.create('p', 'layers-list-text', selectDiv);
    this.label = this.paintZone.startDate + "-" + this.paintZone.endDate;
    namePaintZone.innerHTML = this.label;

    if(this.params.editMode)
    {
      // Edit
      let imageEdit = L.DomUtil.create('img', 'layers-list-zone-icon', this.div);
      imageEdit.src = "img/edit-solid.svg";
      imageEdit.title = "Editer les dates";

      // Delete
      let imageDelete = null;
      if(this.parentLayer.paintZones.length > 1)
      {
        imageDelete = L.DomUtil.create('img', 'layers-list-zone-icon', this.div);
        imageDelete.src = "img/trash-solid.svg";
        imageDelete.title = "Supprimer la sous-couche";

        L.DomEvent.on(imageDelete, 'click', function(e) { this.delete(namePaintZone); } , this);
      }
      
      L.DomEvent.on(imageEdit, 'click', function(e) { this.editValue(selectDiv, imageEdit, imageDelete); } , this);
    }

    L.DomEvent.on(selectDiv, 'click', function(e) { this.select(); } , this);
  }

  /*
   * Edit values of the line (change form)
   * @param {L.DomUtil}          selectDiv               Div of the line selection part
   * @param {L.DomUtil}          imageEdit               The img edit
   * @param {L.DomUtil}          imageDelete             The img delete
   */
  editValue(selectDiv, imageEdit, imageDelete)
  {
    L.DomUtil.remove(selectDiv);
    L.DomUtil.remove(imageEdit);
    if(imageDelete)
    {
      L.DomUtil.remove(imageDelete);
    }
    
    let inputStart = L.DomUtil.create('input', 'layers-list-input-date', this.div);
    inputStart.value = this.paintZone.startDate;

    let label = L.DomUtil.create('label', '', this.div);
    label.innerHTML = "-";

    let inputEnd = L.DomUtil.create('input', 'layers-list-input-date', this.div);
    inputEnd.value = this.paintZone.endDate;

    let btnOk = L.DomUtil.create('button', '', this.div);
    btnOk.innerHTML = "OK";

    L.DomEvent.on(btnOk, 'click', function(e) { this.savValue(inputStart, label, inputEnd, btnOk); } , this);
  }

  /*
   * Sav the value of start and end date : Reinit line normal design
   * @param {L.DomUtil}          inputStart          Input start to remove
   * @param {L.DomUtil}          label               Label to remove
   * @param {L.DomUtil}          inputEnd            Input end to remove
   * @param {L.DomUtil}          btnOk               Button ok for change name
   */
  savValue(inputStart, label, inputEnd, btnOk)
  {
    L.DomUtil.remove(inputStart);
    L.DomUtil.remove(label);
    L.DomUtil.remove(inputEnd);
    L.DomUtil.remove(btnOk);

    if(this.checkDatesValid(inputStart.value, inputEnd.value))
    {
      this.paintZone.startDate = parseInt(inputStart.value);
      this.paintZone.endDate = parseInt(inputEnd.value);
    }
    else
    {
      alert("Date invalide");
    }

    this.redraw();
  }

  /*
   * Action of delete the paint zone
   */
  delete(namePaintZone)
  {
    if(confirm(`Etes-vous sur de vouloir supprimer la sous-couche "${this.parentLayer.label.value}"-"${namePaintZone.innerHTML}" `))
    {
      this.parentLayer.removePaintZone(this.paintZone);

      // Change selected layer
      if(this.parentLayer.selectedZone == this.paintZone)
      {
        for(let i = 0; i < this.parentLayer.paintZones.length; i++)
        {
          if(this.layersControl.timeControl.value >= this.parentLayer.paintZones[i].startDate && this.layersControl.timeControl.value <= this.parentLayer.paintZones[i].endDate)
          {
            this.parentLayer.selectedZone = this.parentLayer.paintZones[i];
          }
        }
      }

      this.parentLayerDiv.redraw();
      this.parentLayer.redraw();
    }
  }

  /*
   * Check if the date of value
   * @param {String}          startDate          The start date value
   * @param {String}          endDate            The end date value
   */
  checkDatesValid(startDate, endDate)
  {
    if(isNaN(startDate) || isNaN(endDate))
    {
      return false;
    }
    else
    {
      return true;
    }
  }

  /*
   * Selection of the paint zone 
   */
  select()
  {
    if(this.layersControl.timeControl.value <= this.paintZone.startDate || this.layersControl.timeControl.value >= this.paintZone.endDate)
    {
      this.layersControl.timeControl.setValue(this.paintZone.startDate);
    }

    this.layersControl.unselectAll();
    this.parentLayerDiv.childPaintZoneSelection();

    this.changeLineColor();

    this.parentLayer.selectedZone = this.paintZone;
    this.parentLayer.redraw();

    this.layersControl.actionsControl.updateParamsFromLayerOptions(this.parentLayer.polygonOptions);
  }

  /*
   * Change the color line (selection)
   */
  changeLineColor()
  {
    this.div.style = "background-color : #c7e0f0";
    this.selected = true;
  }

  /*
   * Unselect of the paint zone
   */
  unselect()
  {
    this.div.style = "background-color : #ffffff";
    this.selected = false;
  }
}