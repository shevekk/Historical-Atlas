
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
   * @property {PaintLayer[]}           layerGroups           The paint layer array
   * @property {L.Map}                  map                   The map
   * @property {CursorManager}          cursorManager         The cursor manager
   * @property {PaintLayer}             selectedLayer         The selected layer
   */
  initialize: function (options) 
  {
    this.params = options.params;
    this.paintParams = options.paintParams;

    this.layersControl = options.layersControl;

    this.layerGroups = [];

    this.map = options.map;
    this.cursorManager = options.cursorManager;

    this.layerGroups.push(new PaintLayer(this.map, {color:'#ff0000'}, this.layerGroups.length, this.paintParams));
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
      
      if(!this.paintParams.removalContent)
      {
        if(!this.selectedLayer.addContent(geom))
        {
          this.mouseDown = false;
        }
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
   * Add a new layer with random color
   * @param {Object}               e                   Event with lat, long
   */
  addNewLayer : function(e)
  {
    let polygonOptions = {};

    let r = Math.round(Math.random() * 255);
    let g = Math.round(Math.random() * 255);
    let b = Math.round(Math.random() * 255);

    let colorText = "#"+r.toString(16).padStart(2,'0')+g.toString(16).padStart(2,'0')+b.toString(16).padStart(2,'0');

    polygonOptions = {color:`${colorText}`, fillOpacity : this.paintParams.opacity, weight: this.paintParams.borderWeight};

    // Remove last layer if is empty
    let removeLast = false;
    if(this.layerGroups[this.layerGroups.length - 1].geom == null)
    {
      this.layerGroups.splice(this.layerGroups.length - 1, 1);
      removeLast = true;
    }

    this.layerGroups.push(new PaintLayer(this.map, polygonOptions, this.layerGroups.length, this.paintParams));

    this.selectedLayer = this.layerGroups[this.layerGroups.length - 1];

    if(removeLast)
    {
      this.layersControl.updateLineColor(this.layerGroups[this.layerGroups.length - 1]);
    }
    else
    {
      this.layersControl.addLayer(this.layerGroups[this.layerGroups.length - 1], true);
    }
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
      if(this.layerGroups[i].geom && this.layerGroups[i].geom.geometry)
      {
        if(turf.booleanPointInPolygon(pt, this.layerGroups[i].geom))
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
      if(this.layerGroups[i].geom != null)
      {
        content.layers.push({options : this.layerGroups[i].polygonOptions, geom : this.layerGroups[i].geom, label : this.layerGroups[i].label.toJson()});
      }
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
      this.layerGroups.push(new PaintLayer(this.map, contentObj.layers[i].options, this.layerGroups.length, this.paintParams));
      this.layerGroups[this.layerGroups.length - 1].geom = contentObj.layers[i].geom;
      this.layerGroups[this.layerGroups.length - 1].label.fromJson(contentObj.layers[i].label);
      this.layerGroups[this.layerGroups.length - 1].label.updateZoom(this.params.zoom);
      this.layerGroups[this.layerGroups.length - 1].redraw();
    }

    this.selectedLayer = this.layerGroups[this.layerGroups.length - 1];

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
  },

  /*
   * Update the labels size of all layers
   */
   updateLabelSize()
   {
      for(let i = 0; i < this.layerGroups.length; i++)
      {
        this.layerGroups[i].label.updateZoom(this.paintParams.zoomLevel);

        if(this.layerGroups[i].geom != null)
        {
          this.layerGroups[i].label.redraw(this.layerGroups[i].layer, this.layerGroups[i].geom);
        }
      }
   },

  /*
   * Move the label of the selected layer
   * @param {Object}               e                   Event with lat, long
   */
  moveLabel(e)
  {
    this.selectedLayer.label.setPersoPosition([e.latlng.lng, e.latlng.lat])
    this.selectedLayer.label.redraw(this.selectedLayer.layer, this.selectedLayer.geom)
  }
});