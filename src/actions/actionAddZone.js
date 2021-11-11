
class ActionAddZone extends Action
{
  /**
   * Action of add a new zone
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {LayersControl}             layersControl                The layer control
   * @param {ParentLayerDiv}            parentLayerDiv               The parent layer div
   * @param {LayersManager}             layersManager                The layer manager
   * @param {TimeControl}               timeControl                  The time control
   */
  constructor(paintZone, parentLayer, parentLayerDiv, layersManager, timeControl)
  {
    super();

    this.paintZone = paintZone;
    this.parentLayer = parentLayer;
    this.parentLayerDiv = parentLayerDiv;
    this.layersManager = layersManager;
    this.timeControl = timeControl;
  }

  /**
   * Remove the zone
   */
  undo()
  {
    this.parentLayer.removePaintZone(this.paintZone);
    this.parentLayerDiv.redraw();
    this.layersManager.changeTime(this.timeControl.value);
    this.layersManager.layersControl.changeSelectedZone();
  }

  /**
   * Re-Add the zone
   */
  redo()
  {
    this.parentLayer.paintZones.push(this.paintZone);

    this.parentLayerDiv.reOrder()

    this.layersManager.changeTime(this.timeControl.value);
    this.layersManager.layersControl.changeSelectedZone();
  }
}