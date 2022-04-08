
/* 
 * Manage copy and paste actions
 */
class LabelDate
{
  /*
   * 
   * @property {L.Map}                      map                      The map
   */
  constructor(map, params)
  {
    this.map = map;
    this.tooltip = null;
    this.params = params;
  }

  /*
   * Enable of disable the copy manager
   * @param {Boolean}                      enable                      The enable state
   */
  display(dateValue)
  {
    let me = this;

    let dateText = this.dateToText(dateValue);

    if(this.tooltip)
    {
      this.map.removeLayer(this.tooltip);
      this.tooltip = null;
    }

    this.tooltip = L.tooltip({
      direction: 'bottom',
      permanent: true,
      interactive: false,
      noWrap: true,
      opacity: 1,
      className: 'label-date-tooltip'
    });

    //this.tooltip.setLatLng(this.map.getCenter());
    this.tooltip.setLatLng(new L.LatLng(this.map.getBounds().getNorth(), this.map.getCenter().lng));

    this.fontSize = 26;

    this.tooltip.setContent(`<p style="font-size: ${Math.round(this.fontSize)}px"> ${dateText} </p>`);
    this.tooltip.addTo(this.map);

    if(this.timeOutHide)
    {
      clearTimeout(this.timeOutHide);
    }
    this.timeOutHide = setTimeout(hide, 2000);

    function hide()
    {
      if(me.tooltip)
      {
        me.map.removeLayer(me.tooltip);
        me.tooltip = null;
      }
    }
  }

 /**
  * Transform the date to text
  * @param {Number}                      dateValue                      The date to transform
  * @return {String}                                                    The text date                       
  */
  dateToText(dateValue)
  {
    let date = DateConverter.numberToDate(dateValue, this.params) + "";
    let dateText = "";
    let splitDate = date.split("/");

    let monthArray = {};

    if(Dictionary.lang == "fr")
    {
      monthArray["01"] = "janvier";
      monthArray["02"] = "février";
      monthArray["03"] = "mars";
      monthArray["04"] = "avril";
      monthArray["05"] = "mai";
      monthArray["06"] = "juin";
      monthArray["07"] = "juillet";
      monthArray["08"] = "août";
      monthArray["09"] = "septembre";
      monthArray["10"] = "octobre";
      monthArray["11"] = "novembre";
      monthArray["12"] = "décembre";
    }
    else
    {
      monthArray["01"] = "january";
      monthArray["02"] = "february";
      monthArray["03"] = "march";
      monthArray["04"] = "april";
      monthArray["05"] = "may";
      monthArray["06"] = "june";
      monthArray["07"] = "july";
      monthArray["08"] = "august";
      monthArray["09"] = "september";
      monthArray["10"] = "october";
      monthArray["11"] = "november";
      monthArray["12"] = "december";
    }
    
    if(splitDate.length == 1)
    {
      dateText = date;
    }
    else if(splitDate.length == 2)
    {
      dateText = `${monthArray[splitDate[0]]} ${splitDate[1]}`;
    }
    else if(splitDate.length == 3)
    {
      let dayNumber = parseInt(splitDate[0]);

      dateText = `${dayNumber} ${monthArray[splitDate[1]]} ${splitDate[2]}`
    }

    return dateText;
  }
}