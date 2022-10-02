
class LayersManager
{
  /*
   * @property {mapboxgl.Map}            map                       The map
   * @property {TimeBar}                 timeBar                   The time Bar
   * @property {Layers[]}                layers                    The layers datas
   * @property {Marker[]}                markers                   The markers datas
   */
  constructor() {
    this.map = null;
    this.timeBar = null;
    this.layers = [];
    this.markers = [];
    this.viewPropertyNumber = -1;
  }

  /*
   * Init the class
   * @param {mapboxgl.Map}            map                       The map
   * @param {TimeBar}                 timeBar                   The time Bar
   * @param {Object[]}                layersObj                 The layers datas
   * @param {Object[]}                markersObj                The markers datas
   * @param {Object[]}                propertiesObj             The properties datas
   */
  init(map, timeBar, layersObj, markersObj, propertiesObj) {
    this.map = map;
    this.timeBar = timeBar;

    this.layers = [];
    this.markers = [];
    this.properties = propertiesObj;

     $("#right-marker-ui").html("");
     $("#right-layer-ui").html("");

    for(let i = 0; i < layersObj.length; i++) {
      this.layers.push(new Layer(layersObj[i], i, map, timeBar));
    }

    for(let i = 0; i < markersObj.length; i++) {
      this.markers.push(new Marker(markersObj[i], i, map, timeBar));
    }

    this.manageUIVisiblity();
  }

  /*
   * Change the time, hide/show layers and markers
   * @param {Number}            timeValue                 The time value
   */
  changeTime(timeValue) {

    // Change layers visibility
    for(let i = 0; i < this.layers.length; i++) {

      this.layers[i].selectedZone = null;
      for(let j = 0; j < this.layers[i].zones.length; j++) {

        if(timeValue >= this.layers[i].zones[j].startDate && timeValue <= this.layers[i].zones[j].endDate) {
          this.layers[i].selectedZone = this.layers[i].zones[j];
          this.map.getSource('layer' + i).setData(this.layers[i].selectedZone.geom);

          // Manage view with property filter
          if(this.viewPropertyNumber > 0)
          {
            let valueNumber = 1;
            let propLayers = this.layers[i].properties.filter(p => p.propNumber == this.viewPropertyNumber);
            for(let j = 0; j < propLayers.length; j++) {
              if(!propLayers[j].startDate || !propLayers[j].endDate || (propLayers[j].startDate <= timeValue && propLayers[j].endDate >= timeValue))
              {
                valueNumber = propLayers[j].valueNumber;;
              }
            }

            if(valueNumber >= 0) {
              // Change display of layer from prop data
              let prop = this.properties.find((p) => p.number == this.viewPropertyNumber);

              this.map.setPaintProperty("layer" + this.layers[i].number, 'fill-color', prop.colors[valueNumber]);
              this.map.setPaintProperty("layer" + this.layers[i].number, 'fill-opacity', parseInt(prop.opacity[valueNumber]) / 100);
              if(this.layers[i].options.weight >= 1) {
                this.map.setPaintProperty("layerLine" + this.layers[i].number, 'line-color', prop.colors[valueNumber]);
              }
            }
          }
        }
      }

      if(this.layers[i].selectedZone == null) {
        this.layers[i].hide(this.map);
      } else {
        this.layers[i].show(this.map);
      }
    }

    // Change markers visibility
    for(let i = 0; i < this.markers.length; i++) {

      if(timeValue >= this.markers[i].data.startDate && timeValue <= this.markers[i].data.endDate) {
        this.markers[i].show(this.map);
      }
      else {
        this.markers[i].hide(this.map);
      }
    }
  }

  /*
   * Change the visible markers for a time area
   * @param {Number}               startTime                 The start time value
   * @param {Number}               endTime                   The end time value
   * @param {Params}               params                    The params
   */
  displayTimeArea(startTime, endTime, params) {
    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].updateVisibilityFromTimeArea(startTime, endTime, this.map, params); 
    }
  }

  /**
   * Manage show/hide layer UI 
   */
  manageUIVisiblity() {
    $("#right-ui-elements-icon-hide").click(() => {
      if($("#right-ui-elements-content").css("display") == "none")
      {
        $("#right-ui-elements-content").css("display", "block");
        $("#right-ui-elements").css("background", "rgba(255, 255, 255, 1)");
        $("#right-ui-elements-icon-hide").prop("src", "img/menu/minus-solid.svg");
      }
      else
      {
        $("#right-ui-elements-content").css("display", "none");
        $("#right-ui-elements").css("background", "rgba(255, 255, 255, 0.5)");
        $("#right-ui-elements-icon-hide").prop("src", "img/menu/plus-solid.svg");
      }
    });
  }
}