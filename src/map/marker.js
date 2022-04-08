/*
 * 
 */
class Marker
{
  /* 
   * Class for manage a marker
   * @property {Number}                  number                   The number of the marker
   * @property {String}                  label                    Label value
   * @property {Number}                  startDate                The start date 
   * @property {Number}                  endDate                  The end date 
   * @property {String}                  popUpContent             The popup value 
   * @property {Array}                   position                 The array of position 
   * @property {String}                  img                      The image url
   * @property {String}                  imgKey                   The image key (in list)
   * @property {String}                  color                    The color value
   * @property {Number}                  size                     The size value
  */
  constructor(paintParams, number, label, startDate, endDate, popUpContent, position, img, imgKey, color, size)
  {
    this.visible = false;

    this.number = number;
    this.paintParams = paintParams;

    if(label)
    {
      this.edit(label, startDate, endDate, popUpContent, position, img, imgKey, color, size);
    }
  }

  /**
   * Edit values
   * @param {String}                  label                   Label value
   * @param {Number}                  startDate               The start date 
   * @param {Number}                  endDate                 The end date 
   * @param {String}                  popUpContent            The popup value 
   * @param {Array}                   position                The array of position 
   * @param {String}                  img                     The image url
   * @param {String}                  imgKey                  The image key (in list)
   * @param {String}                  color                   The color value
   * @param {Number}                  size                    The size value
   */
  edit(label, startDate, endDate, popUpContent, position, img, imgKey, color, size)
  {
    this.label = label;
    this.startDate = parseInt(startDate);
    this.endDate = parseInt(endDate);
    this.popUpContent = popUpContent;
    this.position = position;
    this.color = color;
    this.size = size;

    this.img = img;
    this.imgKey = imgKey;

    this.icon = L.colorIcon({
      iconSize : [size, size],
      popupAnchor : [0, -size/2],
      iconUrl: this.img,
      color: this.color
    })
  }

  /**
   * Draw marker in the map
   * @param {L.Map}                  map                   The map
   */
  draw(map)
  {
    let me = this;

    if(!this.visible)
    {
      this.marker = L.marker([this.position[0], this.position[1]], {icon: this.icon}).addTo(map);

      if(this.popUpContent)
      {
        //this.marker = L.marker([this.position[0], this.position[1]], {icon: this.icon}).addTo(map).bindPopup(this.popUpContent).on('click', onClick);
        this.marker.bindPopup(this.popUpContent).on('click', function(e) { 
          me.closePopUpOnClick(e); 

          let evt = new CustomEvent("selectMakerInMap", { detail: {markerNumber : me.number} }); 
          document.dispatchEvent(evt); 
        });
      }

      this.visible = true;

      // Add label
      /*
      this.tooltip = L.tooltip({
        direction: 'center',
        permanent: true,
        interactive: false,
        noWrap: true,
        opacity: 1,
        className: 'label-tooltip'
      });

      this.tooltip.setLatLng(new L.LatLng(this.position[0], this.position[1]));
      
      this.tooltip.setContent(`<p style="font-size: 25px"> ${this.label} </p>`);
      this.tooltip.addTo(map);
      */
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

  /**
   * Hide marker
   */
  clear()
  {
    if(this.visible)
    {
      this.marker.remove();

      this.visible = false;
    }
  }

  /**
   * Update visibility of the marker if is in time value
   * @param {Number}                 timeValue             The time value
   * @param {L.Map}                  map                   The map
   * @param {Params}                 params                The params
   */
  updateVisibilityFromTime(timeValue, map, params)
  {
    if(params.timeEnable)
    {
      if(this.startDate || this.endDate)
      {
        if(!this.startDate)
        {
          this.startDate = params.timeMin;
        }
        if(!this.endDate)
        {
          this.endDate = params.timeMax;
        }

        if(this.startDate <= timeValue && this.endDate >= timeValue)
        {
          this.draw(map);
        }
        else
        {
          this.clear();
        }
      }
      else
      {
        this.draw(map);
      }
    }
    else
    {
      this.draw(map);
    }
  }

  /**
   * Update visibility of the marker if is in time area
   * @param {Number}               startTime                 The start time value
   * @param {Number}               endTime                   The end time value
   * @param {L.Map}                  map                   The map
   * @param {Params}                 params                The params
   */
  updateVisibilityFromTimeArea(startTime, endTime, map, params)
  {
    if(this.startDate || this.endDate)
    {
      if(!this.startDate)
      {
        this.startDate = params.timeMin;
      }
      if(!this.endDate)
      {
        this.endDate = params.timeMax;
      }

      if(this.startDate <= endTime && this.endDate >= startTime)
      {
        this.draw(map);
      }
      else
      {
        this.clear();
      }
    }
    else
    {
      this.draw(map);
    }
  }

  /**
   * Update date values for change date type
   * @param {String}               oldTypeDate                   The old date type
   * @param {String}               newTypeDate                   The new date type
   */
  updateTypeDate(oldTypeDate, newTypeDate)
  {
    this.startDate = DateConverter.updateTypeDate(this.startDate, oldTypeDate, newTypeDate, false);
    this.endDate = DateConverter.updateTypeDate(this.endDate, oldTypeDate, newTypeDate, true);
  }

  /** 
   * Export marker to json object
   */
  toJson()
  {
    let obj = {};

    obj["label"] = this.label;
    obj["startDate"] = this.startDate;
    obj["endDate"] = this.endDate;
    obj["popUpContent"] = this.popUpContent;
    obj["position"] = this.position;
    obj["color"] = this.color;
    obj["size"] = this.size;

    obj["img"] = this.img;
    obj["imgKey"] = this.imgKey;
    
    return obj;
  }

  /** 
   * Init marker from json value
   * @param {Object}               contentObj                   The json data object
   */
  fromJson(contentObj)
  {
    this.label = contentObj["label"];
    this.startDate = contentObj["startDate"];
    this.endDate = contentObj["endDate"];
    this.popUpContent = contentObj["popUpContent"];
    this.position = contentObj["position"];
    this.color = contentObj["color"];
    this.size = contentObj["size"];

    this.img = contentObj["img"];
    this.imgKey = contentObj["imgKey"];

    this.edit(this.label, this.startDate, this.endDate, this.popUpContent, this.position, this.img, this.imgKey, this.color, this.size)
  }
}