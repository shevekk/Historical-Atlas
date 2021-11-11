
class ActionChangeDateZone extends Action
{
  /**
   * Action of change the date of the zone
   * @param {PaintZone}                 paintZone                       The paint zone
   * @param {ParentLayerDiv}            parentLayerDiv                  The parent layer div
   * @property {Number}                 startDate                       The stored start date
   * @property {Number}                 endDate                         The stored end date
   */
  constructor(paintZone, parentLayerDiv)
  {
    super();

    this.paintZone = paintZone;
    this.parentLayerDiv = parentLayerDiv;
    this.startDate = this.paintZone.startDate;
    this.endDate = this.paintZone.endDate;
  }

  /**
   * Change dates and redraw control
   */
  undo()
  {
    let oldStartDate = this.paintZone.startDate;
    let oldEndDate = this.paintZone.endDate;

    this.paintZone.startDate = this.startDate;
    this.paintZone.endDate = this.endDate;

    this.startDate = oldStartDate;
    this.endDate = oldEndDate;

    this.parentLayerDiv.redraw();
  }

  /**
   * Change dates and redraw control
   */
  redo()
  {
    this.undo();
  }
}