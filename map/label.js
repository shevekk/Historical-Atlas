/*
 * Label of a layer (L.Tootip)
 */
class Label
{
  /* 
   * @property {String}            value              The label value (content)
   * @property {Number}            textSize           Size of the text (param)
   * @property {Number}            fontSize           Fond display size
   * @property {L.tooltip}         tooltip            Layer for cursor drawing
   * @property {Number[]}          position           Array of perso position (choose by user)
   * @property {Boolean}           positionPerso      True if position is not the center of layer
   */
  constructor(value)
  {
    this.value = value;
    this.textSize = 10;
    this.fontSize = 0;
    this.tooltip = null;

    this.position = [];
    this.positionPerso = false;
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
   * @param {Number[]}          position           Array of perso position (choose by user)
   */
  setPersoPosition(position)
  {
    this.position = position;
    this.positionPerso = true;
  }

  /*
   * Draw the layer
   * @property {L.layerGroup}        layer                The parent drawing layer
   * @property {Object}              geom                 Geom of the parent polygon
   */
  redraw(layer, geom)
  {
    layer.removeLayer(this.tooltip)
    
    var center = turf.center(geom);
 
    this.tooltip = L.tooltip({
      direction: 'center',
      permanent: true,
      interactive: false,
      noWrap: true,
      opacity: 1,
      className: 'label-tooltip'
    });

    if(this.positionPerso)
    {
      this.tooltip.setLatLng(new L.LatLng(this.position[1], this.position[0]));
    }
    else
    {
      this.tooltip.setLatLng(new L.LatLng(center.geometry.coordinates[1], center.geometry.coordinates[0]));
    }
    
    this.tooltip.setContent(`<p style="font-size: ${Math.round(this.fontSize)}px"> ${this.value} </p>`);
    this.tooltip.addTo(layer);
  }

  /*
   * Export to json
   */
  toJson()
  {
    let objResult = {};
    objResult["value"] = this.value;
    objResult["textSize"] = this.textSize;
    objResult["position"] = this.position;
    objResult["positionPerso"] = this.positionPerso;
    return objResult;
  }

  /*
   * Import from json
   */
  fromJson(obj)
  {
    if(obj)
    {
      this.value = obj["value"];
      this.textSize = obj["textSize"];
      this.position = obj["position"];
      this.positionPerso = obj["positionPerso"];
    }
  } 
}