class PropertyLayer
{
  /*
   * Model of a property layer
   * @property {Number}               propNumber          The number of the property to the property number
   * @property {Number}               valueNumber         The number of the value to the value number
   * @property {Number}               startDate           The start date number
   * @property {Number}               endDate             The end date number
   */
  constructor(propNumber, valueNumber, startDate, endDate)
  {
    this.propNumber = propNumber;
    this.valueNumber = valueNumber;
    this.startDate = null;
    this.endDate = null;

    if(startDate && startDate != "")
    {
      this.startDate = startDate;
    }
    if(endDate && endDate != "")
    {
      this.endDate = endDate;
    }
  }
}