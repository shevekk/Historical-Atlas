
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
   * Fill In (transform geom to polygon)
   */
  fillIn()
  {
    var rewind = turf.rewind(this.geom);

    rewind.geometry.coordinates.splice(1, rewind.geometry.coordinates[0].length - 1);

    this.geom = rewind;
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
    if(oldTypeDate == "days" && newTypeDate == "months")
    {
      let startYear = Math.floor(this.startDate / 366);
      let startDateObject = new Date(startYear, 0, 1);
      startDateObject.setDate(1 + this.startDate % 366);
      this.startDate = startYear * 12 + startDateObject.getMonth();

      let endYear = Math.floor(this.endDate / 366);
      let endDateObject = new Date(endYear, 0, 1);
      endDateObject.setDate(1 + this.endDate % 366);
      this.endDate = endYear * 12 + endDateObject.getMonth();
    }
    else if(oldTypeDate == "days" && newTypeDate == "years")
    {
      this.startDate = Math.floor(this.startDate / 366);
      this.endDate = Math.floor(this.endDate / 366);
    }
    else if(oldTypeDate == "months" && newTypeDate == "days")
    {
      let startYear = Math.floor(this.startDate / 12);
      let startDateObject = new Date(startYear, this.startDate % 12, 1);
      this.startDate = startYear * 366 + (startDateObject.getDOY() - 1);

      let endYear = Math.floor(this.endDate / 12);
      let endDateObject = new Date(endYear, (this.endDate % 12) + 1, 0);
      this.endDate = endYear * 366 + (endDateObject.getDOY() - 1);
    }
    else if(oldTypeDate == "months" && newTypeDate == "years")
    {
      this.startDate = Math.floor(this.startDate / 12);
      this.endDate = Math.floor(this.endDate / 12);
    }
    else if(oldTypeDate == "years" && newTypeDate == "days")
    {
      this.startDate = this.startDate * 366;

      let endDateObject = new Date();
      endDateObject.setFullYear(this.endDate);
      if(endDateObject.isLeapYear())
      {
        this.endDate = this.endDate * 366 + 365;
      }
      else
      {
        this.endDate = this.endDate * 366 + 364;
      }
    }
    else if(oldTypeDate == "years" && newTypeDate == "months")
    {
      this.startDate = this.startDate * 12;
      this.endDate = this.endDate * 12 + 11;
    }
  }
}