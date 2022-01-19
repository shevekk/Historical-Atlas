
class ActionAddLayer extends Action
{
  /**
   * Action of add a new layer
   * @param {ParentLayer}               parentLayer                   The parent layer
   * @param {LayersControl}             layersControl                 The layer control
   * @param {LayersManager}             layersManager                 The layer manager
   * @param {TimeControl}               timeControl                   The time control
   */
  constructor(parentLayer, layersControl, layersManager, timeControl)
  {
    super();

    this.parentLayer = parentLayer;
    this.layersControl = layersControl;
    this.layersManager = layersManager;
    this.timeControl = timeControl;
  }

  /**
   * Remove the layer
   */
  undo()
  {
    this.layersManager.removeALayerGroup(this.parentLayer);

    this.layersManager.layersControl.updateLayersContent(this.layersManager);

    this.layersManager.changeTime(this.timeControl.value);
  }

  /**
   * Re-Add the layer
   */
  redo()
  {
    this.layersManager.layerGroups.push(this.parentLayer);

    this.layersManager.changeTime(this.timeControl.value);

    this.layersManager.layersControl.updateLayersContent(this.layersManager);
  }
}