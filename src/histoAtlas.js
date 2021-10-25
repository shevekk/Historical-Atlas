
/*
 * Main class
 */
class Main
{
  /*
   * @property {L.Map}                      map                       The map
   * @property {Params}                     params                    The params
   * @property {PaintParams}                paintParams               The parameters parameters
   * @property {LoadSaveManager}            loadSaveManager           Manager of load and save
   * @property {BackgroundControl}          backgroundControl         The background controller 
   * @property {LayersControl}              layersControl             The layer controller 
   * @property {SettingsControl}            settingsControl           The settings controller 
   * @property {CursorManager}              cursorManager             The cursor manager 
   * @property {LayersManager}              layersManager             The layers manager      
   */
  constructor() 
  { 
    this.map;

    this.params = new Params();
    this.paintParams = new PaintParams();
    this.loadSaveManager = null;
    $("#loading").html("<h3>Chargement de la carte en cours</h3>");
  }
  
  /*
   * Init map and painter
   */
  init()
  {
    let me = this;
    let urlParams = me.getUrlParams();

    if(urlParams["edit"] == "false")
    {
      me.params.editMode = false;
    }

    $.getJSON("config/backgounds.json", function(jsonBackgrounds) 
    {
      let centerMap = [46.7213889, 2.4011111];

      me.map = L.map('map', {
        center: centerMap,
        zoom : 6
      });

      me.backMenuControl = new BackMenuControl({}).addTo(me.map);
      me.backgroundControl = new BackgroundControl({paintParams : me.paintParams, jsonBackgrounds : jsonBackgrounds}).addTo(me.map);
      me.backgroundControl.manageEvents()
      me.timeControl = new TimeControl({params : me.params, paintParams : me.paintParams}).addTo(me.map);
      me.layersControl = new LayersControl({paintParams : me.paintParams, params : me.params, timeControl : me.timeControl});
      me.settingsControl = new SettingsControl({paintParams : me.paintParams, params : me.params, jsonBackgrounds : jsonBackgrounds, backgroundControl : me.backgroundControl, timeControl : me.timeControl, layersControl : me.layersControl}).addTo(me.map);

      me.cursorManager = new CursorManager({params : me.params, paintParams : me.paintParams});
      me.cursorManager.layer = L.layerGroup().addTo(me.map);

      me.layersManager = new LayersManager({params : me.params, paintParams : me.paintParams, cursorManager : me.cursorManager, map: me.map, layersControl :me.layersControl});

      me.loadSaveManager = new LoadSaveManager(me.map, me.layersManager, me.params, me.backgroundControl, me.timeControl, me.layersControl, jsonBackgrounds);

      me.actionsControl = new ActionsControl({cursorManager : me.cursorManager, paintParams : me.paintParams, layersManager: me.layersManager, params : me.params, loadSaveManager : me.loadSaveManager, layersControl : me.layersControl}).addTo(me.map);

      me.loadSaveManager.actionsControl = me.actionsControl;
      me.layersManager.actionsControl = me.actionsControl;
      me.layersControl.actionsControl = me.actionsControl;
      me.layersControl.addTo(me.map);

      me.timeControl.layersManager = me.layersManager;

      if(urlParams["file"])
      {
        me.loadSaveManager.loadFile(urlParams["file"], function()
        {
          $("#loading").html("");
        });
      }
      else if(urlParams["mapId"])
      {
        me.loadSaveManager.loadMapOnServer(urlParams["mapId"], function()
        {
          $("#loading").html("");
        });
      }
      else
      {
        me.loadSaveManager.createEmptyMap();
        $("#loading").html("")
      }

      if(me.params.editMode)
      {
        me.loadSaveManager.checkValidUser();
        setInterval(function(){ me.loadSaveManager.checkValidUser(); }, 180000);
      }

      me.manageMapEvents();
    });
  }

  /*
   * Manage events in map
   */
  manageMapEvents()
  {
    let me = this;
    me.paintParams.mouseDown = false;

    me.map.on('mousedown', function(e) 
    {
      me.paintParams.mouseDown = true;
    });
    
    me.map.on('mouseup', function(e)
    {
      me.paintParams.mouseDown = false;
    });
    
    me.map.on('click', function(e)
    {
      if(me.paintParams.uiClick == false)
      {
        if(me.paintParams.moveLabel)
        {
          me.layersManager.moveLabel(e);
          me.actionsControl.changeMoveLabelState();
        }
        else if(me.paintParams.selectionState)
        {
          me.actionsControl.manageSelection(e);
        }
        else
        {
          if(me.paintParams.scrollDisable)
          {
            me.layersManager.addOrRemoveContent(e);
          }
        }
      }
      else
      {
        me.paintParams.uiClick = false;
      }
    });
    
    me.map.on('mousemove', function(e) 
    {
      if(me.paintParams.uiClick == false)
      {
        if(me.paintParams.scrollDisable)
        {
          me.cursorManager.updateCursorPosition(e, me.layersManager.selectedLayer);
        }
        
        if(me.paintParams.mouseDown && me.paintParams.scrollDisable)
        {
          me.layersManager.addOrRemoveContent(e);
        }
      }
    });
    
    me.map.on('zoom', function(e) 
    {
      me.paintParams.zoomLevel = e.target.getZoom();

      if(me.paintParams.scrollDisable)
      {
        me.cursorManager.updateCursorPosition(null, me.layersManager.selectedLayer);
      }

      me.layersManager.updateLabelSize();
    });
  }

  /**
   * get params in the address bar
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
  
}
