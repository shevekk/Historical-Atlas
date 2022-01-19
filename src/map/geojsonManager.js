
/*
 * Manage Save and Load actions to geojson format
 */
class GeoJsonManager
{
  /* 
   * Initialize the GeoJsonManager
   * @property {L.Map}                      map                      The map
   * @property {LayerManager}               layersManager            The layers manager
   * @property {LayersControl}              layersControl            The layers control
   * @property {TimeControl}                timeControl              The time control 
   * @property {ActionsList}                actionsList              Manager of action list and undo/redo
   * @property {LoadSaveManager}            loadSaveManager          The save and load manager
   * @property {Param}                      params                   Application params
   */
  constructor(map, layersManager, layersControl, timeControl, actionsList, loadSaveManager, params)
  {
    this.map = map;
    this.layersManager = layersManager;
    this.layersControl = layersControl;
    this.timeControl = timeControl;
    this.actionsList = actionsList;
    this.loadSaveManager = loadSaveManager;
    this.params = params;
  }

 /*
  * Load a json file
  * @param {GeoJsonManager}                      me                      The class
  */
  importManagement(me)
  {
    var fileInput = document.getElementById("inputImportFileGeoJson"),
    readFile = function () {
      var reader = new FileReader();
      reader.fileName = document.getElementById("inputImportFileGeoJson").files[0];
      reader.onload = function (readerEvt) 
      {
        me.actionsList.addActionLoadGeojson(me.loadSaveManager);

        var isJsonFile = reader.fileName.name.endsWith(".geojson");
        
        if(isJsonFile)
        {
          let fileContent = reader.result;
          let contentObj = JSON.parse(fileContent);

          if(contentObj.type == "FeatureCollection")
          {
            me.readFeactureCollection(contentObj.features);
          }
          else if(contentObj.type == "Feature")
          {
            me.readFeacture(contentObj.geometry, contentObj.properties);
          }
          else
          {
            // File invalid
          }
        }
        else
        {
          alert(Dictionary.get("MAP_SAVEANDLOAD_IMPORTFILE_FORMAT_GEOJSON"));
        }
      };
      // start reading the file. When it is done, calls the onload event defined above.
      reader.readAsText(fileInput.files[0]);
    };

    fileInput.addEventListener('change', readFile);
  }

  /**
   * Read a feactures collecture collection -> create from data in the files
   * @param {Array}                   features                     The list of feactures
   */
  readFeactureCollection(features)
  {
    let me = this;

    $("#dialog-import-geojson").html("");
    for(let i = 0; i < features.length; i++)
    {
      if(features[i].geometry.type == "Polygon" || features[i].geometry.type == "MultiPolygon")
      {
        me.displayPolygonInForm(features[i], i);
      }
      else if(features[i].geometry.type == "Point")
      {
        me.displayPointInForm(features[i], i);
      }
    }

    $("#dialog-marker").prop("title", "Import GEOJSON");

    // Open form in dialog
    this.dialogImport = $("#dialog-import-geojson").dialog({
      autoOpen: false,
      height: 600,
      width: 850,
      modal: true,
      buttons: {
        Cancel: function() {
          me.dialogImport.dialog( "close" );
        },
        OK: function() {
          me.loadDataForm(features);
          me.dialogImport.dialog( "close" );
        }
      },
      close: function() {
        me.dialogImport.dialog( "close" );
      }
    });

    this.dialogImport.dialog( "open" );
  }

  /**
   * Read polygon data and a line in the form
   * @param {Object}                   feature                     The feacture data
   * @param {Number}                   i                           The num of feacture
   */
  displayPolygonInForm(feature, i)
  {
    let me = this;

    let props = "";
    for (const property in feature.properties) 
    {
      props += `${property}: ${feature.properties[property]}\n`;
    }

    let content = `<div class="geojson-import-polygon">${Dictionary.get("MAP_GEOJSON_IMPORT_POLYGON")}`
    content += `<button class="geojson-import-button-action" id="geojson-import-polygon-zoom_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_POLYGON")}</button>`;

    if(props != "")
    {
      content += `<button class="geojson-import-button-action" id="geojson-import-polygon-prop_${i}" title="${props}">${Dictionary.get("MAP_GEOJSON_IMPORT_PROPERTIES")}</button>`;
    }

    // Choise layer
    content += `<div class="geojson-import-polygon-right" id="geojson-import-polygon-layer-div_${i}">`;
    content += `</div>`;

    content += `</div>`;
    $("#dialog-import-geojson").append(content);

    /*
     * Init right form part (choise of layer and zone)
     * @param {Number}                   i                           The num of feacture
     */
    function initPolygonFormLineRight(i)
    {
      let content = "";
      
      content += `<label for="geojson-import-polygon-layer_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_LAYERS")}:</label>
                    <select id="geojson-import-polygon-layer_${i}">`;
      content += `<option value="-1">${Dictionary.get("MAP_GEOJSON_IMPORT_NONE")}</option>`;
      content += `<option value="[new]">${Dictionary.get("MAP_GEOJSON_IMPORT_NEW_LAYER")}</option>`;
      
      for(let j = 0; j < me.layersManager.layerGroups.length; j++)
      {
        content += `<option value="${j}">${me.layersManager.layerGroups[j].label.value}</option>`;
      }

      content += `</select>`;

      content += `<div class="geojson-import-polygon-zone" id="geojson-import-polygon-zone-div_${i}">`;
      content += `</div>`;

      content += `<input type="checkbox" id="geojson-import-polygon-clear_${i}"><label for="geojson-import-polygon-clear_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_CLEAR")}</label>`;

      $(`#geojson-import-polygon-layer-div_${i}`).html(content);

      // Change layer -> display zone choise
      $(`#geojson-import-polygon-layer_${i}`).change(function()
      {
        let selectedLayer = $(`#geojson-import-polygon-layer_${i}`).val();

        if(selectedLayer == "[new]")
        {
          // Display add a new layer form
          let contentAdd = `<label for="geojson-import-polygon-add-label_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_LAYER_LABEL")} : </label><input type="text" id="geojson-import-polygon-add-label_${i}">`;
          contentAdd += `<button id="geojson-import-polygon-cancel-add_${i}" style="margin-left:8px">${Dictionary.get("MAP_GEOJSON_IMPORT_CANCEL")}</button>`;
          $(`#geojson-import-polygon-layer-div_${i}`).html(contentAdd);

          $(`#geojson-import-polygon-cancel-add_${i}`).click(function()
          {
            initPolygonFormLineRight(i);
          });
        }
        else if(me.params.timeEnable)
        {
          /*
           * Init zone part 
           * @param {Number}                   i                           The num of feacture
           */
          function initPolygonFormZone(i)
          {
            let numLayer = parseInt(selectedLayer);

            let content = `<label for="geojson-import-polygon-zone_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_ZONES")}:</label>
                            <select id="geojson-import-polygon-zone_${i}">`;
            
            for(let j = 0; j < me.layersManager.layerGroups[numLayer].paintZones.length; j++)
            {
              let start = DateConverter.numberToDate(me.layersManager.layerGroups[numLayer].paintZones[j].startDate, me.params);
              let end = DateConverter.numberToDate(me.layersManager.layerGroups[numLayer].paintZones[j].endDate, me.params);

              content += `<option value="${j}">${start} - ${end}</option>`;
            } 

            content += `<option value="[new]">${Dictionary.get("MAP_GEOJSON_IMPORT_NEW_ZONE")}</option></select>`;

            $(`#geojson-import-polygon-zone-div_${i}`).html(content);

            // new zone form
            $(`#geojson-import-polygon-zone_${i}`).change(function()
            {
              // Manage create a new zone
              if($(this).val() == "[new]")
              {
                let contentAdd = `<label for="geojson-import-polygon-zone-start_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_START_DATE")} : </label><input type="text" id="geojson-import-polygon-zone-start_${i}" style="width:80px">`;
                contentAdd += `<label for="geojson-import-polygon-zone-end_${i}" style="margin-left : 4px">${Dictionary.get("MAP_GEOJSON_IMPORT_END_DATE")} : </label><input type="text" id="geojson-import-polygon-zone-end_${i}" style="width:80px">`;
                contentAdd += `<button id="geojson-import-polygon-cancel-zone-add_${i}" style="margin-left:8px">${Dictionary.get("MAP_GEOJSON_IMPORT_CANCEL")}</button>`;
                $(`#geojson-import-polygon-zone-div_${i}`).html(contentAdd);

                $(`#geojson-import-polygon-cancel-zone-add_${i}`).click(function()
                {
                  initPolygonFormZone(i);
                });
              }
            });
          }

          initPolygonFormZone(i);
        }
      });
    }

    initPolygonFormLineRight(i);

    // Manager zoom and prop actions
    $(`#geojson-import-polygon-zoom_${i}`).click(function()
    {
      me.displayZoom(feature);
    });

    $(`#geojson-import-polygon-prop_${i}`).click(function()
    {
      alert(props);
    });
  }

  /**
   * Read point data and a line in the form
   * @param {Object}                   feature                     The feacture data
   * @param {Number}                   i                           The num of feacture
   */
  displayPointInForm(feature, i)
  {
    let me = this;
    
    let props = "";
    for (const property in feature.properties) 
    {
      props += `${property}: ${feature.properties[property]}\n`;
    }

    let content = `<div class="geojson-import-point">${Dictionary.get("MAP_GEOJSON_IMPORT_POINT")}`
    content += `<button class="geojson-import-button-action" id="geojson-import-point-zoom_${i}">geom</button>`;

    if(props != "")
    {
      content += `<button class="geojson-import-button-action" id="geojson-import-point-prop_${i}" title="${props}">propriétés</button>`;
    }

    content += `<input type="checkbox" class="geojson-import-point-add" id="geojson-import-point-add_${i}"><label class="geojson-import-point-add-label" for="geojson-import-point-add_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_POINT_ADD")}</label>`;
    content += `<label for="geojson-import-point-label_${i}">${Dictionary.get("MAP_GEOJSON_IMPORT_POINT_LABEL")} : </label><input disabled="true" type="text" class="geojson-import-point-label" id="geojson-import-point-label_${i}">`;

    $("#dialog-import-geojson").append(content);


    $(`#geojson-import-point-zoom_${i}`).click(function()
    {
      me.displayZoom(feature);
    });

    $(`#geojson-import-point-prop_${i}`).click(function()
    {
      alert(props);
    });

    $(`#geojson-import-point-add_${i}`).change(function()
    {
      let checked = $(this).prop('checked');
      
      $(`#geojson-import-point-label_${i}`).prop("disabled", !checked);
    });
  }

  /**
   * Load the file from from data
   * @param {Array}                   features                     The list of feactures
   */
  loadDataForm(features)
  {
    for(let i = 0; i < features.length; i++)
    {
      if(features[i].geometry.type == "Polygon" || features[i].geometry.type == "MultiPolygon")
      {
        let clearLayer = $(`#geojson-import-polygon-clear_${i}`).prop('checked');
        let numLayer = parseInt($(`#geojson-import-polygon-layer_${i}`).val());

        if(clearLayer == null || numLayer == null)
        {
          // Create a new layer and init design from params
          this.layersManager.addNewLayer();
          this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].selectedZone.geom = features[i];
          this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].label.value = $(`#geojson-import-polygon-add-label_${i}`).val();

          if(features[i].properties["stroke-width"])
            this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].polygonOptions.border_size = features[i].properties["stroke-width"];
          if(features[i].properties["fill"])
            this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].polygonOptions.color = features[i].properties["fill"];
          if(features[i].properties["fill-opacity"])
            this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].polygonOptions.opacity = features[i].properties["fill-opacity"];

          this.layersManager.layerGroups[this.layersManager.layerGroups.length -1].redraw();
        }
        else
        {
          if(numLayer >= 0)
          {
            if(!this.params.timeEnable)
            {
              // Add geom to the selected layer
              if(this.layersManager.layerGroups[numLayer].selectedZone.geom != null && !clearLayer)
              {
                this.layersManager.layerGroups[numLayer].selectedZone.geom = turf.union(this.layersManager.layerGroups[numLayer].selectedZone.geom, features[i]);
              }
              else
              {
                this.layersManager.layerGroups[numLayer].selectedZone.geom = features[i];
              }

              this.layersManager.layerGroups[numLayer].redraw();
            }
            else
            {
              let numZone = $(`#geojson-import-polygon-zone_${i}`).val();

              if(!numZone || numZone == "")
              {
                // Create a new zone
                this.layersManager.layerGroups[numLayer].addPaintZone(-1, false);
                numZone = this.layersManager.layerGroups[numLayer].paintZones.length -1;
                let paintZone = this.layersManager.layerGroups[numLayer].paintZones[numZone];
                //paintZone.geom = turf.polygon(features[i].geometry.coordinates);
                paintZone.geom = features[i];

                let dateStart = $(`#geojson-import-polygon-zone-start_${i}`).val();
                let dateEnd = $(`#geojson-import-polygon-zone-end_${i}`).val();
                if(DateConverter.checkDateValid(dateStart) && DateConverter.checkDateValid(dateEnd))
                {
                  paintZone.setStartDate(dateStart);
                  paintZone.setEndDate(dateEnd);
                }

                this.layersManager.layerGroups[numLayer].redraw();
              }
              else
              {
                // Add geom to the selected zone
                numZone = parseInt(numZone);

                if(this.layersManager.layerGroups[numLayer].paintZones[numZone].geom != null && !clearLayer)
                {
                  this.layersManager.layerGroups[numLayer].paintZones[numZone].geom = turf.union(this.layersManager.layerGroups[numLayer].paintZones[numZone].geom, features[i]);
                }
                else
                {
                  this.layersManager.layerGroups[numLayer].paintZones[numZone].geom = features[i];
                }

                this.layersManager.layerGroups[numLayer].redraw();
              }
            }
          }
        }
      }
      else if(features[i].geometry.type == "Point")
      {
        // Add a Point
        let addPoint = $(`#geojson-import-point-add_${i}`).prop('checked');
        let label = $(`#geojson-import-point-label_${i}`).val();

        if(addPoint)
        {
          this.layersManager.markers.push(new Marker());
          this.layersManager.markers[this.layersManager.markers.length - 1].edit(label, 0, 0, "", [features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]], "img/markers/banner.png", "banner", "#000000", 30);
          this.layersManager.markers[this.layersManager.markers.length - 1].draw(this.map);
        }
      }
    }

    if(this.params.timeEnable)
    {
      this.timeControl.setValue(this.timeControl.value);
    }

    this.layersControl.redraw();
  }

  /*
   * Display geom (5s) and zoom on feacture
   * @param {Object}                   feature                     The feacture data
   */
  displayZoom(feature)
  {
    let me = this;

    if(this.layer)
    {
      this.map.removeLayer(this.layer)
      this.layer = null;

      if(this.timeOutZoomGeom)
      {
        clearTimeout(this.timeOutZoomGeom);
      }
    }

    this.layer = L.geoJSON(feature, {}).addTo(this.map);
    this.map.fitBounds(this.layer.getBounds());

    function stopGeom() 
    {
      me.map.removeLayer(me.layer)
      me.layer = null;
    }
    this.timeOutZoomGeom = setTimeout(stopGeom, 5000);
  }
  
  /*
   * Read feacture
   * @param {Object}                   geometry                     The geom object
   * @param {Object}                   properties                   The properties object
   */
  readFeacture(geometry, properties)
  {
    if(geometry.type == "Polygon")
    {
      if(this.layersManager.selectedLayer.selectedZone.geom != null)
      {
        this.layersManager.selectedLayer.selectedZone.geom = turf.union(this.layersManager.selectedLayer.selectedZone.geom, turf.polygon(geometry.coordinates));
      }
      else
      {
        this.layersManager.selectedLayer.selectedZone.geom = turf.polygon(geometry.coordinates);
      }

      this.layersManager.selectedLayer.redraw();
    }
    else if(geometry.type == "Point")
    {
      //console.log("POINT : " + geometry.coordinates);
      this.layersManager.markers.push(new Marker());
      this.layersManager.markers[this.layersManager.markers.length - 1].edit("", 0, 0, "", [geometry.coordinates[1], geometry.coordinates[0]], "img/markers/banner.png", "banner", "#000000", 30);
      this.layersManager.markers[this.layersManager.markers.length - 1].draw(this.map);
    }

    // Reload UI
    this.layersControl.redraw();
  }

  /**
   * Export the data (in screen visible) to geojson format
   */
  export()
  {
    let fileContentObj = {type : "FeatureCollection", features : []};

    // Export layers
    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      if(this.layersManager.layerGroups[i].selectedZone && this.layersManager.layerGroups[i].selectedZone.geom)
      {
        fileContentObj.features.push(this.layersManager.layerGroups[i].selectedZone.geom);

        let props = {};
        props["fill"] = this.layersManager.layerGroups[i].polygonOptions.color;
        props["fill-opacity"] = this.layersManager.layerGroups[i].polygonOptions.opacity;
        props["stroke-width"] = this.layersManager.layerGroups[i].polygonOptions.border_size;
        props["stroke"] = this.layersManager.layerGroups[i].polygonOptions.color;

        fileContentObj.features[fileContentObj.features.length - 1].properties = props;
      }
    }

    // Export Point
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      if(!this.params.timeEnable || (this.layersManager.markers[i].startDate <= this.timeControl.value && this.layersManager.markers[i].endDate >= this.timeControl.value))
      fileContentObj.features.push({type : "Feature", properties : {label : this.layersManager.markers[i].label, description : this.layersManager.markers[i].popUpContent}, geometry : {type : "Point", coordinates : [parseFloat(this.layersManager.markers[i].position[1]), parseFloat(this.layersManager.markers[i].position[0])]}});
    }

    // Create file
    let fileName = "export.geojson";

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(fileContentObj)));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}