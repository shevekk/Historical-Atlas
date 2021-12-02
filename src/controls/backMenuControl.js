/*
 * Control for back to menu
 */
var BackMenuControl = L.Control.extend({  

  /*
   * Options
   */
  options: {
    position: 'bottomleft'
  },
 
  /*
   */
  initialize: function (options) 
  {
    this.params = options.params;
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd: function(map) 
  {
    this.map = map;

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

    if(this.inIframe())
    {
      // Accès in main site button
      this.buttonMain = L.DomUtil.create('a', 'back-menu-button', this._container);
      this.buttonMain.title = "Voir sur le site (grand écran)";
      this.buttonMain.innerHTML = "Site";
      this.buttonMain.href = "";
      this.buttonMain.target = "_blank";

      L.DomEvent.addListener(this.buttonMain, 'dblclick', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonMain, 'mousedown', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonMain, 'mouseup', L.DomEvent.stop);
    }
   
    // Menu button
    this.buttonMenu = L.DomUtil.create('a', 'back-menu-button', this._container);
    this.buttonMenu.title = "Retour au menu principal";
    this.buttonMenu.innerHTML = "Menu";
    this.buttonMenu.href = "index.html";
    if(this.params.editMode)
    {
      this.buttonMenu.target = "_blank";
    }

    L.DomEvent.addListener(this.buttonMenu, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonMenu, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonMenu, 'mouseup', L.DomEvent.stop);

    // Help button
    this.buttonHelp = L.DomUtil.create('a', 'back-menu-button', this._container);
    this.buttonHelp.title = "Acceder au menu d'aide";
    this.buttonHelp.innerHTML = "Aide";
    this.buttonHelp.href = "files/HistoAtlas_Help.pdf";
    this.buttonHelp.target = "_blank";

    L.DomEvent.addListener(this.buttonHelp, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonHelp, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonHelp, 'mouseup', L.DomEvent.stop);

    return this._container;
  },

  inIframe : function() 
  {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
});