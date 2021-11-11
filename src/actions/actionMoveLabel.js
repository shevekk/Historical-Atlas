
class ActionMoveLabel extends Action
{
  /**
   * Action of move the label
   * @param {ParentLayer}               parentLayer                   The parent layer
   * @property {Array}                  customPositions               Array of positions
   */
  constructor(parentLayer)
  {
    super();

    this.parentLayer = parentLayer;
    this.customPositions = [];
    Object.assign(this.customPositions, parentLayer.label.customPositions);
  }

  /**
   * Change positions and redraw
   */
  undo()
  {
    let oldCustomPositions = [];
    Object.assign(oldCustomPositions, this.parentLayer.label.customPositions)

    this.parentLayer.label.customPositions = this.customPositions;

    this.customPositions = oldCustomPositions;

    this.parentLayer.redraw();
  }

  /**
   * Change positions and redraw
   */
  redo()
  {
    this.undo();
  }
}