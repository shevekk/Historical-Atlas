
/*
 * Paint layer 
 */
class PaintLayer
{
  /*
   * Initialize the PaintLayer
   * @property {L.map}               map                  The map
   * @property {Object}              polygonOptions       The option of polygon draw
   * @property {Number}              number               The number
   * @property {PaintParams}         paintParams          The paint parameters

   * @property {Object}              geom                 Geom of the polygon
   * @property {L.layerGroup}        layer                The drawing layer
   * @property {Label}               label                The label of the layer

   */
  constructor(map, polygonOptions, number, paintParams)
  {
    this.geom = null;
    this.polygonOptions = polygonOptions;
    this.layer = L.layerGroup().addTo(map);
    this.map = map;
    this.number = number;

    this.label = new Label("Layer" + (number+1));
    this.label.updateZoom(paintParams.zoomLevel);
  }

  /*
   * Add a geom content to the geom and redraw layer
   * @param {object}                  geom                  Geom to add of the content
   */
  addContent(geom)
  {
    let newGeom = null;
    if(this.geom != null)
    {
      try {
        this.geom = turf.union(this.geom, geom);
      }
      catch (error) {
        console.error(error);
        alert("geométrie non valide");
        return false;
      }
    }
    else
    {
      this.geom = geom;
    }

    this.redraw();

    return true;
  }

  /*
   * Remove a geom content to the geom and redraw layer
   * @param {object}                  geom                  Geom to remove of the content
   */
  removeContent(geom)
  {
    if(this.geom != null)
    {
      this.geom = turf.difference(this.geom, geom);
      
      let polygon = null;
      if(this.geom != null)
      {
        polygon = L.polygon(this.geom.geometry.coordinates, this.polygonOptions);
      }
      
      this.redraw();
    }
  }

  /*
   * Redraw the layer with geom
   */
  redraw()
  {
    this.layer.remove();

    if(this.geom != null)
    {   
      this.layer = L.geoJSON(this.geom, this.polygonOptions).addTo(this.map);

      this.label.redraw(this.layer, this.geom);
    }
  }
}