/*
 * Label of a layer (L.Tootip)
 */
class Label
{
  /* 
   * @property {String}            value                     The label value (content)
   * @property {Number}            textSize                  Size of the text (param)
   * @property {Number}            fontSize                  Fond display size
   * @property {L.tooltip}         tooltip                   Layer for cursor drawing
   * @property {Object}            customPositions           Object of custom position (choose by user) - Key is paintZone number
   */
  constructor(value)
  {
    this.value = value;
    this.textSize = 10;
    this.fontSize = 0;
    this.tooltip = null;

    this.customPositions = {};
  }

  /* 
   * Update the fontSize from zoom
   * @param {Number}            zoomLevel              The zoom value
   */
  updateZoom(zoomLevel)
  {
    this.fontSize = this.textSize + (this.textSize / 40) * Math.pow(2, zoomLevel);
  }

  /* 
   * Update the size of the text
   * @param {Number}            textSize               The selected text size
   * @param {Number}            zoomLevel              The zoom value
   */
  updateSize(textSize, zoomLevel)
  {
    this.textSize = textSize;

    this.updateZoom(zoomLevel);
  }

  /*
   * Define a custom position 
   * @param {Number}            number           The paintZone number
   * @param {Number[]}          position         Array of perso position (choose by user)
   */
  setCustomPosition(number, position)
  {
    this.customPositions[number] = position;
  }

  /*
   * Draw the layer
   * @param {L.layerGroup}        layer                The parent drawing layer
   * @param {Object}              geom                 Geom of the parent polygon
   * @param {Number}              number               The paintZone number
   */
  redraw(layer, geom, number)
  {
    layer.removeLayer(this.tooltip);
    
    if(geom)
    {
      var center = turf.center(geom);
   
      this.tooltip = L.tooltip({
        direction: 'center',
        permanent: true,
        interactive: false,
        noWrap: true,
        opacity: 1,
        className: 'label-tooltip'
      });

      if(this.customPositions[number])
      {
        this.tooltip.setLatLng(new L.LatLng(this.customPositions[number][1], this.customPositions[number][0]));
      }
      else
      {
        this.tooltip.setLatLng(new L.LatLng(center.geometry.coordinates[1], center.geometry.coordinates[0]));
      }
      
      this.tooltip.setContent(`<p style="font-size: ${Math.round(this.fontSize)}px"> ${this.value} </p>`);
      this.tooltip.addTo(layer);
    }
  }

  /*
   * Export to json
   */
  toJson()
  {
    let objResult = {};
    objResult["value"] = this.value;
    objResult["textSize"] = this.textSize;
    objResult["customPositions"] = this.customPositions;
    return objResult;
  }

  /*
   * Import from json
   * @param {Object}              obj               Object of label value
   */
  fromJson(obj)
  {
    if(obj)
    {
      this.value = obj["value"];
      this.textSize = obj["textSize"];

      if(obj["customPositions"])
      {
        this.customPositions = obj["customPositions"];
      }
    }
  } 
}