
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
   * @property {String}             popupContent         The popup text
   */
  constructor(number, params)
  {
    this.geom = null;
    this.number = number;
    this.params = params;
    this.startDate = DateConverter.dateToNumber(this.params.timeMin, false, this.params);
    this.endDate = DateConverter.dateToNumber(this.params.timeMax, false, this.params);
    this.popupContent = "";
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
        //alert("geométrie non valide");
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
    obj["popupContent"] = this.popupContent;

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
    this.popupContent = contentObj["popupContent"];
  }

  /**
   * Fill In (transform geom to polygons and recreate a multipolygon)
   */
  fillIn()
  {
    let polygonsList = [];
    
    if(this.geom.geometry.type == "Polygon")
    {
      var rewind = turf.rewind(this.geom);
      polygonsList.push(rewind.geometry);
    }
    else
    {
      this.geom.geometry.coordinates.forEach(function(coords){
        var feat={'type':'Polygon','coordinates':coords};
        polygonsList.push(feat);
      });
    }

    this.geom  = {
      "type": "Feature",
      "geometry": {
        "type": "MultiPolygon",
        "coordinates": []
      },
    };

    for(let i = 0; i < polygonsList.length; i++)
    {
      polygonsList[i].coordinates.splice(1, polygonsList[i].coordinates[0].length - 1);
      this.geom.geometry.coordinates.push(polygonsList[i].coordinates);
    }

    this.geom = turf.union(this.geom, this.geom);
  }

  /**
   * Simplify the geom
   * @param {Number}               tolerance                   The tolerence od simplification
   */
  simplify(tolerance)
  {
    var options = {tolerance: tolerance, highQuality: true};  // 0.005 à 0.1
    this.geom = turf.simplify(this.geom, options);
  }

  /** 
   * Set the start date from date string
   * @param {String}               startDateStr                   The start date str
   */
  setStartDate(startDateStr)
  {
    this.startDate = DateConverter.dateToNumber(startDateStr, false, this.params);
  }

  /** 
   * Set the end date from date string
   * @param {String}               endDateStr                   The start date str
   */
  setEndDate(endDateStr)
  {
    this.endDate = DateConverter.dateToNumber(endDateStr, true, this.params);
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
   * Create auto border with all other layers
   * @param {LayersManager}               layersManager                   The layerManager
   */
  autoBorder(layersManager)
  {
    for(let i = 0; i < layersManager.layerGroups.length; i++)
    {
      if(layersManager.layerGroups[i].selectedZone && layersManager.layerGroups[i].selectedZone != this)
      {
        this.geom = turf.difference(this.geom, layersManager.layerGroups[i].selectedZone.geom);
      }
    }
  }
}