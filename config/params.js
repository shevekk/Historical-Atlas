
/*
 * Parameters 
 * @property {Number}        cursorMinLng           Min cursors position in map
 * @property {Number}        cursorMaxLng           Max cursors position in map
 * @property {Boolean}       editMode               Edit state
 * @property {Number}        zoom                   The default zoom
 * @property {Number}        minZoom                The zoom min
 * @property {Number}        maxZoom                The zoom max
 * @property {Number[]}      defaultPosition        The default position
 * @property {String}        backgroundDefault      The default background key name
 * @property {String[]}      backgrounds            The possible backgrounds key name
 */
class Params
{
  constructor()
  {
    this.cursorMinLng = -200;
    this.cursorMaxLng = 200;

    this.editMode = true;

    this.zoom = 6;
    this.minZoom = 0;
    this.maxZoom = 22;

    this.defaultPosition = [46.7213889, 2.4011111];

    this.backgroundDefault = "openstreetmap";
    this.backgrounds = [];

    this.timeEnable = false;
    this.timeMin = 1900;
    this.timeMax = 2000;
  }

  /*
   * Export to json
   * @param {Object}               content                   Object content
   * @return                                                 Object content with new params
   */
  toJson(content)
  {
    content.params = {};
    content.params["zoom"] = this.zoom;
    content.params["minZoom"] = this.minZoom;
    content.params["maxZoom"] = this.maxZoom;
    content.params["defaultPosition"] = this.defaultPosition;
    content.params["backgroundDefault"] = this.backgroundDefault;
    content.params["backgrounds"] = this.backgrounds;

    content.params["timeEnable"] = this.timeEnable;
    content.params["timeMin"] = this.timeMin;
    content.params["timeMax"] = this.timeMax;

    return content;
  }

  /*
   * Import from json
   * @param {Object}               content                   Object content
   */
  fromJson(content)
  {
    if(content.params)
    {
      this.zoom = parseFloat(content.params["zoom"]);
      this.minZoom = parseFloat(content.params["minZoom"]);
      this.maxZoom = parseFloat(content.params["maxZoom"]);
      this.defaultPosition = content.params["defaultPosition"];
      this.backgroundDefault = content.params["backgroundDefault"];
      this.backgrounds = content.params["backgrounds"];

      this.timeEnable = content.params["timeEnable"];
      this.timeMin = content.params["timeMin"];
      this.timeMax = content.params["timeMax"];
    }
  }

  /*
   * Update map from json params
   * @param {L.Map}               map                   The map
   */
  updateMap(map)
  {
    map.setZoom(this.zoom);
    if(this.minZoom)
    {
      map.setMaxZoom(this.maxZoom);
    }
    if(this.maxZoom)
    {
      map.setMinZoom(this.minZoom);
    }

    map.panTo(new L.LatLng(this.defaultPosition[0], this.defaultPosition[1]));
  }
}