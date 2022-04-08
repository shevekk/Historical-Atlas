/*
 * Control for back to menu
 */
var PropertiesControl = L.Control.extend({  

  /*
   * Options
   */
  options: {
    position: 'bottomleft'
  },
 
  /* 
   * Initialize Properties Control
   * @property {L.DomUtil[]}           listButtons              List of buttons
   * @property {Boolean}               isDefault                The if the default view is enable
   */
  initialize: function (options) 
  {
    this.listButtons = [];
    this.isDefault = true;
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd: function(map) 
  {
    let me = this;
    this.map = map;

    this._container = L.DomUtil.create('div', 'leaflet-control');

    return this._container;
  },

  /*
   * Init the forms buttons (if event reload call)
   * @param {LayersManager}               layersManager                   The layers Manager
   * @param {TimeControl}                 timeControl                     The time Control
   */
  initFromProps: function(layersManager, timeControl) 
  {
    let me = this;
    me.layersManager = layersManager;
    me.timeControl = timeControl;

    document.addEventListener('reloadPropertiesControl', function (e) 
    {
      // Remove property
      for(let i = 0; i < me.listButtons.length; i++)
      {
        L.DomUtil.remove(me.listButtons[i]);
      }
      if(me.returnButton)
      {
        L.DomUtil.remove(me.returnButton);
      }
      me.listButtons = [];

      me.backButton = L.DomUtil.create('button', 'properties-control-button', me._container);
      me.backButton.innerHTML = "Retour";
      me.backButton.style.display = "none";
      L.DomEvent.addListener(me.backButton, 'click', function() { me.backButtonClick() }, me);

      for(let i = 0; i < PropertiesForm.properties.length; i++)
      {
        me.listButtons.push(L.DomUtil.create('button', 'properties-control-button', me._container));
        me.listButtons[me.listButtons.length - 1].innerHTML = PropertiesForm.properties[i].name;

        L.DomEvent.addListener(me.listButtons[me.listButtons.length - 1], 'click', function() { me.applyFilter(PropertiesForm.properties[i], layersManager, me.listButtons[i]) }, me);
      }

    }, false);
  },

  /*
   * Apply a filter (clic in a button)
   * @param {Property}                 prop                         The property
   * @param {LayersManager}            layersManager                The layers Manager
   * @param {L.DomUtil}                button                       The button
   */
  applyFilter : function(prop, layersManager, button)
  {
    for(let i = 0; i < this.listButtons.length; i++)
    {
      this.listButtons[i].disabled = false;
    }
    button.disabled = true;
    this.backButton.style.display = "block";

    for(let i = 0; i < layersManager.layerGroups.length; i++)
    {
      let valueNumber = 1;
      for(let j = 0; j < layersManager.layerGroups[i].properties.length; j++)
      {
        if(layersManager.layerGroups[i].properties[j].propNumber == prop.number)
        {
          if(!layersManager.layerGroups[i].properties[j].startDate || !layersManager.layerGroups[i].properties[j].endDate || (layersManager.layerGroups[i].properties[j].startDate <= this.timeControl.value && layersManager.layerGroups[i].properties[j].endDate >= this.timeControl.value))
          {
            valueNumber = layersManager.layerGroups[i].properties[j].valueNumber;
          }
        }

        layersManager.layerGroups[i].viewPropertyNumber = prop.number;
      }

      if(this.isDefault)
      {
        this.layersManager.layerGroups[i].polygonOptionsInitial = {...this.layersManager.layerGroups[i].polygonOptions};
      }

      prop.modifyPolygonOptions(layersManager.layerGroups[i].polygonOptions, valueNumber);
      layersManager.layerGroups[i].redraw(false);
    }

    this.isDefault = false;
  },

  /*
   * Click in back button, display default view
   */
  backButtonClick : function()
  {
    this.backButton.style.display = "none";
    this.isDefault = true;

    for(let i = 0; i < this.listButtons.length; i++)
    {
      this.listButtons[i].disabled = false;
    }

    for(let i = 0; i < this.layersManager.layerGroups.length; i++)
    {
      this.layersManager.layerGroups[i].viewPropertyNumber = -1;
      this.layersManager.layerGroups[i].polygonOptions = {...this.layersManager.layerGroups[i].polygonOptionsInitial};
      this.layersManager.layerGroups[i].redraw(false);
    }
  }
});