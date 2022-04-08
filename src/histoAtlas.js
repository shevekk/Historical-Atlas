
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
    let defaultFullScreen = false;

    if(urlParams["edit"] == "false")
    {
      me.params.editMode = false;
    }
    if(urlParams["defaultFullScreen"] == "true")
    {
      defaultFullScreen = true;
    }

    $.getJSON("config/backgounds.json", function(jsonBackgrounds) 
    {
      let centerMap = [46.7213889, 2.4011111];

      me.map = L.map('map', {
        center: centerMap,
        zoom : 6,
        fullscreenControl: !defaultFullScreen,
        fullscreenControlOptions: {
          position: 'topleft'
        }
      });

      me.actionsList = new ActionList();
      me.labelDate = new LabelDate(me.map, me.params);

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

      me.loadSaveManager = new LoadSaveManager(me.map, me.layersManager, me.params, me.backgroundControl, me.timeControl, me.layersControl, me.actionsList, jsonBackgrounds);
      me.geoJsonManager = new GeoJsonManager(me.map, me.layersManager, me.layersControl, me.timeControl, me.actionsList, me.loadSaveManager, me.params);

      me.actionsControl = new ActionsControl({cursorManager : me.cursorManager, paintParams : me.paintParams, layersManager: me.layersManager, params : me.params, loadSaveManager : me.loadSaveManager, layersControl : me.layersControl, actionsList : me.actionsList, copyManager : me.copyManager, geoJsonManager : me.geoJsonManager}).addTo(me.map);

      me.loadSaveManager.actionsControl = me.actionsControl;
      me.layersManager.actionsControl = me.actionsControl;
      me.layersControl.actionsControl = me.actionsControl;
      me.layersControl.addTo(me.map);

      me.timeControl.layersManager = me.layersManager;

      me.actionsList.timeControl = me.timeControl;
      me.actionsList.actionsControl = me.actionsControl;

      me.propertiesControl.initFromProps(me.layersManager, me.timeControl);

      me.keyboardEventsSManager = new KeyboardEventsManager(me.loadSaveManager, me.actionsControl);

      if(me.params.editMode)
      {
        me.keyboardEventsSManager.manageEvents();
      }

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
        me.loadSaveManager.loadMapOnServer(urlParams["mapId"], function()
        {
          $("#loading").html("");
          //$("#description-text").html(me.params.description.replaceAll("\n", "<br/>\n"));

          var evt = new CustomEvent("reloadPropertiesControl", { });
          document.dispatchEvent(evt);

          me.manageControlFromWindowSize();
        });
      }
      else
      {
        me.loadSaveManager.createEmptyMap();
        $("#loading").html("");

        me.manageControlFromWindowSize();

        Utils.callServer("map/createNewMap", "post", {});
      }

      me.manageDescription();
      me.manageMapEvents();

      // If mobile -> Fullcreen
      if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      {
        defaultFullScreen = true;
      }

      if(defaultFullScreen)
      {
        me.toggleFullScreen();
      }
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

      me.actionsList.addActionPaint(me.layersManager);

      /*
      if(me.paintParams.moveLabel)
      {
        me.layersManager.moveLabel(e);
        me.actionsControl.changeMoveLabelState();
        me.map.dragging.enable();
      }

      else if(me.paintParams.moveMarker)
      {
        me.paintParams.moveMarker = false;
        me.layersControl.markersControl.setPosition(e);
        me.map.dragging.enable();
      }
      */
    });
    
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
    
    me.map.on('zoom', function(e) 
    {
      me.paintParams.zoomLevel = e.target.getZoom();

      if(me.paintParams.scrollDisable)
      {
        me.cursorManager.updateCursorPosition(null, me.layersManager.selectedLayer);
      }

      me.layersManager.updateLabelSize();
    });
    
    // 
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

        me.layersControl.redraw();
        me.backgroundControl.redraw();
        me.timeControl.redraw();
        me.settingsControl.redraw();
        me.backMenuControl.redraw();
 
        me.manageDescription();

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
   * Manage change of description
   */
  manageDescription()
  {
    let me = this;

    if(!me.params.editMode)
    {
      $("#img-description-edit").css("visibility", "hidden");
    }

    $("#img-description-edit").click(function() {

      $("#description-text").html(`<textarea id="text-area-description">${me.params.description.replaceAll("<br/>\n", "\n")}</textarea>`);
      $("#img-description-edit").css("visibility", "hidden");
      $("#sav-description").css("display", "inline");

      $("#sav-description").click(function() {

        if($("#text-area-description").length > 0)
        {
          me.params.description = $("#text-area-description").val().replaceAll("\n", "<br/>\n");

          $("#description-text").html(me.params.description);
          $("#img-description-edit").css("visibility", "visible");
          $("#sav-description").css("display", "none");
        }
      });
    });
    // Manage choise type
    $("#type-map-choise-history-label").html(Dictionary.get("MAP_TYPE_HISTORY"));
    $("#type-map-choise-uchrony-label").html(Dictionary.get("MAP_TYPE_UCHRONY"));
    $("#type-map-choise-present-label").html(Dictionary.get("MAP_TYPE_PRESENT"));
    $("#type-map-choise-text").html(Dictionary.get("MAP_TYPE_TEXT"));

    // Disabled radio element 
    if(!this.params.editMode)
    {
      jQuery("input[name='type-map-choise']").each(function() {
          $(this).prop('disabled', "true");
      });
      jQuery("input[name='map-lang']").each(function() {
          $(this).prop('disabled', "true");
      });
    }
  }

  /**
   * Manual toggle to the fullscreen mode
   */
  toggleFullScreen() 
  {
    var map = this.map;
    map._exitFired = false;
    if (map._isFullscreen) {
      if (this._screenfull.isEnabled && !this.options.forcePseudoFullscreen) {
        this._screenfull.exit();
      } else {
        leaflet.DomUtil.removeClass(this.options.fullscreenElement ? this.options.fullscreenElement : map._container, 'leaflet-pseudo-fullscreen');
        map.invalidateSize();
      }
      map.fire('exitFullscreen');
      map._exitFired = true;
      map._isFullscreen = false;
    }
    else {
      L.DomUtil.addClass(map._container, 'leaflet-pseudo-fullscreen');
        map.invalidateSize();
      map.fire('enterFullscreen');
      map._isFullscreen = true;
    }
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
