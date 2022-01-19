
class ActionLoadGeojson extends Action
{
  /**
   * Action of load a histoatlas json file
   * @param {LoadSaveManager}               loadSaveManager                   The save and load manager
   * @property {Object}                     content                           The content before loading file
   */
  constructor(loadSaveManager)
  {
    super();

    this.loadSaveManager = loadSaveManager;

    this.content = {};
    this.content = this.loadSaveManager.layersManager.toJson(this.content);
  }

  /**
   * Get stored content
   */
  undo()
  {
    let oldContent = {};
    oldContent = this.loadSaveManager.layersManager.toJson(oldContent);

    this.loadSaveManager.initMapFromData(this.content);

    this.content = oldContent;
  }

  /**
   * Get stored content
   */
  redo()
  {
    this.undo();
  }
}