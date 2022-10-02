/*
 * The keyboard events manager
 */
class KeyboardEventsManager
{

  /**
   * Init the keyboard events manager
   * @property {LoadSaveManager}      loadSaveManager         The load and save manager
   * @property {ActionsControl}       actionsControl          The action control
   * @property {TimeControl}          timeControl             The time control
   */
  constructor(loadSaveManager, actionsControl, timeControl)
  {
    this.loadSaveManager = loadSaveManager;
    this.actionsControl = actionsControl;
    this.timeControl = timeControl;
  }

  /*
   * Manage events of keyboard
   * @params {Boolean}          editMode             The edit mode (params)
   */
  manageEvents(editMode)
  {
    let me = this;

    document.addEventListener('keydown', (event) => {

      if(editMode) {
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
      }
      else {
        if(event.keyCode == 32) {
          if(me.timeControl.params.scrollTimeEnable) {
            me.timeControl.playOrPause();
          }
        }
      }
    });
  }
}
