﻿
/*
 * Paint layer 
 */
class ParentLayer
{
  /*
   * Initialize the Parent layer containing paintLayers
   * @property {L.map}               map                  The map
   * @property {Object}              polygonOptions       The option of polygon draw
   * @property {Number}              number               The number
   * @property {PaintParams}         paintParams          The paint parameters
   * @property {L.layerGroup}        layer                The drawing layer
   * @property {Label}               label                The label of the layer
   * @property {PaintZone[]}         paintZones           Array of all paint layers
   * @property {PaintZone}           selectedZone         The selected paintLayer
   */
  constructor(map, polygonOptions, number, paintParams, params)
  {
    this.polygonOptions = polygonOptions;
    this.layer = L.layerGroup().addTo(map);
    this.map = map;
    this.number = number;
    this.params = params;
    this.paintParams = paintParams;

    this.paintZones = [];
    this.paintZones.push(new PaintZone(0, this.params));
    this.selectedZone = this.paintZones[0];

    this.label = new Label("Layer" + (number+1));
    this.label.updateZoom(paintParams.zoomLevel);
  }

  /*
   * Add a geom content to the geom and redraw layer
   * @param {object}                  geom                  Geom to add of the content
   */
  addContent(geom)
  {
    this.selectedZone.addContent(geom);

    this.redraw(true);
  }

  /*
   * Remove a geom content to the geom and redraw layer
   * @param {object}                  geom                  Geom to remove of the content
   */
  removeContent(geom)
  {
    if(this.selectedZone.geom != null)
    {
      this.selectedZone.removeContent(geom);
      
      this.redraw();
    }
  }

  /*
   * Redraw the layer with geom
   */
  redraw(currentDrawing)
  {
    let me = this;
    this.layer.remove();

    if(this.selectedZone != null && this.selectedZone.geom != null)
    {   
      this.layer = L.geoJSON(this.selectedZone.geom, this.polygonOptions).addTo(this.map);

      if(this.selectedZone.popupContent)
      {
        this.layer.bindPopup(this.selectedZone.popupContent).on('click', function(e) { me.closePopUpOnClick(e); });
      }

      if(!currentDrawing)
      {
        this.label.redraw(this.layer, this.selectedZone.geom, this.selectedZone.number);
      }
    }
  }

  /*
   * Close the popup on click
   * @param {L.Event}               event                   Leaflet event of click
   */
  closePopUpOnClick(event)
  {
    if(this.paintParams.scrollDisable || this.paintParams.removalContent || this.paintParams.moveLabel || this.paintParams.moveMarker || this.paintParams.selectionState || this.paintParams.autoClosePopUp)
    {
      event.target.closePopup();

      this.paintParams.autoClosePopUp = false;
    }
  }

  /* 
   * Remove this (remove display)
   */
  remove()
  {
    this.layer.remove();
  }

  /*
   * Get the geom of the selected paint layer
   */
  getSelectedGeom()
  {
    return this.selectedZone.geom;
  }

  /*
   * Check if all geom are empty
   */
  isEmpty()
  {
    let empty = true;

    for(let i = 0; i < this.paintZones.length; i++)
    {
      if(this.paintZones[i].geom != null)
        empty = false;
    }

    return empty;
  }

  /*
   * Add a new paintZone, get date and number
   */
  addPaintZone(numberZoneToCopy)
  {
    let number = 1;
    let startDate = DateConverter.dateToNumber(this.params.timeMin, false, this.params);
    let endDate = DateConverter.dateToNumber(this.params.timeMax, false, this.params);
    let geom = null;
    let popupContent = "";
    for(let i = 0; i < this.paintZones.length; i++)
    {
      if(this.paintZones[i].number >= number)
      {
        number = this.paintZones[i].number + 1;
      }
      if(this.paintZones[i].endDate >= startDate)
      {
        if(this.paintZones[i].endDate < endDate)
        {
          startDate = this.paintZones[i].endDate + 1;
        }
        else
        {
          startDate = endDate;
        }
      }

      if(this.paintZones[i].number == numberZoneToCopy)
      {
        geom = this.paintZones[i].geom;
        popupContent = this.paintZones[i].popupContent;
      }
    }

    this.paintZones.push(new PaintZone(number, this.params));
    this.selectedZone = this.paintZones[this.paintZones.length - 1];
    this.selectedZone.startDate = startDate;
    this.selectedZone.geom = geom;
    this.selectedZone.popupContent = popupContent;
  }

  /*
   * Change the selected zone from time value
   * @param {Number}               timeValue                   The time value
   */
  changeZoneFromTime(timeValue)
  {
    this.selectedZone = null;
    for(let i = 0; i < this.paintZones.length; i++)
    {
      if(timeValue >= this.paintZones[i].startDate && timeValue <= this.paintZones[i].endDate)
      {
        //if(this.selectedZone == null || this.selectedZone.geom == null)
        //{
          this.selectedZone = this.paintZones[i];
        //}
      }
    }

    this.redraw();
  }

  /*
   * Remove a paint zone
   * @param {PaintZone}               paintZoneToDelete                   paint zone to delete
   */
  removePaintZone(paintZoneToDelete)
  {
    for(let i = 0; i < this.paintZones.length; i++)
    {
      if(this.paintZones[i] == paintZoneToDelete)
      {
        this.paintZones.splice(i, 1);
      }
    }
  }

  /*
   * Update the labels size 
   */
  updateLabelSize()
  {
    this.label.updateZoom(this.paintParams.zoomLevel);

    if(this.selectedZone && this.selectedZone.geom != null)
    {
      this.label.redraw(this.layer, this.selectedZone.geom, this.selectedZone.number);
    }
  }
  
  /*
   * Export parent layer to json
   * @return {Object}                                        Content of the parentLayer
   */
  toJson()
  {
    let obj = {};
    
    obj["label"] = this.label.toJson();
    obj["options"] = this.polygonOptions;
    obj["number"] = this.number;
    obj["zones"] = [];
    for(let i = 0; i < this.paintZones.length; i++)
    {
      obj["zones"].push(this.paintZones[i].toJson());
    }
    
    return obj;
  }

  /*
   * Init from json content of the layer
   * @param {Object}               contentObj                   Content Object with parent layers informations
   */
  fromJson(contentObj)
  {
    this.paintZones = [];

    this.label.fromJson(contentObj["label"]);
    this.polygonOptions = contentObj["options"];
    this.number = contentObj["number"];

    for(let i = 0; i < contentObj["zones"].length; i++)
    {
      this.paintZones.push(new PaintZone(0, this.params));
      this.paintZones[i].fromJson(contentObj["zones"][i]);
    }

    this.selectedZone = this.paintZones[0];

    this.label.updateZoom(this.params.zoom);
    this.redraw();
  }

  /*
   * Change the select zone if param time is disable (first zone)
   */
  changeSelectZoneWithoutTime()
  {
    this.selectedZone = this.paintZones[0];
    this.redraw();
  }

  /**
   * Update paintZone date values for change date type
   * @param {String}               oldTypeDate                   The old date type
   * @param {String}               newTypeDate                   The new date type
   */
  updateTypeDate(oldTypeDate, newTypeDate)
  {
    for(let i = 0; i < this.paintZones.length; i++)
    {
      this.paintZones[i].updateTypeDate(oldTypeDate, newTypeDate);
    }
  }
}