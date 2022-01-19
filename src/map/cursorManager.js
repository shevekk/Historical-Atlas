
/* 
 * Manager of the cursor
 */
var CursorManager = L.Class.extend({

  options : {},

  /* 
   * Initialize the layersControl
   * @property {Object}                 position            Position with lat, long of the cursor
   * @property {L.LayerGroup}           layer               The layer group of the cursor
   * @property {Param}                  params              Application params
   * @property {paintParams}            paintParams         Paint params
   */
  initialize: function (options) 
  {
    this.position = {lng : 0, lat : 0};
    this.layer = null;
    this.params = options.params;
    this.paintParams = options.paintParams;
  },

  /*
   * Update the cursor position
   * @param {Object}               e                   Event with lat, long
   * @param {PaintLayer}           selectedLayer       The selected paint layer (for polygon options)
   */
  updateCursorPosition: function (e, selectedLayer)
  {
    if(e)
    {
      this.position = e.latlng;
    }

    if(this.position.lng > this.params.cursorMinLng && this.position.lng < this.params.cursorMaxLng)
    {
      let cursorCircle = L.circleMarker(this.position, selectedLayer.polygonOptions).setRadius(this.paintParams.cursorRaduis);
      
      if(this.paintParams.removalContent)
      {
        cursorCircle.setStyle({color : 'black', fillOpacity : 0, weight: 3});
      }
      
      this.layer.clearLayers();
      cursorCircle.addTo(this.layer);
    }
  }

});