
class TimeBar
{
  /*
   * @property {mapboxgl.Map}          value                   Value of the time bar
   * @property {Params}                params                  The params
   * @property {LayersManager}         layersManager           The layers manager
   * @property {Number}                min                     The min value
   * @property {Number}                max                     The max value
   */
  constructor()
  {
    this.value = 0;
    this.layerManager = null;
    this.params = null;
    this.min = 0;
    this.max = 0;
  }

  /*
   * Init the TimeBar
   * @param {Params}                params                  The params
   * @param {LayersManager}         layersManager           The layers manager
   */
  init(params, layersManager)
  {
    let me = this;

    this.params = params;
    this.layersManager = layersManager;

    if(params.timeEnable)  {
      me.value = params.timeMin;

      this.min = DateConverter.dateToNumber(params.timeMin, false, this.params);
      this.max = DateConverter.dateToNumber(params.timeMax, true, this.params);
      this.value = this.min;

      $("#time-bar").html(`
        <img src="img/actions/play-solid.svg" title="${Dictionary.get('MAP_TIME_PLAY')}" id="time-play-button" class="timeControl-change-img" />
        <img src="img/menu/caret-left-solid.svg" title="${Dictionary.get('MAP_TIME_LAST')}" id="time-left-button" class="timeControl-change-img" />
        <img src="img/menu/caret-right-solid.svg" title="${Dictionary.get('MAP_TIME_NEXT')}" id="time-right-button" class="timeControl-change-img" />
        <input type="range" id="time-slider" value="${this.value}" min="${this.min}" max="${this.max}" class="time-slider" />
        <p id="time-text">${this.value}</p>
      `);
      
      var timeRange = document.getElementById("time-slider");
      timeRange.addEventListener("change",function(e) {
        me.changeValue(e.target.valueAsNumber);
      });

      var timeLeftButton = document.getElementById("time-left-button");
      timeLeftButton.addEventListener("click",function(e) {
        me.getTimeValueLastElement(false);
      });

      var timerightButton = document.getElementById("time-right-button");
      timerightButton.addEventListener("click",function(e) {
        me.getTimeValueLastElement(true);
      });

      // Set size
      if($(window).width() >= 800 && $(window).height() >= 800) {
        if(this.params.timeBarBigSize) {
          $("#time-slider").css("width", "600px");
        }
        else {
          $("#time-slider").css("width", "300px");
        }
      }

      var playButton = document.getElementById("time-play-button");
      playButton.addEventListener("click",function(e) {
        me.playOrPause();
      });
    }
  }

  /*
   * TimeBar html init
   */
  updateTimeBar() {
    document.getElementById('time-play-button').title = Dictionary.get('MAP_TIME_PLAY');
    document.getElementById('time-left-button').title = Dictionary.get('MAP_TIME_LAST');
    document.getElementById('time-right-button').title = Dictionary.get('MAP_TIME_NEXT');
  }

  /*
   * Get the next/last value with a element change
   * @param {boolean}                next                  True if next, False if last
   */
  getTimeValueLastElement(next)
  {
    let targetValue = 0;

    if(next)
    {
      targetValue = DateConverter.dateToNumber(this.params.timeMax, true, this.params);
    }
    else
    {
      targetValue = DateConverter.dateToNumber(this.params.timeMin, false, this.params);
    }

    // zones
    for(let i = 0; i < this.layersManager.layers.length; i++)
    {
      for(let j = 0; j < this.layersManager.layers[i].zones.length; j++)
      {
        if(next)
        {
          let startDate = this.layersManager.layers[i].zones[j].startDate;
          if(startDate > this.value && startDate < targetValue)
          {
            targetValue = startDate;
          }
        }
        else
        {
          let endDate = this.layersManager.layers[i].zones[j].endDate;
          if(endDate < this.value && endDate > targetValue)
          {
            targetValue = endDate;
          }
        }
      }
    }

    // markers
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      if(next)
      {
        let startDate = this.layersManager.markers[i].startDate;
        if(startDate > this.value && startDate < targetValue)
        {
          targetValue = startDate;
        }
      }
      else
      {
        let endDate = this.layersManager.markers[i].endDate;
        if(endDate < this.value && endDate > targetValue)
        {
          targetValue = endDate;
        }
      }
    }

    this.changeValue(targetValue);
  }

  /*
   * Change the value, change time for layers and markers
   * @param {Number}                value                  The new value
   */
  changeValue(value) {
      this.value = Number(value);

      document.getElementById("time-slider").value = value;
      document.getElementById("time-text").innerHTML = DateConverter.numberToDate(this.value, this.params);

      this.layersManager.changeTime(this.value);
  }

  /*
   * Click play button -> auto scrolling time of the map
   */
  playOrPause() {
    let me = this;

    var playButton = document.getElementById("time-play-button");

    if(me.playInterval) {
      playButton.src = "img/actions/play-solid.svg";
      playButton.title = Dictionary.get("MAP_TIME_PLAY");

      clearInterval(me.playInterval);
      me.playInterval = null;
    }
    else {
      playButton.src = "img/actions/pause-solid.svg";
      playButton.title = Dictionary.get("MAP_TIME_PAUSE");

      me.playInterval = setInterval(function () {
        let max = DateConverter.dateToNumber(me.params.timeMax, true, me.params);
        if(me.value + me.params.scrollTimeSpeed > max) {
          me.changeValue(max);

          playButton.src = "img/actions/play-solid.svg";
          playButton.title = Dictionary.get("MAP_TIME_PLAY");
          clearInterval(me.playInterval);
          me.playInterval = null;
        }
        else {
          //me.changeValue(me.value + me.params.scrollTimeSpeed);

          if(me.params.scrollTimeSpeed > 1) {
            let startDate = me.value + me.params.scrollTimeSpeed;
            let endDate = startDate + (me.params.scrollTimeSpeed-1);
            me.changeValue(startDate);

            this.layersManager.displayTimeArea(startDate, endDate, this.params);
          }
          else {
            me.changeValue(me.value + me.params.scrollTimeSpeed);
          }
        }
      }, 1000);
    }
  }
}
