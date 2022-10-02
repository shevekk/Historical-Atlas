
class MainMapBox
{
  /*
   * @property {mapboxgl.Map}              map                         The map
   * @property {Params}                    params                      The params
   * @property {TimeBar}                   timeBar                     The time bar
   * @property {LayersManager}             layersManager               The layers manager
   * @property {DescriptionManager}        descriptionManager          The description manager
   * @property {L.marker[]}                markers                     The markers list
   */
  constructor()
  {
    this.timeBar = new TimeBar();
    this.params = new Params();
    this.params.editMode = false;
    this.layersManager = new LayersManager();
    this.descriptionManager = new DescriptionManager(this.params);
    this.backgroundUI = new BackgroundUI(this.params);
    this.map = null;
    this.markers = [];

    this.manageScreenSize();
  }

  /*
   * Load map and init
   */
  init()
  {
    let me = this;
    let urlParams = me.getUrlParams();

    me.createUIButton();
    me.updateTexts();

    if(urlParams["mapId"])
    {
      let mapId = urlParams["mapId"];

      let apiName = `map/get/${mapId}?user=${localStorage.getItem('session-id-histoatlas')}&editMode=false&mapbox=true`
      if(!localStorage.getItem('session-id-histoatlas'))
      {
        apiName = `map/getGuest/${mapId}?editMode=false&mapbox=true`
      }

      Utils.callServer(apiName, "GET", {}).then((mapData) => {
        Config.load().then((config) => {

          let jsonDataMap = JSON.parse(mapData.data);
          me.params.fromJson(jsonDataMap);
          me.timeBar.init(me.params, this.layersManager);

          document.title = `${mapData.name} (${mapData.userName}) [${mapData.lang}][${mapData.type}]`;

          me.addBackAndLangUI();

          me.descriptionManager.updateContent(mapData);

          mapboxgl.accessToken = config.mapboxAccessToken;

          this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/satellite-streets-v11',
            zoom: me.params.zoom,
            center: [me.params.defaultPosition[1], me.params.defaultPosition[0]],
            preserveDrawingBuffer: true,
            projection: {
              name: 'globe',
              center: [me.params.defaultPosition[1], me.params.defaultPosition[0]],
              parallels: [30, 30]
            }
          });

          this.map.on('load', () => {
            me.addDataToMap(jsonDataMap);

            if(me.params.timeEnable)  {
              me.timeBar.changeValue(me.timeBar.min);
            }

            me.addPropButton(jsonDataMap);
          });

          // Change projection
          const projectionInput = document.getElementById('projection');
          projectionInput.addEventListener('change', (e) => {
            const isConic = ['albers', 'lambertConformalConic'].includes(e.target.value);

            this.map.setProjection(e.target.value);
          });

          // Init background UI and
          me.backgroundUI.init(me.map, me.timeBar, function() {

            me.backgroundUI.setBackground(me.params.backgroundDefault, function () {}, function () {});
            me.layersManager.init(me.map, me.timeBar, jsonDataMap.layers, jsonDataMap.markers, jsonDataMap.properties);

            me.backgroundUI.updateList(function() {
              me.removeData(jsonDataMap);
            }, function () {
              me.addDataToMap(jsonDataMap);
              me.layersManager.init(me.map, me.timeBar, jsonDataMap.layers, jsonDataMap.markers, jsonDataMap.properties);

              if(me.params.timeEnable)  {
                me.timeBar.changeValue(me.timeBar.value);
              }
            });
          });
        });
      });
    }
  }

  /*
   * Remove all layers and markers
   * @param {Object}           jsonMapContent             The json map data
   */
  removeData(jsonMapContent) {
    for(let i = 0; i < jsonMapContent.layers.length; i++) {
      this.map.removeLayer('layer'+i);

      if(jsonMapContent.layers[i].options.weight >= 1) {
        this.map.removeLayer('layerLine'+i);
      }
    }

    for (var i = this.markers.length - 1; i >= 0; i--) {
      this.markers[i].remove();
    }
  }

  /*
   * Add layers and markers to map
   * @param {Object}           jsonMapContent             The json map data
   */
  addDataToMap(jsonMapContent) {

    // Layers Display
    for(let i = 0; i < jsonMapContent.layers.length; i++) {
      this.map.addSource("layer" + i, {
        'type': 'geojson',
        'data': jsonMapContent.layers[i].zones[0].geom
      });

      let color = jsonMapContent.layers[i].options.fillColor;
      if(!color) {
        color = jsonMapContent.layers[i].options.color;
      }

      let opacity = jsonMapContent.layers[i].options.fillOpacity;
      if(!opacity) {
        opacity = 0.25;
      }

      this.map.addLayer({
        'id': "layer" + i,
        'type': 'fill',
        'source': "layer" + i, // reference the data source
        'layout': {},
        'paint': {
          'fill-color': color,
          'fill-opacity': opacity
        }
      });

      if(jsonMapContent.layers[i].options.weight >= 1) {
        this.map.addLayer({
          'id': "layerLine" + i,
          'type': 'line',
          'source': "layer" + i, // reference the data source
          'paint': {
            'line-color': jsonMapContent.layers[i].options.color,
            'line-width': jsonMapContent.layers[i].options.weight
          }
        });
      }
    }

    // Click in layer popup
    for(let i = 0; i < jsonMapContent.layers.length; i++) {
      this.map.on('click', "layer" + i, (e) => {

        const coordinates = e.lngLat;
        const description = jsonMapContent.layers[i].zones[0].popupContent;
        let content = "<h3>" + jsonMapContent.layers[i].label.value + "</h3>";
        if(description) {
          content += "<p>" + description + "</p>";
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(content)
          .addTo(this.map);
      });
    }

    // Markers Display
    for(let i = 0; i < jsonMapContent.markers.length; i++) {

      let marker1 = new mapboxgl.Marker({color: jsonMapContent.markers[i].color});
      marker1.setLngLat([jsonMapContent.markers[i].position[1], jsonMapContent.markers[i].position[0]])
      marker1.addTo(this.map);

      marker1._element.id = "marker" + i;

      if(jsonMapContent.markers[i].popUpContent) {
        marker1.setPopup(new mapboxgl.Popup().setHTML("<h2>" + jsonMapContent.markers[i].label + "</h2><p>" + jsonMapContent.markers[i].popUpContent + "</p>"));
      }

      this.markers.push(marker1);
    }
  }

  /**
   * Create buttons of actions in UI
   */
  createUIButton() {
    let me = this;
    $("#left-button-ui").html(`
      <button class="left-button" id="left-button-description" title="${Dictionary.get("MAP_ACTIONS_SHOW_DESCRIPTION")}">
        <img src="img/actions/bars-solid.svg" alt="${Dictionary.get("MAP_ACTIONS_SHOW_DESCRIPTION")}" class="left-button-img" />
      </button>
      <button class="left-button" id="left-button-capture" title="${Dictionary.get("MAP_ACTIONS_CAPTURE")}">
        <img src="img/actions/camera-solid.svg" alt="${Dictionary.get("MAP_ACTIONS_CAPTURE")}" class="left-button-img" />
      </button>
    `);

    $("#left-button-description").click(() => {
      me.descriptionManager.display();
    });

    $("#left-button-capture").click(() => {
      var img = me.map.getCanvas().toDataURL('image/png')

      var a = document.createElement('a');
      a.href = img;
      a.download = "capture.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a)
    });
  }

  /**
   * Add the property buttons from data
   * @param {Object}           jsonDataMap             The json map data
   */
  addPropButton(jsonDataMap) {
    let me = this;

    // Create HTML
    let html = "";
    for(let i = 0; jsonDataMap.properties && i < jsonDataMap.properties.length; i++) {
      html += `<button class="left-group-button-apply">${jsonDataMap.properties[i].name}</button>`;
    }
    html += `<button class="left-group-button-return">${Dictionary.get("MAP_ACTIONS_BACK")}</button>`;

    $("#left-button-group").html(html);
    $(".left-group-button-return").css("display", "none");
    $("#left-group-legend").css("visibility", "hidden");

    // Clic to a prop button -> Apply a filter
    $(".left-group-button-apply").click(e => {
      $(".left-group-button-return").css("display", "block");
      $(".left-group-button-apply").css("display", "none");

      let prop = jsonDataMap.properties.find(f => f.name == e.currentTarget.textContent);

      me.layersManager.viewPropertyNumber = prop.number;
      me.addPropertyLegend(jsonDataMap, prop);

      for(let i = 0; i < jsonDataMap.layers.length; i++) {
        me.map.setPaintProperty("layer" + i, 'fill-color', prop.colors[1]);
        me.map.setPaintProperty("layer" + i, 'fill-opacity', parseInt(prop.opacity[1]) / 100);
        if(jsonDataMap.layers[i].options.weight >= 1) {
          me.map.setPaintProperty("layerLine" + i, 'line-color', prop.colors[1]);
        }

        let layersProps = jsonDataMap.layers[i].properties.filter(l => l.propNumber == prop.number);

        for(let j = 0; j < layersProps.length; j++) {

          if(!layersProps[j].startDate || !layersProps[j].endDate || (layersProps[j].startDate <= this.timeBar.value && layersProps[j].endDate >= this.timeBar.value)) {
            me.map.setPaintProperty("layer" + i, 'fill-color', prop.colors[layersProps[j].valueNumber]);
            me.map.setPaintProperty("layer" + i, 'fill-opacity', parseInt(prop.opacity[layersProps[j].valueNumber]) / 100);
            if(jsonDataMap.layers[i].options.weight >= 1) {
              me.map.setPaintProperty("layerLine" + i, 'line-color', prop.colors[layersProps[j].valueNumber]);
            }
          }
        }
      }
    });

    // Clic to a return button -> Remove filters
    $(".left-group-button-return").click(e => {
      $(".left-group-button-return").css("display", "none");
      $(".left-group-button-apply").css("display", "block");

      me.layersManager.viewPropertyNumber = 0;
      $("#left-group-legend").html("");
      $("#left-group-legend").css("visibility", "hidden");

      for(let i = 0; i < jsonDataMap.layers.length; i++) {
        let color = jsonDataMap.layers[i].options.fillColor;
        if(!color) {
          color = jsonDataMap.layers[i].options.color;
        }
        
        me.map.setPaintProperty("layer" + i, 'fill-color', color);
        me.map.setPaintProperty("layer" + i, 'fill-opacity', jsonDataMap.layers[i].options.fillOpacity);
        if(jsonDataMap.layers[i].options.weight >= 1) {
          me.map.setPaintProperty("layerLine" + i, 'line-color', jsonDataMap.layers[i].options.color);
        }
      }
    });
  }

  /**
   * Display the legend for a property
   * @param {Object}           jsonDataMap             The json map data
   * @param {Object}           prop                    The selected prop
   */
  addPropertyLegend(jsonDataMap, prop) {

    let html = "";
    for (var i in prop.colors){
      if (prop.colors.hasOwnProperty(i)) {
        html += `<div class="left-group-legend-line"><div class="left-group-legend-square" style="background-color:${prop.colors[i]}"></div><span>${prop.values[i]}</span></div>`;
      }
    }

    $("#left-group-legend").html(html);
    $("#left-group-legend").css("visibility", "visible");
  }

  /**
   * Get params in the address bar
   * return {String[]}             Array of params get in address bar
   */
  getUrlParams()
  {
    // Get ars values of address bar
    var args = location.search.substr(1).split(/&/);
    var argsValues = [];

    for(var i =0; i < args.length; i++)
    {
      var tmp = args[i].split(/=/);
      if (tmp[0] != "") {
          argsValues[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp.slice(1).join("").replace("+", " "));
      }
    }

    return argsValues;
  }

  loadImages(urls, callback) {
    var results = {};
    for (var name in urls) {
      this.map.loadImage(urls[name], makeCallback(name));
    }

    function makeCallback(name) {
      return function (err, image) {
        results[name] = err ? null : image;

        // if all images are loaded, call the callback
        if (Object.keys(results).length === Object.keys(urls).length) {
          callback(results);
        }
      };
    }
  }

  addBackAndLangUI() {
    let me = this;
    let html = ``;

    html += `<div class="div-change-lang">
      <img class="change-lang-left" src='img/menu/angle-left-solid.svg' />`

    if(Dictionary.lang == "en") {
      html += `<div class="change-lang-text">EN</div>`;
    }
    else {
      html += `<div class="change-lang-text">FR</div>`;
    }

     html += `<img class="change-lang-right" src='img/menu/angle-right-solid.svg' />
    </div>`

    html += `<a class="back-menu-button" title="${Dictionary.get("MAP_MENU_MENU_DESC")}" href="index.html">${Dictionary.get("MAP_MENU_MENU")}</a>`

    $('#left-buttons-lang-div').html(html);

    $('.change-lang-left').click(e => me.changeLang(true));
    $('.change-lang-right').click(e => me.changeLang(false));
  }

  /* 
   * Change the lang
   * @param {Boolean}        rightArraw          True if a right arraw 
   */
  changeLang(rightArraw)
  {
    let me = this;

    lang = Dictionary.lang;
    if(lang == "fr")
    {
      $(".change-lang-text").html("EN");
      lang = "en";
    }
    else
    {
      $(".change-lang-text").html("FR");
      lang = "fr";
    }

    Config.setCookie("lang", lang, 30);

    Dictionary.lang = lang;

    Dictionary.load(lang, "", function()
    {
      me.timeBar.updateTimeBar();

      me.updateTexts();
    });
  }

  /**
   * Update the content of the texts
   */
  updateTexts() {
    document.getElementById('select-projection-label').textContent = Dictionary.get('SELECT-PROJECTION-LABEL');

    document.getElementById('left-button-description').title = Dictionary.get('MAP_ACTIONS_SHOW_DESCRIPTION');
    document.getElementById('left-button-capture').title = Dictionary.get('MAP_ACTIONS_CAPTURE');
      
    document.getElementById('right-ui-layer-title').textContent = Dictionary.get('MAP_LAYERS_TITLE');
    document.getElementById('right-ui-marker-title').textContent = Dictionary.get('MAP_MARKERS_TITLE');

    document.getElementById('right-ui-backgrounds-title').textContent = Dictionary.get("MAP_BACKGROUND_TITLE");
  }

  /**
   * If the size of screen is small, reduce ui size
   */
  manageScreenSize()
  {
    if($(window).width() < 800 || $(window).height() < 800)
    {
      $("#right-ui-backgrounds-content").css("display", "none");
      $("#right-ui-backgrounds").css("background", "rgba(255, 255, 255, 0.5)");
      $("#right-ui-backgrounds-icon-hide").prop("src", "img/menu/plus-solid.svg");

      $("#right-ui-elements-content").css("display", "none");
      $("#right-ui-elements").css("background", "rgba(255, 255, 255, 0.5)");
      $("#right-ui-elements-icon-hide").prop("src", "img/menu/plus-solid.svg");
    }
  }
}

