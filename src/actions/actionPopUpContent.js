
class ActionPopUpContent extends Action
{
  /*
   * Action of a  modify pop up content
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {ParentLayer}               parentLayer                  The parent layer
   * @property {String}                 popupContent                 The popup content
   */
  constructor(paintZone, parentLayer)
  {
    super();

    this.paintZone = paintZone;
    this.parentLayer = parentLayer;
    this.popupContent = paintZone.popupContent;
  }

  /*
   * Modify popUp content
   */
  undo()
  {
    let oldPopupContent = this.paintZone.popupContent;

    this.paintZone.popupContent = this.popupContent;

    this.popupContent = oldPopupContent;

    this.parentLayer.redraw();
  }

  /*
   * Modify popUp content
   */
  redo()
  {
    this.undo();
  }
}