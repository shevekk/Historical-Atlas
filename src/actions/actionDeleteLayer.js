
class ActionDeleteLayer extends Action
{
  /**
   * Action of remove a new layer
   * @param {ParentLayer}               parentLayer                   The parent layer
   * @param {LayersControl}             layersControl                 The layer control
   * @param {LayersManager}             layersManager                 The layer manager
   * @param {TimeControl}               timeControl                   The time control
   */
  constructor(parentLayer, LayersControl, layersManager, timeControl)
  {
    super();

    this.parentLayer = parentLayer;
    this.LayersControl = LayersControl;
    this.layersManager = layersManager;
    this.timeControl = timeControl;
  }

  /**
   * Add the layer
   */
  undo()
  {
    this.layersManager.layerGroups.push(this.parentLayer);

    this.layersManager.changeTime(this.timeControl.value);

    this.layersManager.layersControl.updateLayersContent(this.layersManager);
  }

  /**
   * Re-Remove the layer
   */
  redo()
  {
    this.layersManager.removeALayerGroup(this.parentLayer);

    this.layersManager.layersControl.updateLayersContent(this.layersManager);

    this.layersManager.changeTime(this.timeControl.value);
  }
}