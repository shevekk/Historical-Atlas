
class ActionPaint extends Action
{
  /**
   * Action of remove a new zone
   * @param {PaintZone}                 targetZone                    The paint zone
   * @param {ParentLayer}               targetLayer                   The parent layer
   * @param {TimeControl}               timeControl                   The time control
   * @property {Object}                 geom                          The geom
   */
  constructor(targetZone, targetLayer, timeControl)
  {
    super();

    this.geom = targetZone.geom;
    this.targetZone = targetZone;
    this.targetLayer = targetLayer;
    this.timeControl = timeControl;
  }

  /*
   * Change zone geom and display (change time)
   */
  undo()
  {
    let oldGeom = this.targetZone.geom;
    this.targetZone.geom = this.geom;

    if(this.timeControl.value <= this.targetZone.startDate || this.timeControl.value >= this.targetZone.endDate)
    {
      this.timeControl.setValue(this.targetZone.startDate);
    }
    else
    {
      this.targetLayer.redraw();
    }

    this.geom = oldGeom;
  }

  /*
   * Change zone geom and display (change time)
   */
  redo()
  {
    this.undo();
  }
}