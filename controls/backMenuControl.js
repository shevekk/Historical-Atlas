/*
 * Control for back to menu
 */
var BackMenuControl = L.Control.extend({  

  /*
   * Options
   */
  options: {
    position: 'topright'
  },
 
  /*
   */
  initialize: function (options) 
  {
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd: function(map) 
  {
    this.map = map;

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

   
    this.button = L.DomUtil.create('a', 'back-menu-button', this._container);
    this.button.title = "Retour au menu principal";
    this.button.innerHTML = "Menu";

    L.DomEvent.addListener(this.button, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.button, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.button, 'mouseup', L.DomEvent.stop);

    L.DomEvent.on(this.button, 'click', function(e) { window.location.href = "index.html"; }, this);
    
    return this._container;
  }
});