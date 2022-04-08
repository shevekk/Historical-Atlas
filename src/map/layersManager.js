
/*
 * Manage all display layer
 */ 
var LayersManager = L.Class.extend({

  options : {},

  /* 
   * Initialize the LayersManager
   * @property {Param}                  params                Application params
   * @property {paintParams}            paintParams           Paint params
   * @property {LayerControl}           layersControl         The layer controller
   * @property {ParentLayer[]}          layerGroups           The paint layer array
   * @property {L.Map}                  map                   The map
   * @property {CursorManager}          cursorManager         The cursor manager
   * @property {ParentLayer}            selectedLayer         The selected layer
   */
  initialize: function (options) 
  {
    this.params = options.params;
    this.paintParams = options.paintParams;

    this.layersControl = options.layersControl;

    this.map = options.map;
    this.cursorManager = options.cursorManager;

    this.init();

    this.actionsControl = null;

    this.markers = [];
  },

  /*
   * Init the layerManager
   */
  init()
  {
    this.layerGroups = [];
    this.layerGroups.push(new ParentLayer(this.map, {color:'#ff0000'}, this.layerGroups.length, this.paintParams, this.params));
    this.selectedLayer = this.layerGroups[0];
  },

  /*
   * Manage of add or remove content
   * @param {Object}               e                   Event with lat, long
   */
  addOrRemoveContent(e)
  {
    if(this.cursorManager.position.lng > this.params.cursorMinLng && this.cursorManager.position.lng < this.params.cursorMaxLng)
    {
      let raduisExtend = 150 * Math.abs(Math.cos(this.cursorManager.position.lat * Math.PI / 180)) / Math.pow(2, this.paintParams.zoomLevel);
      let geom = turf.circle({ type: "Point", coordinates: [this.cursorManager.position.lng, this.cursorManager.position.lat]}, this.paintParams.cursorRaduis * raduisExtend, {});

      //me.actionsList.updateGeom(geom); 
      
      if(!this.paintParams.removalContent)
      {
        if(this.selectedLayer.selectedZone)
        {
          this.selectedLayer.addContent(geom);
        }
        else
        {
          if(this.paintParams.scrollDisable)
          {
            this.actionsControl.changeScrollDisableState();
            this.paintParams.mouseDown = false;
          }

          alert("Aucun calque selectionné");
        }
        
        /*
        if(!this.selectedLayer.addContent(geom))
        {
          this.mouseDown = false;
        }
        */
      }
      else
      {
        // Remove content all content
        if(this.paintParams.removalAll)
        {
          for(let i = 0; i < this.layerGroups.length; i++)
          {
            this.layerGroups[i].removeContent(geom);
          }
        }
        else
        {
          this.selectedLayer.removeContent(geom);
        }
      }
    }
  },

  /*
   * Add a new layer with random color and update UI
   */
  addNewLayer : function()
  {
    let polygonOptions = {};

    let r = Math.round(Math.random() * 255);
    let g = Math.round(Math.random() * 255);
    let b = Math.round(Math.random() * 255);

    let colorText = "#"+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');

    polygonOptions = {color:`${colorText}`, fillOpacity : this.paintParams.opacity, weight: this.paintParams.borderWeight};

    let number = 1;
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      if(this.layerGroups[i].number >= number)
      {
        number = this.layerGroups[i].number + 1;
      }
    }

    this.layerGroups.push(new ParentLayer(this.map, polygonOptions, number, this.paintParams, this.params));

    this.selectedLayer = this.layerGroups[this.layerGroups.length - 1];

    this.layersControl.addLayer(this.layerGroups[this.layerGroups.length - 1], true);
    this.layersControl.parentsLayersDiv[this.layersControl.parentsLayersDiv.length - 1].select();
  },

  /*
   * Manage selection
   * @param {Object}               e                   Event with lat, long
   */
  manageSelection : function(e)
  {
    let oldSelectedLayer = this.selectedLayer;

    let selectedLayers = [];
    var pt = turf.point([e.latlng.lng, e.latlng.lat]);

    // Select all layer in cursor position
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      if(this.layerGroups[i].selectedZone && this.layerGroups[i].selectedZone.geom && this.layerGroups[i].selectedZone.geom.geometry)
      {
        if(turf.booleanPointInPolygon(pt, this.layerGroups[i].selectedZone.geom))
        {
          selectedLayers.push(this.layerGroups[i]);
        }
      }
    }

    if(selectedLayers.length == 1 || this.selectedLayer == null)
    {
      // Select first layer
      this.selectedLayer = selectedLayers[0];
      console.log(this.selectedLayer.number);
    }
    else
    {
      // Select next layer
      let changeSelected = false;
      for(let i = 0; i < selectedLayers.length; i++)
      {
        if(this.selectedLayer == selectedLayers[i] && !changeSelected)
        {
          changeSelected = true;

          if(selectedLayers.length > i+1)
          {
            this.selectedLayer = selectedLayers[i+1];
          }
          else
          {
            this.selectedLayer = selectedLayers[0];
          }
        }
      }
      if(!changeSelected && selectedLayers.length > 0)
      {
        this.selectedLayer = selectedLayers[0];
      }

      console.log(this.selectedLayer.number);
    }
  },

  /*
   * Export layers data to json
   * @param {Object}               content                   Content Object
   * @return {Object}                                        Content with layers data
   */
  toJson : function(content)
  {
    content.layers = [];
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      content.layers.push(this.layerGroups[i].toJson());
    }

    content.markers = [];
    for(let i = 0; i < this.markers.length; i++)
    {
      content.markers.push(this.markers[i].toJson());
    }

    return content;
  },

  /*
   * Init map from json content of layers
   * @param {Object}               contentObj                   Content Object with layer informations
   */
  fromJson : function(contentObj)
  {
    for(let i = 0; i < contentObj.layers.length; i++)
    {
      this.layerGroups.push(new ParentLayer(this.map, null, null, this.paintParams, this.params));
      this.layerGroups[i].fromJson(contentObj.layers[i]);
    }

    this.selectedLayer = this.layerGroups[0];

    if(contentObj["markers"])
    {
      for(let i = 0; i < contentObj["markers"].length; i++)
      {
        this.markers.push(new Marker(this.paintParams, i));
        this.markers[i].fromJson(contentObj["markers"][i]);
        this.markers[i].number = i;
      }
    }

    this.layersControl.updateLayersContent(this);
  },

 /*
  * Remove all layer of the map
  */
  clearMap()
  {
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      this.map.removeLayer(this.layerGroups[i].layer);
    }

    this.layerGroups = [];

    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].clear();
    }
    this.markers = [];
  },

  /*
   * Update the labels size of all layers
   */
   updateLabelSize()
   {
      for(let i = 0; i < this.layerGroups.length; i++)
      {
        this.layerGroups[i].updateLabelSize();
      }
   },

  /*
   * Move the label of the selected layer
   * @param {Object}               e                   Event with lat, long
   */
  moveLabel(e)
  {
    this.layersControl.actionsList.addActionMoveLabel(this.selectedLayer);

    this.selectedLayer.label.setCustomPosition(this.selectedLayer.selectedZone.number, [e.latlng.lng, e.latlng.lat]);
    this.selectedLayer.label.redraw(this.selectedLayer.layer, this.selectedLayer.selectedZone.geom, this.selectedLayer.selectedZone.number);
  },

  /*
   * Change the selected zone from time value
   * @param {Number}               timeValue                   The time value
   */
  changeTime(timeValue)
  {
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      this.layerGroups[i].changeZoneFromTime(timeValue);
    }

    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].updateVisibilityFromTime(timeValue, this.map, this.params); 
    }
  },

  /*
   * Change the visible markers for a time area
   * @param {Number}               startTime                 The start time value
   * @param {Number}               endTime                   The end time value
   */
  displayTimeArea(startTime, endTime)
  {
    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].updateVisibilityFromTimeArea(startTime, endTime, this.map, this.params); 
    }
  },

  /*
   * Remove a layer group
   * @param {ParentLayer}               layer                   Layer to remove
   */
  removeALayerGroup(layer)
  {
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      if(this.layerGroups[i] == layer)
      {
        this.layerGroups[i].remove();
        this.layerGroups.splice(i, 1);
      }
    }

    if(layer == this.selectedLayer)
    {
      this.selectedLayer = this.layerGroups[this.layerGroups.length - 1];
    }
  },

  /*
   * Change the select zone if param time is disable (first zone)
   */
  changeSelectZoneWithoutTime()
  {
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      this.layerGroups[i].changeSelectZoneWithoutTime();
    }

    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].draw(this.map);
    }
  },

  /**
   * Fill In the active layer
   */
  fillInActiveLayer()
  {
    if(this.selectedLayer.selectedZone)
    {
      this.selectedLayer.selectedZone.fillIn();
    }

    this.selectedLayer.redraw(true);
  },

  /**
   * Simplify in the active layer
   * @param {Number}               tolerance                   The tolerence of simplification
   */
  simplifyActiveLayer(tolerance)
  {
    this.selectedLayer.selectedZone.simplify(tolerance);

    this.selectedLayer.redraw(true);
  },

  /**
   * Update paintZone date values for change date type
   * @param {String}               oldTypeDate                   The old date type
   * @param {String}               newTypeDate                   The new date type
   */
  updateTypeDate(oldTypeDate, newTypeDate)
  {
    for(let i = 0; i < this.layerGroups.length; i++)
    {
      this.layerGroups[i].updateTypeDate(oldTypeDate, newTypeDate);
    }

    for(let i = 0; i < this.markers.length; i++)
    {
      this.markers[i].updateTypeDate(oldTypeDate, newTypeDate);
    }
  }
});