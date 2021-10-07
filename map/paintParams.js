
/*
 * Parameters 
 * @property {Number}            cursorRaduis             The size of the cursor
 * @property {Number}            zoomLevel                Actual zoom level
 * @property {Float}             opacity                  The opacity display value
 * @property {Number}            borderWeight             The border weight display value
 * @property {Boolean}           removalContent           True if remove content is enable
 * @property {Boolean}           removalAll               True if remove all content is enable
 * @property {Boolean}           scrollDisable            True if map scrool is disable (drawing enable)
 * @property {Boolean}           uiClick                  UI click state (Click in a control button)
 * @property {Boolean}           selectionState           The selection state (action selection label enable)
 * @property {Boolean}           moveLabel                The move label state (action move label enable)
 * @property {Boolean}           mouseDown                State of mouse clic (true is down)
 */
class PaintParams
{
  constructor()
  {
    this.cursorRaduis = 20;
    this.zoomLevel = 6;
    this.opacity = 0.20;
    this.borderWeight = 3;
    this.removalContent = false;
    this.removalAll = false;
    this.scrollDisable = false;

    this.uiClick = false;
    this.selectionState = false;
    this.moveLabel = false;

    this.mouseDown = false;
  }
}