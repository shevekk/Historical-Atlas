
class ActionList
{
  /*
   * Manage undo and redo actions 
   * @property {Actions}                 actions                    The list of actions to undo
   * @property {Actions}                 actionsToRedo              The list of actions to redo
   * @property {TimeControl}             timeControl                The time control
   * @property {ActionsControl}          actionsControl             The actions control
   */
  constructor()
  {
    this.actions = [];
    this.actionsToRedo = [];
    this.timeControl = null;
    this.actionsControl = null;
  }

  /**
   * Add a new action of paint
   * @param {LayersManager}          layersManager             The layer manager
   */
  addActionPaint(layersManager)
  {
    if(layersManager.selectedLayer.selectedZone)
    {
      this.actions.push(new ActionPaint(layersManager.selectedLayer.selectedZone, layersManager.selectedLayer, this.timeControl));

      if(this.actions.length > 10)
      {
        this.actions.shift();
      }
    }
  }

  /**
   * Check if the action of paint is not empty, sav action
   * @param {LayersManager}          layersManager             The layer manager
   */
  checkActionPaint(layersManager)
  {
    if(!(this.actions[this.actions.length - 1] instanceof ActionPaint) && this.actions[this.actions.length - 1].targetZone != layersManager.selectedLayer.selectedZone || layersManager.selectedLayer.selectedZone.geom == this.actions[this.actions.length - 1].geom)
    {
      this.actions.pop();
    }
    else
    {
      this.actionsControl.buttons["undo"].setActiveState(true);

      this.actionsToRedo = [];
      this.actionsControl.buttons["redo"].setActiveState(false);
    }
  }

  /**
   * Add a delete zone action
   * @param {PaintZone}                 paintZone                     The paint zone
   * @param {LayersControl}             layersControl                 The layer control
   * @param {ParentLayerDiv}            parentLayerDiv                The parent layer div
   * @param {LayersManager}             layersManager                 The layer manager
   */
  addActionDeleteZone(paintZone, parentLayer, parentLayerDiv, layersManager)
  {
    this.actions.push(new ActionDeleteZone(paintZone, parentLayer, parentLayerDiv, layersManager, this.timeControl));

    this.addAction();
  }

  /**
   * Add a add zone action
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {LayersControl}             layersControl                The layer control
   * @param {ParentLayerDiv}            parentLayerDiv               The parent layer div
   * @param {LayersManager}             layersManager                The layer manager
   */
  addActionAddZone(paintZone, parentLayer, parentLayerDiv, layersManager)
  {
    this.actions.push(new ActionAddZone(paintZone, parentLayer, parentLayerDiv, layersManager, this.timeControl));

    this.addAction();
  }

  /**
   * Add a delete layer action
   * @param {ParentLayer}               parentLayer                   The parent layer
   * @param {LayersControl}             layersControl                 The layer control
   * @param {LayersManager}             layersManager                 The layer manager
   */
  addActionDeleteLayer(parentLayer, LayersControl, layersManager)
  {
    this.actions.push(new ActionDeleteLayer(parentLayer, LayersControl, layersManager, this.timeControl));

    this.addAction();
  }

  /**
   * Add a add layer action
   * @param {ParentLayer}               parentLayer                   The parent layer
   * @param {LayersControl}             layersControl                 The layer control
   * @param {LayersManager}             layersManager                 The layer manager
   */
  addActionAddLayer(parentLayer, LayersControl, layersManager)
  {
    this.actions.push(new ActionAddLayer(parentLayer, LayersControl, layersManager, this.timeControl));

    this.addAction();
  }

  /**
   * Add a change date action
   * @param {PaintZone}                 paintZone                       The paint zone
   * @param {ParentLayerDiv}            parentLayerDiv                  The parent layer div
   */
  addActionChangeDateZone(paintZone, parentLayerDiv)
  {
    this.actions.push(new ActionChangeDateZone(paintZone, parentLayerDiv));

    this.addAction();
  }

  /**
   * Add a rename layer action
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {parentLayerDiv}            parentLayerDiv               The parent layer div
   */
  addActionRenameLayer(parentLayer, parentLayerDiv)
  {
    this.actions.push(new ActionRenameLayer(parentLayer, parentLayerDiv));

    this.addAction();
  }

  /**
   * Add a pop up content action
   * @param {PaintZone}                 paintZone                    The paint zone
   * @param {ParentLayer}               parentLayer                  The parent layer
   */
  addActionPopUpContent(paintZone, parentLayer)
  {
    this.actions.push(new ActionPopUpContent(paintZone, parentLayer));

    this.addAction();
  }

  /**
   * Add a move label action
   * @param {ParentLayer}               parentLayer                   The parent layer
   */
  addActionMoveLabel(parentLayer)
  {
    this.actions.push(new ActionMoveLabel(parentLayer));

    this.addAction();
  }

  /**
   * Add an action, update actions for limit to 10 and update redo actions
   */
  addAction()
  {
    if(this.actions.length > 10)
    {
      this.actions.shift();
    }
    
    this.actionsControl.buttons["undo"].setActiveState(true);

    this.actionsToRedo = [];
    this.actionsControl.buttons["redo"].setActiveState(false);
  }

  /*
   * Undo last actions
   */
  undo()
  {
    if(this.actions.length > 0)
    {
      this.actions[this.actions.length - 1].undo();

      this.actionsToRedo.push(this.actions[this.actions.length - 1]);
      this.actionsControl.buttons["redo"].setActiveState(true);

      this.actions.pop();
    }
  }

  /*
   * Redo last actionsToRedo
   */
  redo()
  {
    if(this.actionsToRedo.length > 0)
    {
      this.actionsToRedo[this.actionsToRedo.length - 1].redo();

      this.actions.push(this.actionsToRedo[this.actionsToRedo.length - 1]);
      this.actionsControl.buttons["undo"].setActiveState(true);

      this.actionsToRedo.pop();
    }
  }

  /*
   * Check if actions array is empty
   */
  actionsIsEmpty()
  {
    if(this.actions.length == 0)
    {
      return true;
    }
    else
    {
      return false;
    }
  }

  /*
   * Check if actionsToRedo array is empty
   */
  actionsRedoIsEmpty()
  {
    if(this.actionsToRedo.length == 0)
    {
      return true;
    }
    else
    {
      return false;
    }
  }
}