
/*
 * Controller of background
 */
var BackgroundControl = L.Control.extend({  

  options: {
      position: 'topright'
  },

 /*
  * @property {L.Map}               map                     The map
  * @property {PaintParams}         paintParams             The paint params
  * @property {Object}              jsonBackgrounds         The json background
  * @property {String}              selectedBackground      The selected background key name
   */
  initialize: function (options) 
  {
    this.paintParams = options.paintParams;
    this.jsonBackgrounds = options.jsonBackgrounds;
    this.selectedBackground = "";
    this.selectedTile = null;
  },

  /* 
   * Build menu of choose background
   * @property {L.Map}               map                     The map
   */
  onAdd(map)
  {
    this.map = map;

    this.div = L.DomUtil.create('div', 'background-div');
    this.div.innerHTML += '<div style="text-align:center;"><b>Fond de Plan :</b><div>';

    this.div.innerHTML += '<input id="openstreetmap" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType" checked/><label for="openstreetmap">OpenStreetMap</label><br/>';
    this.div.innerHTML += '<input id="arcgis" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType"/><label for="arcgis">ArcGIS</label><br/>';
    this.div.innerHTML += '<input id="mundialis" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType"/><label for="mundialis">Mundialis</label><br/>';
    
    L.DomEvent.on(this.div, 'click', function(e) { this.paintParams.uiClick = true; }, this);
    L.DomEvent.addListener(this.div, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.div, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.div, 'mouseup', L.DomEvent.stop);

    return this.div;
  },

  /*
   * Update the list of element for
   * @property {String[]}            backgrounds             The background list
   * @property {Object}              jsonBackgrounds         The json background
   */
  updateList(backgrounds, jsonBackgrounds)
  {
    this.div.innerHTML = '<div style="text-align:center;"><b>Fond de Plan :</b><div>';
    for(let i = 0; i < backgrounds.length; i++)
    {
      let id = backgrounds[i];
      let name = jsonBackgrounds[backgrounds[i]].name;

      if(this.selectedBackground == id)
      {
        this.div.innerHTML += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType" checked="checked"/><label for="${id}">${name}</label><br/>`;
      }
      else
      {
        this.div.innerHTML += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType"/><label for="${id}">${name}</label><br/>`;
      }
    }

    this.manageEvents();
  },

  /*
   * Manage action of background change 
   */
  manageEvents()
  {
    var me = this;

    $(".selectMapBackgoundType").change(function() 
    {
      let id = $(this)[0].id;

      me.setBackground(id);
    });
  },

  /*
   * Set the background of the map
   * @property {String}            id             The id name
   */
  setBackground(id)
  {
    this.selectedBackground = id;

    if(this.selectedTile)
    {
      //this.selectedTile.removeTo(this.map);
      this.map.removeLayer(this.selectedTile)
    }

    if(this.jsonBackgrounds[id].type == "tile")
    {
      this.selectedTile = L.tileLayer(this.jsonBackgrounds[id].url, {
        attribution: this.jsonBackgrounds[id].attribution,
        noWrap: true
      }).addTo(this.map);
    }
    else if(this.jsonBackgrounds[id].type == "wms")
    {
      this.selectedTile = L.tileLayer.wms(this.jsonBackgrounds[id].url, {
        layers: this.jsonBackgrounds[id].layers,
        attribution: this.jsonBackgrounds[id].attribution,
        noWrap: true
      }).addTo(this.map);
    }
  }
});
