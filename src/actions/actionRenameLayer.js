
class ActionRenameLayer extends Action
{
  /*
   * Action of rename a layer
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {parentLayerDiv}            parentLayerDiv               The parent layer div
   * @property {String}                 labelText                    The label text content
   */
  constructor(parentLayer, parentLayerDiv)
  {
    super();

    this.parentLayer = parentLayer;
    this.parentLayerDiv = parentLayerDiv;
    this.labelText = parentLayer.label.value;
  }

  /**
   * Change the layer label text value
   */
  undo()
  {
    let oldLabelText = this.parentLayer.label.value;

    this.parentLayer.label.value = this.labelText;

    this.labelText = oldLabelText;

    this.parentLayer.redraw();
    this.parentLayerDiv.redraw();
  }

  /**
   * Change the layer label text value
   */
  redo()
  {
    this.undo();
  }
}