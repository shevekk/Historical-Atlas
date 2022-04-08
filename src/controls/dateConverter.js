

/*
 * Date converter
 */
class DateConverter
{
  /**
   * Convert a date from number to string
   * @param {Number}               value                    Valur to convert to string
   * @param {Params}               params                   The params 
   */
  static numberToDate(value, params)
  {
    if(params.typeTime == "months")
    {
      let year = Math.floor(value / 12);
      let month = (value % 12) + 1;

      if(month < 10)
      {
        month = "0"+month;
      }

     return month + "/" + year;
    }
    else if(params.typeTime == "days")
    {
      function dateFromDay(year, day)
      {
        var date = new Date(year, 0); // initialize a date in `year-01-01`
        return new Date(date.setDate(day)); // add the number of days
      }

      let year = DateConverter.daysNumberToYears(value);
      let dayOfYear = DateConverter.daysNumberToDayOfYears(value);

      let date = dateFromDay(year, dayOfYear);

      let day = date.getDate();
      if(day < 10)
      {
        day = "0"+day;
      }
      let month = date.getMonth() + 1;
      if(month < 10)
      {
        month = "0"+month;
      }

      return day + "/" + month + "/" + year;
    }
    else
    {
      return value;
    }
  }

  /**
   * Format a date to number from string
   * @param {String}                dateStr                     The date str
   * @param {Boolean}               isEndDate                   True if end date
   * @param {Params}                params                      The params 
   */
  static dateToNumber(dateStr, isEndDate, params)
  {
    if(params.typeTime == "years")
    {
      if(!isNaN(dateStr))
      {
        return parseInt(dateStr);
      }
      else if(dateStr.split("/").length == 2)
      {
        return parseInt(dateStr.split("/")[1]);
      }
      else if(dateStr.split("/").length == 3)
      {
        return parseInt(dateStr.split("/")[2]);
      }
    }
    else if(params.typeTime == "months")
    {
      if(!isNaN(dateStr))
      {
        if(isEndDate)
        {
          return 12 * parseInt(dateStr) + 11;
        }
        else
        {
          return 12 * parseInt(dateStr);
        }
      }
      else if(dateStr.split("/").length == 2)
      {
        return parseInt(dateStr.split("/")[1]) * 12 + (parseInt(dateStr.split("/")[0]) - 1);
      }
      else if(dateStr.split("/").length == 3)
      {
        return parseInt(dateStr.split("/")[2]) * 12 + (parseInt(dateStr.split("/")[1]) - 1);
      }
    }
    else if(params.typeTime == "days")
    {
      if(!isNaN(dateStr))
      {
        if(isEndDate)
        {
          let result = 0;

          if(DateConverter.leapYear(parseInt(dateStr)))
          {
            return DateConverter.yearsToDaysNumber(parseInt(dateStr)) + 365;
          }
          else
          {
            return DateConverter.yearsToDaysNumber(parseInt(dateStr)) + 364;
          }
        }
        else
        {
          return DateConverter.yearsToDaysNumber(parseInt(dateStr));
        }
      }
      else if(dateStr.split("/").length == 2)
      {
        let date = new Date();
        date.setFullYear(parseInt(dateStr.split("/")[1]));

        if(isEndDate)
        {
          date.setMonth(parseInt(dateStr.split("/")[0]));
          date.setDate(0);
        }
        else
        {
          date.setMonth(parseInt(dateStr.split("/")[0]) - 1);
          date.setDate(1);
        }
        

        return DateConverter.yearsToDaysNumber(parseInt(dateStr.split("/")[1])) + (date.getDOY() - 1);
      }
      else if(dateStr.split("/").length == 3)
      {
        let date = new Date();
        date.setFullYear(parseInt(dateStr.split("/")[2]));
        date.setMonth(parseInt(dateStr.split("/")[1]) - 1);
        date.setDate(parseInt(dateStr.split("/")[0]));

        return DateConverter.yearsToDaysNumber(parseInt(dateStr.split("/")[2])) + (date.getDOY() - 1);
      }
    }
  }

  /*
   * Check if is this year is a leap year
   * @param {Number}          year          The target year
   * @return {Boolean}                      True is a leap year 
   */
  static leapYear(year)
  {
    if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  /*
   * Convert a year to days numbers
   * @param {Number}          year          The target year
   * @return {Number}                       The day numbers
   */
  static yearsToDaysNumber(year)
  {
    let dayNumber = 0;
    if(year > 0)
    {
      for(let i = 0; i < year; i++)
      {
        if(DateConverter.leapYear(i))
        {
          dayNumber += 366;
        }
        else
        {
          dayNumber += 365;
        }
      }
    }
    else
    {
      for(let i = 0; i >= year; i--)
      {
        if(DateConverter.leapYear(i))
        {
          dayNumber += 366;
        }
        else
        {
          dayNumber += 365;
        }
      }
    }
    return dayNumber;
  }

  /*
   * Convert days numbers to a year number 
   * @param {Number}          value         Number of days
   * @return {Number}                       The years numbers
   */
  static daysNumberToYears(value)
  {
    let year = 0;
    while(value > 0)
    {
      if(DateConverter.leapYear(year) && value >= 366)
      {
        year ++;
        value -= 366;
      }
      else if(!DateConverter.leapYear(year) && value >= 365)
      {
        year ++;
        value -= 365;
      }
      else
      {
        value = -1;
      }
    }
    return year;
  }

  /*
   * From days numbers get the day of the year
   * @param {Number}          value         Number of days
   * @return {Number}                       The day of the year
   */
  static daysNumberToDayOfYears(value)
  {
    let year = 0;
    let dayOfYear = 1;
    while(value > 0)
    {
      if(DateConverter.leapYear(year) && value >= 366)
      {
        year ++;
        value -= 366;
      }
      else if(!DateConverter.leapYear(year) && value >= 365)
      {
        year ++;
        value -= 365;
      }
      else
      {
        dayOfYear = value+1;
        value = -1;
      }
    }
    return dayOfYear;
  }

  /*
   * Check if the value is in correct date format 
   * @param {String}          date          The date value
   */
  static checkDateValid(date)
  {
    if(isNaN(date))
    {
      if(date.split("/").length == 2)
      {
        if(!isNaN(date.split("/")[0]) && !isNaN(date.split("/")[1]))
        {
          return true;
        }
        else
        {
          return false;
        }
      }
      if(date.split("/").length == 3)
      {
        if(!isNaN(date.split("/")[0]) && !isNaN(date.split("/")[1]) && !isNaN(date.split("/")[2]))
        {
          return true;
        }
        else
        {
          return false;
        }
      }
      else
      {
        return false;
      }
    }
    else
    {
      return true;
    }
  }

  /**
   * Update date values for change date type
   * @param {String}               oldTypeDate                   The old date type
   * @param {String}               newTypeDate                   The new date type
   */
  static updateTypeDate(oldDate, oldTypeDate, newTypeDate, endDate)
  {
    let newDate = null;

    if(oldTypeDate == "days" && newTypeDate == "months")
    {
      let year = DateConverter.daysNumberToYears(oldDate);
      let dateObject = new Date(year, 0, 1);
      dateObject.setDate(DateConverter.daysNumberToDayOfYears(oldDate));
      newDate = year * 12 + dateObject.getMonth();
    }
    else if(oldTypeDate == "days" && newTypeDate == "years")
    {
      newDate = DateConverter.daysNumberToYears(oldDate);
    }
    else if(oldTypeDate == "months" && newTypeDate == "days")
    {
      if(!endDate)
      {
        let startYear = Math.floor(oldDate / 12);
        let startDateObject = new Date(startYear, oldDate % 12, 1);
        newDate = DateConverter.yearsToDaysNumber(startYear) + (startDateObject.getDOY() - 1);
      }
      else
      {
        let endYear = Math.floor(oldDate / 12);
        let endDateObject = new Date(endYear, (oldDate % 12) + 1, 0);
        newDate = DateConverter.yearsToDaysNumber(endYear) + (endDateObject.getDOY() - 1);
      }
    }
    else if(oldTypeDate == "months" && newTypeDate == "years")
    {
      newDate = Math.floor(oldDate / 12);
    }
    else if(oldTypeDate == "years" && newTypeDate == "days")
    {
      if(!endDate)
      {
        newDate = DateConverter.yearsToDaysNumber(oldDate);
      }
      else
      {
        if(DateConverter.leapYear(oldDate))
        {
          newDate = DateConverter.yearsToDaysNumber(oldDate) + 365;
        }
        else
        {
          newDate = DateConverter.yearsToDaysNumber(oldDate) + 364;
        }
      }
    }
    else if(oldTypeDate == "years" && newTypeDate == "months")
    {
      if(!endDate)
      {
        newDate = oldDate * 12;
      }
      else
      {
        newDate = oldDate * 12 + 11;
      }
    }

    return newDate;
  }
}


Date.prototype.isLeapYear = function() {
    var year = this.getFullYear();
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
Date.prototype.getDOY = function() {
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getMonth();
    var dn = this.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};