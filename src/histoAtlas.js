
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
    $("#loading").html(`<h3>${Dictionary.get("MAP_LOADING_MAP")}</h3>`);

    $("#language-choise-text").html(Dictionary.get("MAP_DESC_LANG_CHOISE"));
    $('#map-lang-' + lang).prop("checked", true);
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
        zoom : 6,
        projection: {
          name: 'lambertConformalConic',
          center: [0, 30],
          parallels: [30, 30]
        }
      });

      me.actionsList = new ActionList();
      me.labelDate = new LabelDate(me.map, me.params);

      me.descriptionManager = new DescriptionManager(me.params);

      me.copyManager = new CopyManager(me.map, me.actionsList);

      me.backMenuControl = new BackMenuControl({params : me.params, paintParams : me.paintParams}).addTo(me.map);
      me.backgroundControl = new BackgroundControl({paintParams : me.paintParams, jsonBackgrounds : jsonBackgrounds}).addTo(me.map);
      me.backgroundControl.updateList(me.params.backgrounds, jsonBackgrounds);
      me.backgroundControl.manageEvents()
      me.timeControl = new TimeControl({params : me.params, paintParams : me.paintParams, labelDate : me.labelDate}).addTo(me.map);
      me.layersControl = new LayersControl({paintParams : me.paintParams, params : me.params, timeControl : me.timeControl, actionsList : me.actionsList});
      me.settingsControl = new SettingsControl({paintParams : me.paintParams, params : me.params, jsonBackgrounds : jsonBackgrounds, backgroundControl : me.backgroundControl, timeControl : me.timeControl, layersControl : me.layersControl}).addTo(me.map);
      me.propertiesControl = new PropertiesControl({}).addTo(me.map);

      me.cursorManager = new CursorManager({params : me.params, paintParams : me.paintParams});
      me.cursorManager.layer = L.layerGroup().addTo(me.map);

      me.layersManager = new LayersManager({params : me.params, paintParams : me.paintParams, cursorManager : me.cursorManager, map: me.map, layersControl :me.layersControl});

      me.loadSaveManager = new LoadSaveManager(me.map, me.layersManager, me.params, me.backgroundControl, me.timeControl, me.layersControl, me.actionsList, me.descriptionManager, jsonBackgrounds);
      me.geoJsonManager = new GeoJsonManager(me.map, me.layersManager, me.layersControl, me.timeControl, me.actionsList, me.loadSaveManager, me.params);

      me.actionsControl = new ActionsControl({cursorManager : me.cursorManager, paintParams : me.paintParams, layersManager: me.layersManager, params : me.params, loadSaveManager : me.loadSaveManager, layersControl : me.layersControl, actionsList : me.actionsList, copyManager : me.copyManager, geoJsonManager : me.geoJsonManager, descriptionManager : me.descriptionManager}).addTo(me.map);

      me.loadSaveManager.actionsControl = me.actionsControl;
      me.layersManager.actionsControl = me.actionsControl;
      me.layersControl.actionsControl = me.actionsControl;
      me.layersControl.addTo(me.map);

      me.timeControl.layersManager = me.layersManager;

      me.actionsList.timeControl = me.timeControl;
      me.actionsList.actionsControl = me.actionsControl;

      me.propertiesControl.initFromProps(me.layersManager, me.timeControl);

      me.keyboardEventsSManager = new KeyboardEventsManager(me.loadSaveManager, me.actionsControl, me.timeControl);

      me.keyboardEventsSManager.manageEvents(me.params.editMode);

      if(me.params.editMode)
      {
        me.loadSaveManager.checkValidUser();
        setInterval(function(){ me.loadSaveManager.checkValidUser(); }, 180000);
      }
      
      if(urlParams["file"])
      {
        me.loadSaveManager.loadFile(urlParams["file"], function()
        {
          $("#loading").html("");
          //$("#description-text").html(me.params.description);

          me.manageControlFromWindowSize();
        });
      }
      else if(urlParams["mapId"])
      {
        //me.loadSaveManager.checkValidUser(true, function() {
          me.loadSaveManager.loadMapOnServer(urlParams["mapId"], function()
          {
            $("#loading").html("");
            //$("#description-text").html(me.params.description.replaceAll("\n", "<br/>\n"));

            var evt = new CustomEvent("reloadPropertiesControl", { });
            document.dispatchEvent(evt);

            me.manageControlFromWindowSize();
          });
        //});
      }
      else
      {
        me.loadSaveManager.createEmptyMap();
        $("#loading").html("");

        me.manageControlFromWindowSize();

        me.descriptionManager.updateContent({name : "", lang : lang, type : "history"});

        Utils.callServer("map/createNewMap", "post", {});
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

    // Mouse Down action
    me.map.on('mousedown', function(e) 
    {
      me.paintParams.mouseDown = true;

      me.actionsList.addActionPaint(me.layersManager);
    });
    
    // Mouse Up action
    me.map.on('mouseup', function(e)
    {
      me.paintParams.mouseDown = false;

      me.actionsList.checkActionPaint(me.layersManager);
      
      if(me.paintParams.moveLabel)
      {
        me.layersManager.moveLabel(e);
        me.paintParams.autoClosePopUp = true;
        me.actionsControl.changeMoveLabelState();
        //me.map.dragging.enable();
      }

      else if(me.paintParams.moveMarker)
      {
        me.paintParams.moveMarker = false;
        me.paintParams.autoClosePopUp = true;
        me.layersControl.markersControl.setPosition(e);
        me.map.dragging.enable();
      }

      else if(me.copyManager.enable)
      {
        me.copyManager.endDraw();
      }

      else if(me.paintParams.selectionState)
      {
        me.actionsControl.manageSelection(e);
      }      
    });
    
    // Click on map action
    me.map.on('click', function(e)
    {
      if(me.paintParams.uiClick == false)
      {
        me.layersManager.layerGroups[0].layer.closePopup();

        if(!me.paintParams.selectionState)
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

      me.paintParams.autoClosePopUp = false;
    });
    
    // Mouse nove action
    me.map.on('mousemove', function(e) 
    {
      if(me.paintParams.uiClick == false)
      {
        if(me.paintParams.scrollDisable)
        {
          me.cursorManager.updateCursorPosition(e, me.layersManager.selectedLayer);
        }
        
        if(me.paintParams.mouseDown && me.copyManager.enable)
        {
          me.copyManager.addPoint(e);
        }
        else if(me.paintParams.mouseDown && me.paintParams.scrollDisable)
        {
          me.layersManager.addOrRemoveContent(e, me.actionsList);
        }
      }
    });
    
    // Zoom in map action
    me.map.on('zoom', function(e) 
    {
      me.paintParams.zoomLevel = e.target.getZoom();

      if(me.paintParams.scrollDisable)
      {
        me.cursorManager.updateCursorPosition(null, me.layersManager.selectedLayer);
      }

      me.layersManager.updateLabelSize();
    });
    
    // Manage change lang
    document.addEventListener('changeLang', function (e) 
    {
      let lang = e.detail.lang;

      Dictionary.load(lang, "", function()
      {
        let saveName = me.actionsControl.buttons["save"].savNameInput.value;

        me.actionsControl.removeButtons();
        me.actionsControl.createMenu();
        me.loadSaveManager.checkValidUser(true);
        me.actionsControl.buttons["save"].savNameInput.value = saveName;
        me.descriptionManager.changeLang();

        me.layersControl.redraw();
        me.backgroundControl.redraw();
        me.timeControl.redraw();
        me.settingsControl.redraw();
        me.backMenuControl.redraw();

        //me.manageDescription();

        $("#language-choise-text").html(Dictionary.get("MAP_DESC_LANG_CHOISE"));
      });

    }, false);
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

  /**
   * If the size of screen is small, reduce ui size
   */
  manageControlFromWindowSize()
  {
    if($(window).width() < 800 || $(window).height() < 800)
    {
      this.layersControl.changeVisibilityState();
      this.backgroundControl.changeVisibilityState();
    }
  }
}
