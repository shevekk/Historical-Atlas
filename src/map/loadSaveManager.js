
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
   * @property {Boolean}                    logged                   The logged state 
   actionsList
   * @property {ActionsControl}             actionsControl           The action control
   */
  constructor(map, layersManager, params, backgroundControl, timeControl, layersControl, actionsList, jsonBackgrounds)
  {
    this.map = map;
    this.layersManager = layersManager;
    this.layersControl = layersControl;
    this.actionsControl = null;
    this.params = params;
    this.backgroundControl = backgroundControl;
    this.jsonBackgrounds = jsonBackgrounds;
    this.timeControl = timeControl;
    this.actionsList = actionsList;

    if(localStorage.getItem('session-id-histoatlas'))
    {
      this.logged = false;
    }
    else
    {
      this.logged = true;
    }
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
        me.actionsList.addActionLoadJson(me);

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
      this.timeControl.setValue(this.timeControl.value);
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

  /*
   * Save the file on server
   * @param {String}               name                   Name of the file
   */
  save(name)
  {
    if(name.length == 0)
    {
      alert("Sauvegarde Impossible : Le nom de fichier est vide");
      return;
    }

    var nameRegex = /^[a-zA-Z0-9\s]+$/;
    if(!nameRegex.test(name))
    {
      alert("Sauvegarde Impossible : Le nom de fichier n'est pas valide, il doit contenir uniquement des chiffres, des lettres et des espaces");
      return;
    }
    let fileName = name.replaceAll(" ", "_");

    let content = {};
    content = this.params.toJson(content);
    content = this.layersManager.toJson(content);

    this.callServer("map/checkIfFileExist", "POST", {name : name, user : localStorage.getItem('session-id-histoatlas')}).then((result) => {

      $("#loading").html("Sauvegarde en cours, cela peut prendre une minute");
      this.actionsControl.buttons["save"].hide();

      if(!result.exist || confirm("Le fichier existe déja, voulez vous l'écraser"))
      {
        let contentSave = {name : name, fileName : fileName, content : JSON.stringify(content), exist : result.exist, user : localStorage.getItem('session-id-histoatlas')};
        
        this.callServer("map/save", "POST", contentSave).then((result) => {

          $("#loading").html("");
          this.actionsControl.buttons["save"].show();
          alert("Sauvegarde Terminé");

        }).catch((err) => { alert("Sauvegarde Impossible : " + err.responseJSON.error); });
      }
        
    }).catch((err) => { alert("Sauvegarde Impossible : " + err.responseJSON.error); });
  }

  /*
   * Load a map on the server
   * @param {Number}               mapId                     The id of the map
   * @param {Function}             callback                  The callback
   */
  loadMapOnServer(mapId, callback)
  {
    let me = this;

    let apiName = `map/get/${mapId}?user=${localStorage.getItem('session-id-histoatlas')}&editMode=${me.params.editMode}`
    if(!localStorage.getItem('session-id-histoatlas'))
    {
      apiName = `map/getGuest/${mapId}?editMode=${me.params.editMode}`
    }

    me.callServer(apiName, "GET", {}).then((result) => {

      if(result.name)
      {
        me.actionsControl.buttons["save"].setFileName(result.name);
      }

      let contentObj = JSON.parse(result.data);

      me.initParamsFromData(contentObj);

      me.initMapFromData(contentObj);

      $("#nb-views").html(`Nombres de vues : ${result.views}`);

      callback();

    }).catch((err) => { 

      if(err.responseJSON)
      {
        alert("Chargement de la carte impossible : " + err.responseJSON.error);
      }

      me.layersManager.init();
      me.createEmptyMap();

      callback(); 
    });
  }

  /*
   * Check if the user is valid
   */
  checkValidUser()
  {
    let me = this;

    if(localStorage.getItem('session-id-histoatlas'))
    {
      this.callServer("user/checkValidUser", "GET").then((result) => {

        if(!me.logged)
        {
          me.actionsControl.updateLoggedState(true);
          me.logged = true;
        }

      }).catch((err) => {
        localStorage.removeItem('session-id-histoatlas');
        localStorage.removeItem('session-token-histoatlas');

        me.actionsControl.updateLoggedState(false);

        me.logged = false;
      });
    }
    else
    {
      if(me.logged)
      {
        me.actionsControl.updateLoggedState(false);
        me.logged = false;
      }
    }
  }

  /*
   * Call an API in the server
   * @param {String}               apiName                   The api name
   * @param {String}               method                    The method (GET, POST, ...)
   * @param {Object}               data                      Data of the API
   */
  callServer(apiName, method, data)
  {
    return new Promise(function(resolve, reject) 
    {
      Config.load().then((config) =>
      {
        let urlServer = config.serverUrl + "/api/" + apiName;

        $.ajax({
          url: urlServer,
          method: method,
          contentType: "application/json",
          headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
          data: JSON.stringify(data),
          success: (response) => {
            resolve(response);
          },
          error: (err) => {
            reject(err);
          }
        });
      });
    });
  }
}