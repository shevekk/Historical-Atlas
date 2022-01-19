
class ActionCopy extends Action
{
  /**
   * Action of a action of copy
   * @param {CopyManager}               copyManager                   The copy manager
   */
  constructor(copyManager)
  {
    super();

    this.copyManager = copyManager;
    this.copyPolygon = copyManager.polygonCopy;
  }

  /**
   * Undo copy
   */
  undo()
  {
    let oldCopyPolygon = Object.assign(Object.create(Object.getPrototypeOf(this.copyManager.polygonCopy)), this.copyManager.polygonCopy);
    this.copyManager.polygonCopy = this.copyPolygon;
    this.copyPolygon = oldCopyPolygon;
  }

  /**
   * Redo copy
   */
  redo()
  {
    this.undo();
  }
}