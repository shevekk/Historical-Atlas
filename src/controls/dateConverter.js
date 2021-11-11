

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

      let year = Math.floor(value / 366);
      let dayOfYear = (value % 366) + 1;

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
          return 366 * parseInt(dateStr) + 364;
        }
        else
        {
          return 366 * parseInt(dateStr);
        }
      }
      else if(dateStr.split("/").length == 2)
      {
        let date = new Date();
        date.setFullYear(parseInt(dateStr.split("/")[1]));
        date.setMonth(parseInt(dateStr.split("/")[0]) - 1)

        return parseInt(dateStr.split("/")[1]) * 366 + (date.getDOY() - 1);
      }
      else if(dateStr.split("/").length == 3)
      {
        let date = new Date();
        date.setFullYear(parseInt(dateStr.split("/")[2]));
        date.setMonth(parseInt(dateStr.split("/")[1]) - 1);
        date.setDate(parseInt(dateStr.split("/")[0]));

        return parseInt(dateStr.split("/")[2]) * 366 + (date.getDOY() - 1);
      }
    }
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