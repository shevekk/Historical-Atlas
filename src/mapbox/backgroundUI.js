
class BackgroundUI
{
  /*
   * @property {Param}                 params                     The params
   * @property {mapboxgl.Map}          map                        The map
   * @property {TimeBar}               timeBar                    The time bar
   * @property {Object}                jsonBackgrounds            The json background
   */
  constructor(params) {
    this.params = params;
    this.map = map;
    this.timeBar = null;
    this.jsonBackgrounds = null;
  }

  /*
   * Init the class and load data
   * @param {mapboxgl.Map}            map                       The map
   * @param {TimeBar}                 timeBar                   The time Bar
   * @param {Function}                initCallback              Function call when data is load
   */
  init(map, timeBar, initCallback) {
    let me = this;
    me.map = map;
    me.timeBar = timeBar;
    me.jsonBackgrounds = null;

    $.getJSON("config/backgounds.json", function(jsonBackgrounds) {
      me.jsonBackgrounds = jsonBackgrounds;

      initCallback();
    });

    // Manage show hide UI
    $("#right-ui-backgrounds-icon-hide").click(() => {
      if($("#right-ui-backgrounds-content").css("display") == "none")
      {
        $("#right-ui-backgrounds-content").css("display", "block");
        $("#right-ui-backgrounds").css("background", "rgba(255, 255, 255, 1)");
        $("#right-ui-backgrounds-icon-hide").prop("src", "img/menu/minus-solid.svg");
      }
      else
      {
        $("#right-ui-backgrounds-content").css("display", "none");
        $("#right-ui-backgrounds").css("background", "rgba(255, 255, 255, 0.5)");
        $("#right-ui-backgrounds-icon-hide").prop("src", "img/menu/plus-solid.svg");
      }
    });
  }

  /*
   * Update the list of element and create UI
   * @param {Function}            clearMapCallback          Function for clear map data (layer and markers)
   * @param {Function}            reloadMapCallback         Function for recreate map
   */
  updateList(clearMapCallback, reloadMapCallback)
  {
    let content = '';
    for(let i = 0; i < this.params.backgrounds.length; i++)
    {
      let id = this.params.backgrounds[i];
      let name = this.jsonBackgrounds[id].name;

     if(this.jsonBackgrounds[id].type == "tile" && this.jsonBackgrounds[id].mapbox.enable) {

        if(this.selectedBackground == id)
        {
          content += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType" checked="checked"/><label for="${id}">${name}</label><br/>`;
        }
        else
        {
          content += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType"/><label for="${id}">${name}</label><br/>`;
        }
      }
    }

    var div = document.getElementById("right-ui-backgrounds-content");
    div.innerHTML = content;

    this.manageEvents(clearMapCallback, reloadMapCallback);
  }

  /*
   * Manage action of background change
   * @param {Function}            clearMapCallback          Function for clear map data (layer and markers)
   * @param {Function}            reloadMapCallback         Function for recreate map
   */
  manageEvents(clearMapCallback, reloadMapCallback)
  {
    var me = this;

    $(".selectMapBackgoundType").change(function()
    {
      let id = $(this)[0].id;

      me.setBackground(id, clearMapCallback, reloadMapCallback);
    });
  }

  /*
   * Set the background of the map
   * @param {String}              id                        The id name
   * @param {Function}            clearMapCallback          Function for clear map data (layer and markers)
   * @param {Function}            reloadMapCallback         Function for recreate map
   */
  setBackground(id, clearMapCallback, reloadMapCallback)
  {
    if(this.jsonBackgrounds[id].type == "tile" && this.jsonBackgrounds[id].mapbox.enable) {

      this.selectedBackground = id;

      let style = {};
      style.version = 8;
      style.sources = {};
      style.sources['raster-tiles'] = {};
      style.sources['raster-tiles'].type = 'raster';
      style.sources['raster-tiles'].tiles = [this.jsonBackgrounds[id].mapbox.url];
      style.sources['raster-tiles'].tileSize = 256;
      style.sources['raster-tiles'].attribution = this.jsonBackgrounds[id].params.attribution;
      style.layers = [{
        'id': 'simple-tiles',
        'type': 'raster',
        'source': 'raster-tiles',
        'minzoom': 0,
        'maxzoom': 22
      }];

      clearMapCallback();

      this.map.setStyle(style);
      this.map.on('styledata', function() {
        reloadMapCallback();
      });
    }
  }
}
