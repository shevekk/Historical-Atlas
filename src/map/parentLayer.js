
/*
 * Paint layer 
 */
class ParentLayer
{
  /*
   * Initialize the Parent layer containing paintLayers
   * @property {L.map}               map                         The map
   * @property {Object}              polygonOptions              The option of polygon draw
   * @property {Object}              polygonOptionsInitial       The option of polygon defaut (option with no properties filters)
   * @property {Number}              viewPropertyNumber          The number of property filter apply (-1 if no property filter)
   * @property {Number}              number                      The number
   * @property {PaintParams}         paintParams                 The paint parameters
   * @property {PropertyLayer[]}     properties                  The properties parameters
   * @property {L.layerGroup}        layer                       The drawing layer
   * @property {Label}               label                       The label of the layer
   * @property {PaintZone[]}         paintZones                  Array of all paint layers
   * @property {PaintZone}           selectedZone                The selected paintLayer
   */
  constructor(map, polygonOptions, number, paintParams, params)
  {
    this.polygonOptionsInitial = polygonOptions;
    this.polygonOptions = polygonOptions;
    this.layer = L.layerGroup().addTo(map);
    this.map = map;
    this.number = number;
    this.params = params;
    this.paintParams = paintParams;
    this.properties = [];
    this.viewPropertyNumber = -1;

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
   * @param {Number}               numberZoneToCopy            The number of zone to get geom
   * @param {Boolean}              autoSelected                True for auto select layer
   */
  addPaintZone(numberZoneToCopy, autoSelected)
  {
    let number = 1;
    let startDate = DateConverter.dateToNumber(this.params.timeMin, false, this.params);
    let endDate = DateConverter.dateToNumber(this.params.timeMax, false, this.params);
    let geom = null;
    let copyNumber = -1;
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
        copyNumber = this.paintZones[i].number;
      }
    }

    this.paintZones.push(new PaintZone(number, this.params));

    this.paintZones[this.paintZones.length - 1].startDate = startDate;
    this.paintZones[this.paintZones.length - 1].geom = geom;
    this.paintZones[this.paintZones.length - 1].popupContent = popupContent;

    // Copy position of the label
    if(copyNumber >= 0)
    {
      this.label.customPositions[this.paintZones[this.paintZones.length - 1].number] = this.label.customPositions[copyNumber];
    }

    if(autoSelected)
    {
      this.selectedZone = this.paintZones[this.paintZones.length - 1];
    }
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
        this.selectedZone = this.paintZones[i];

        // Manage view with property filter
        if(this.viewPropertyNumber >= 0)
        {
          let valueNumber = 1;
          let propLayer = this.properties.find(p => p.propNumber == this.viewPropertyNumber);

          if(propLayer)
          {
            if(!propLayer.startDate || !propLayer.endDate || (propLayer.startDate <= timeValue && propLayer.endDate >= timeValue))
            {
              valueNumber = propLayer.valueNumber;
            }

            let prop = PropertiesForm.properties.find((p) => p.number == this.viewPropertyNumber);
            prop.modifyPolygonOptions(this.polygonOptions, valueNumber);
          }
        }
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
    obj["options"] = this.polygonOptionsInitial;
    obj["number"] = this.number;
    obj["properties"] = this.properties;
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
    this.polygonOptionsInitial = contentObj["options"];
    this.number = contentObj["number"];

    if(contentObj["properties"])
    {
      this.properties = contentObj["properties"];
    }

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

    for(let i = 0; i < this.properties.length; i++)
    {
      this.properties[i].startDate = DateConverter.updateTypeDate(this.properties[i].startDate, oldTypeDate, newTypeDate, false);
      this.properties[i].endDate = DateConverter.updateTypeDate(this.properties[i].endDate, oldTypeDate, newTypeDate, true);
    }
  }
}