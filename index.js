
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
      me.map = L.map('map', {
        layers: []
      });

      me.backgroundControl = new BackgroundControl({paintParams : me.paintParams, jsonBackgrounds : jsonBackgrounds}).addTo(me.map);
      me.backgroundControl.manageEvents()
      me.layersControl = new LayersControl({paintParams : me.paintParams, params : me.params});
      me.settingsControl = new SettingsControl({paintParams : me.paintParams, params : me.params, jsonBackgrounds : jsonBackgrounds, backgroundControl : me.backgroundControl}).addTo(me.map);

      me.cursorManager = new CursorManager({params : me.params, paintParams : me.paintParams});
      me.cursorManager.layer = L.layerGroup().addTo(me.map);

      me.layersManager = new LayersManager({params : me.params, paintParams : me.paintParams, cursorManager : me.cursorManager, map: me.map, layersControl :me.layersControl});

      me.loadSaveManager = new LoadSaveManager(me.map, me.layersManager, me.params, me.backgroundControl, jsonBackgrounds);

      me.actionsControl = new ActionsControl({cursorManager : me.cursorManager, paintParams : me.paintParams, layersManager: me.layersManager, params : me.params, loadSaveManager : me.loadSaveManager, layersControl : me.layersControl}).addTo(me.map);

      me.loadSaveManager.actionsControl = me.actionsControl;
      me.layersControl.actionsControl = me.actionsControl;
      me.layersControl.addTo(me.map);

      if(urlParams["file"])
      {
        me.loadSaveManager.loadFile("files/"+urlParams["file"]+".json");
      }
      else
      {
        me.layersControl.updateLayersContent(me.layersManager);
        me.params.updateMap(me.map);
        me.backgroundControl.setBackground("openstreetmap");
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
    me.mouseDown = false;

    me.map.on('mousedown', function(e) 
    {
      me.mouseDown = true;
    });
    
    me.map.on('mouseup', function(e)
    {
      me.mouseDown = false;
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
        
        if(me.mouseDown && me.paintParams.scrollDisable)
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
