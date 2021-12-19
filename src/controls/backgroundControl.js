
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
  * @property {L.DomUtil}           imageHide               The image dom for hide menu
  */
  initialize: function (options) 
  {
    this.paintParams = options.paintParams;
    this.jsonBackgrounds = options.jsonBackgrounds;
    this.selectedBackground = "openstreetmap";
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

    let titleDiv = L.DomUtil.create('div', 'layers-list-title', this.div);
    this.title = L.DomUtil.create('b', '', titleDiv);
    this.title.innerHTML = Dictionary.get("MAP_BACKGROUND_TITLE");
    this.imageHide = L.DomUtil.create('img', 'layers-list-icon-hide', titleDiv);
    this.imageHide.src = "img/menu/minus-solid.svg";

    this.contentDiv = L.DomUtil.create('div', '', this.div);
    
    L.DomEvent.on(this.div, 'click', function(e) { this.paintParams.uiClick = true; }, this);
    L.DomEvent.addListener(this.div, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.div, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.div, 'mouseup', L.DomEvent.stop);

    L.DomEvent.on(this.imageHide, 'click', function(e) { this.changeVisibilityState();  } , this);

    return this.div;
  },

  /*
   * Redraw for lang change
   */
  redraw()
  {
    this.title.innerHTML = Dictionary.get("MAP_BACKGROUND_TITLE");
  },

  /* 
   * Change the visibility state
   * @param {L.DomUtil}        imageHide           The image dom
   */
  changeVisibilityState()
  {
    if(this.contentDiv.style["display"] == "none")
    {
      this.contentDiv.style["display"] = "inline-block";
      this.imageHide.src = "img/menu/minus-solid.svg";

      this.div.style["background"] = "rgba(255, 255, 255, 0.8)";
    }
    else
    {
      this.contentDiv.style["display"] = "none";
      this.imageHide.src = "img/menu/plus-solid.svg";

      this.div.style["background"] = "rgba(255, 255, 255, 0.5)";
    }
  },

  /*
   * Update the list of element for
   * @property {String[]}            backgrounds             The background list
   * @property {Object}              jsonBackgrounds         The json background
   */
  updateList(backgrounds, jsonBackgrounds)
  {
    //this.contentDiv.innerHTML = '<div style="text-align:center;"><b>Fond de Plan :</b><img class="layers-list-icon-hide" src="img/menu/minus-solid.svg" /><div>';
    this.contentDiv.innerHTML = '';
    for(let i = 0; i < backgrounds.length; i++)
    {
      let id = backgrounds[i];
      let name = jsonBackgrounds[backgrounds[i]].name;

      if(this.selectedBackground == id)
      {
        this.contentDiv.innerHTML += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType" checked="checked"/><label for="${id}">${name}</label><br/>`;
      }
      else
      {
        this.contentDiv.innerHTML += `<input id="${id}" type="radio" name="selectMapBackgoundType" class="selectMapBackgoundType"/><label for="${id}">${name}</label><br/>`;
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
      this.map.removeLayer(this.selectedTile);
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
    else if(this.jsonBackgrounds[id].type == "empty")
    {

    }
  }
});
