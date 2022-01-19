
/* 
 * Manage copy and paste actions
 */
class CopyManager
{
  /*
   * Init the copy manager
   * @property {L.Map}                      map                      The map
   * @property {ActionsList}                actionsList              Manager of action list and undo/redo
   * @property {Boolean}                    enable                   The enable state
   * @property {Array}                      coords                   The coordonates list
   * @property {Object}                     polygonCopy              The polygon to copy
   * @property {Object}                     lastPolygon              The last selected polygon
   * @property {L.polyline}                 polyline                 The display polyline
   * @property {L.layerGroup}               layer                    The display layer with polygon or polyline
   */
  constructor(map, actionsList)
  {
    this.map = map;
    this.actionsList = actionsList;

    this.enable = false;

    this.coords = [];

    this.polygonCopy = null;
    this.lastPolygon = null;
    this.polyline = null;

    this.layer = L.layerGroup().addTo(map);
  }

  /*
   * Enable of disable the copy manager
   * @param {Boolean}                      enable                      The enable state
   */
  setEnableState(enable)
  {
    this.enable = enable;

    if(enable)
    {
      this.map.dragging.disable();
    }
    else
    {
      this.coords = [];
      this.layer.remove();
    }
  }

  /*
   * Add a point to the selection (move mouse)
   * @param {Event}                      e                      The event with lat, long coords
   */
  addPoint(e)
  {
    this.map.dragging.disable();

    this.coords.push([e.latlng.lat, e.latlng.lng]);

    this.polyline = L.polyline(this.coords, {color: 'black'}).addTo(this.layer);
    this.layer.addTo(this.map);
  }

  /*
   * End draw (move up)
   */
  endDraw()
  {
    let lineCoords = [];
    for(let i = 0; i < this.coords.length; i++)
    {
      lineCoords.push([this.coords[i][1], this.coords[i][0]]);
    }

    var line = turf.lineString(lineCoords);

    this.coords = [];

    this.layer.remove();

    this.lastPolygon = turf.lineToPolygon(line);

    this.layer = L.geoJSON(this.lastPolygon, {color: 'black', fillOpacity : 0}).addTo(this.map);
  }

  /*
   * Copy the current selection (intereset with selected layer)
   * @param {LayersManager}        layersManager           The layerd manager
   */
  copy(layersManager)
  {
    this.actionsList.addActionCopy(this);

    this.polygonCopy = turf.intersect(this.lastPolygon, layersManager.selectedLayer.selectedZone.geom);

    this.layer.setStyle({fillOpacity : 0.2});    
  }

  /*
   * Paste copy zone to the selected layer
   * @param {LayersManager}        layersManager           The layerd manager
   */
  paste(layersManager)
  {
    if(this.polygonCopy)
    {
      this.actionsList.addActionPaste(layersManager);

      layersManager.selectedLayer.addContent(this.polygonCopy);
    }
  }
}
