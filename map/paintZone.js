
/*
 * Paint layer, with geom and dates
 */
class PaintZone
{
  /*
   * Initialize the PaintZone
   * @param {Number}                number               The number of PaintZone
   * @param {Params}                params               The Params
   * @property {Object}             geom                 Geom of the polygon
   * @property {Number}             startDate            Start date
   * @property {Number}             endDate              End date
   */
  constructor(number, params)
  {
    this.geom = null;
    this.number = number;
    this.params = params;
    this.startDate = this.params.timeMin;
    this.endDate = this.params.timeMax;
  }

  /*
   * Add a geom content to the geom
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
      }
    }
    else
    {
      this.geom = geom;
    }
  }

  /*
   * Remove a geom content to the geom
   * @param {object}                  geom                  Geom to remove of the content
   */
  removeContent(geom)
  {
    this.geom = turf.difference(this.geom, geom);
    
    let polygon = null;
    if(this.geom != null)
    {
      polygon = L.polygon(this.geom.geometry.coordinates, this.polygonOptions);
    }
  }

  /*
   * Export paintZone to json
   * @return {Object}                                        Content of the paintZone
   */
  toJson()
  {
    let obj = {};

    obj["geom"] = this.geom;
    obj["startDate"] = this.startDate;
    obj["endDate"] = this.endDate;
    obj["number"] = this.number;

    return obj;
  }

  /*
   * Init from json content of paint zone
   * @param {Object}               contentObj                   Content Object with paintZone informations
   */
  fromJson(contentObj)
  {
    this.geom = contentObj["geom"];
    this.startDate = contentObj["startDate"];
    this.endDate = contentObj["endDate"];
    this.number = contentObj["number"];
  }
}