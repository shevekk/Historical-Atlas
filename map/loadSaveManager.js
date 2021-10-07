

/*
 * Manage Save and Load actions
 */
class LoadSaveManager
{
  /* 
   * Initialize the LoadSaveManager
   * @property {L.Map}                      map                      The map
   * @property {LayerManager}               layersManager            The layers manager
   * @property {Param}                      params                   Application params
   * @property {BackgroundControl}          backgroundControl        The background controller
   * @property {TimeControl}                timeControl              The time control
   * @property {LayersControl}              layersControl            The layers control
   * @property {Object}                     jsonBackgrounds          The json background
   */
  constructor(map, layersManager, params, backgroundControl, timeControl, layersControl, jsonBackgrounds)
  {
    this.map = map;
    this.layersManager = layersManager;
    this.layersControl = layersControl;
    this.params = params;
    this.backgroundControl = backgroundControl;
    this.jsonBackgrounds = jsonBackgrounds;
    this.timeControl = timeControl;
  }

  /*
   * Export actual representation to a json file
   */
  export()
  {
    let content = {};

    content = this.params.toJson(content);
    content = this.layersManager.toJson(content);

    let fileName = "export.json";

    let ajaxRequest = $.ajax({
      url:"log/log.php",
      dataType: 'json',
      method: "POST",
      data: { content: JSON.stringify(content) }
    });

    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(content)));
    element.setAttribute('download', fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

 /*
  * Load a json file
  */
  importManagement()
   {
    let me = this;

    var fileInput = document.getElementById("inputImportFile"),
    readFile = function () {
      var reader = new FileReader();
      reader.fileName = document.querySelector('input[type=file]').files[0];
      reader.onload = function (readerEvt) 
      {
        var isJsonFile = reader.fileName.name.endsWith(".json");
        
        if(isJsonFile)
        {
          let fileContent = reader.result;
          let contentObj = JSON.parse(fileContent);

          if(contentObj.layers)
          {
            me.initParamsFromData(contentObj)
            me.initMapFromData(contentObj);
          }
          else
          {
            alert("Le fichier est invalide");
          }
        }
        else
        {
          alert('Le fichier importer doit être de type JSON');
        }
      };
      // start reading the file. When it is done, calls the onload event defined above.
      reader.readAsText(fileInput.files[0]);
    };

    fileInput.addEventListener('change', readFile);
  }

  /*
   * Load a file
   * @param {String}               fileUrl                   The file url
   * @param {Function}             filcallbackeUrl           The function callback
   */
  loadFile(fileName, callback)
  {
    let me = this;

    let fileUrl = fileName+".json?jsoncallback=?";
    if(!fileName.startsWith("http"))
    {
      fileUrl = "files/"+fileName+".json";
    }

    $.getJSON(fileUrl, function(data) 
    {
      if(data.layers)
      {
        try
        {
          me.initParamsFromData(data);

          me.initMapFromData(data);

          callback();
        }
        catch (error) 
        {
          alert("Le fichier carte cible est invalide");
          console.log( "Load map fail" );

          me.layersManager.init();
          me.createEmptyMap();

          callback();
        }
      }
      else
      {
        alert("Le fichier est invalide");
      }
    })
    .fail(function() 
    {
      alert("Le fichier carte cible est inexistant ou invalide");
      console.log( "Load map fail" );

      me.createEmptyMap();

      callback();
    });
  }

  /*
   * Create an empty map
   */
  createEmptyMap()
  {
    this.layersControl.updateLayersContent(this.layersManager);
    this.params.updateMap(this.map);
    this.backgroundControl.setBackground("openstreetmap");

    this.timeControl.updateFromParams();
  }

  /*
   * Init the map from json content
   * @param {Object}               contentObj                   The file json object
   */
  initMapFromData(contentObj)
  {
    this.layersManager.clearMap();

    this.layersManager.fromJson(contentObj);

    this.actionsControl.updateParamsFromLayerOptions(this.layersManager.selectedLayer.polygonOptions);

    if(this.params.timeEnable)
    {
      this.timeControl.setValue(this.params.timeMin);
    }
    else
    {
      this.layersManager.changeSelectZoneWithoutTime();
    }
  }

  /*
   * Init params from loading data and update map and background
   * @param {Object}               data                   File data
   */
  initParamsFromData(data)
  {
    this.params.fromJson(data);
    this.params.updateMap(this.map);
    this.backgroundControl.setBackground(this.params.backgroundDefault);
    this.backgroundControl.updateList(this.params.backgrounds, this.jsonBackgrounds);
    this.timeControl.updateFromParams();
  }
}