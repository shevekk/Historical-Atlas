
class Marker
{
  /*
   * Marker class
   * @property {Object}                 markerObj                  The marker Obj
   * @property {mapboxgl.Map}           map                        The map
   * @property {TimeBar}                timeBar                    The time Bar
   */
  constructor(markerObj, number, map, timeBar) {
    this.data = markerObj;
    this.number = number;

    this.addUI(map, timeBar);
  }

  /*
   * Add a marker in UI
   * @param {Object}              marker             The marker data
   * @param {TimeBar}             timeBar            The time Bar
   */
  addUI(map, timeBar) {
    let me = this;

    let html = `<div class="right-marker-ui-div" id="marker-ui-${this.number}" title="${this.data.startDate} - ${this.data.endDate}"><p><div class="right-marker-ui-square" style="background-color:${this.data.color}"></div><span style="margin-left:6px;">${this.data.label}</span></p></div>`;

    $("#right-marker-ui").append(html);

    $(`#marker-ui-${this.number}`).dblclick(() => {
      if(!(timeBar.value >= this.data.startDate && timeBar.value <= this.data.endDate)) {
        timeBar.changeValue(this.data.startDate);
      }

      map.flyTo({
        center: [this.data.position[1], this.data.position[0]],
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
      });
    });
  }

  /*
   * Hide the marker
   * @param {mapboxgl.Map}          map                The map
   */
  hide(map) {
    let markerHtml = document.getElementById("marker" + this.number);
    markerHtml.style.visibility = "hidden";
    $(`#marker-ui-${this.number}`).css("color", "#a6a6a6");
  }

  /*
   * Show the marker
   * @param {mapboxgl.Map}          map                The map
   */
  show(map) {
    let markerHtml = document.getElementById("marker" + this.number);
    markerHtml.style.visibility = "visible";
    $(`#marker-ui-${this.number}`).css("color", "black");
  }

  /**
   * Update visibility of the marker if is in time area
   * @param {Number}               startTime                 The start time value
   * @param {Number}               endTime                   The end time value
   * @param {L.Map}                  map                   The map
   * @param {Params}                 params                The params
   */
  updateVisibilityFromTimeArea(startTime, endTime, map, params)
  {
    if(this.data.startDate || this.data.endDate)
    {
      if(!this.data.startDate)
      {
        this.data.startDate = params.timeMin;
      }
      if(!this.data.endDate)
      {
        this.data.endDate = params.timeMax;
      }

      if(this.data.startDate <= endTime && this.data.endDate >= startTime)
      {
        this.show(map);
      }
      else
      {
        this.hide();
      }
    }
    else
    {
      this.show(map);
    }
  }
}
