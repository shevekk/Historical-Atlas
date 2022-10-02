
class Layer
{
  /*
   * Layer class
   * @property {Object}                 layerObj                   The layer Obj
   * @property {mapboxgl.Map}           map                        The map
   * @property {TimeBar}                timeBar                    The time Bar
   */
  constructor(layerObj, number, map, timeBar) {
    this.selectedZone = null;

    this.zones = layerObj.zones;
    this.label = layerObj.label;
    this.options = layerObj.options;
    this.properties = layerObj.properties;

    this.number = number;

    this.addUI(map, timeBar);
  }

  /*
   * Add a layer in UI
   * @param {mapboxgl.Map}          map                The map
   * @param {TimeBar}               timeBar            The time Bar
   */
  addUI(map, timeBar) {
    let me = this;

    let fillColor = this.options.fillColor;
    if(!fillColor) {
      fillColor = this.options.color;
    }

    let opacityCode = parseInt(this.options.fillOpacity * 255).toString(16);

    let html = `<div class="right-layer-ui-div" id="layer-ui-${this.number}"><p><div class="right-layer-ui-square" style="background-color:${fillColor}${opacityCode}; border:2px solid ${this.options.color};"></div><span style="margin-left:6px;">${this.label.value}</span></p></div>`;

    $("#right-layer-ui").append(html);

    $(`#layer-ui-${this.number}`).dblclick(() => {

      if(!this.selectedZone) {
        timeBar.changeValue(this.zones[0].startDate);
      }

      if(this.selectedZone) {
         let geom = turf.bbox(this.selectedZone.geom);
         map.fitBounds(geom);
      }
    });
  }

  /*
   * Hide the layer
   * @param {mapboxgl.Map}          map                The map
   */
  hide(map) {
    map.setLayoutProperty('layer'+this.number, 'visibility', 'none');
    if(this.options.weight >= 1) {
      map.setLayoutProperty('layerLine'+this.number, 'visibility', 'none');
    }
    $(`#layer-ui-${this.number}`).css("color", "#a6a6a6");
  }

  /*
   * Show the layer
   * @param {mapboxgl.Map}          map                The map
   */
  show(map) {
    map.setLayoutProperty('layer'+this.number, 'visibility', 'visible');
    if(this.options.weight >= 1) {
      map.setLayoutProperty('layerLine'+this.number, 'visibility', 'visible');
    }
    $(`#layer-ui-${this.number}`).css("color", "black");
  }
}
