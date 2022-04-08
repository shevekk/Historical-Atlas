/*
 * The keyboard events manager
 */
class KeyboardEventsManager
{

  /**
   * Init the keyboard events manager
   * @property {LoadSaveManager}      loadSaveManager         The load and save manager
   * @property {ActionsControl}       actionsControl          The action control
   */
  constructor(loadSaveManager, actionsControl) 
  {
    this.loadSaveManager = loadSaveManager;
    this.actionsControl = actionsControl;
  }

  /*
   * Manage events of keyboard
   */
  manageEvents()
  {
    let me = this;

    document.addEventListener('keydown', (event) => {

      if (event.ctrlKey) {

        // Save
        if(event.key == "s")
        {
          event.preventDefault();

          let name = $("#input-sav-file-name").val();

          if(name != "")
          {
            me.loadSaveManager.save(name);
          }
        }
        // Undo / Redo
        if(event.key == "z")
        {
          me.actionsControl.undo();
        }
        if(event.key == "y")
        {
          me.actionsControl.redo();
        }

        // Copy / Paste
        if(event.key == "c")
        {
          me.actionsControl.copyZone();
        }
        else if(event.key == "v")
        {
          me.actionsControl.pasteZone();
        }
      }
    });
  }
}