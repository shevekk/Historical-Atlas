
class ActionMarker extends Action
{
  /**
   * Action of add, delete and remove a marker
   * @param {String}                    type                          The action type (add, delete, edit)
   * @param {Marker}                    marker                        The marker object
   * @param {LayersManager}             layersManager                 The layer manager
   * @param {LayersControl}             layersControl                 The layer control
   * @param {TimeControl}               timeControl                   The time control
   * @param {L.Map}                     map                           The map
   * @param {Params}                    params                        The params
   */
  constructor(type, marker, layersManager, layersControl, timeControl, map, params)
  {
    super();

    this.type = type;
    this.marker = marker;
    this.layersManager = layersManager;
    this.layersControl = layersControl;
    this.timeControl = timeControl;
    this.map = map;
    this.params = params;

    if(this.type == "edit")
    {
      this.marker = Object.assign(Object.create(Object.getPrototypeOf(marker)), marker);
    }
  }

  /**
   * Undo action
   */
  undo()
  {
    if(this.type == "add")
    {
      this.delete();
    }
    else if(this.type == "delete")
    {
      this.add();
    }
    else if(this.type == "edit")
    {
      this.edit();
    }
  }

  /**
   * Redo action
   */
  redo()
  {
    if(this.type == "add")
    {
      this.add();
    }
    else if(this.type == "delete")
    {
      this.delete();
    }
    else if(this.type == "edit")
    {
      this.edit();
    }
  }

  /**
   * Edit a marker
   */
  edit()
  {
    let keyMaker = 0;
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      if(this.marker.number == this.layersManager.markers[i].number)
      {
        keyMaker = i;
      }
    }

    this.layersManager.markers[keyMaker].clear();

    let oldMarker = Object.assign(Object.create(Object.getPrototypeOf(this.layersManager.markers[keyMaker])), this.layersManager.markers[keyMaker]);

    this.marker.visible = false;
    this.layersManager.markers[keyMaker] = this.marker;
    this.marker.updateVisibilityFromTime(this.timeControl.value, this.map, this.params);
    this.layersControl.updateLayersContent(this.layersManager);

    this.marker = oldMarker;
  }

  /**
   * Delete a marker
   */
  delete()
  {
    this.marker.clear();

    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      if(this.marker == this.layersManager.markers[i])
      {
        this.layersManager.markers.splice(i, 1);
      }
    }

    this.layersControl.updateLayersContent(this.layersManager);
  }

  /**
   * Add a marker
   */
  add()
  {
    this.layersManager.markers.push(this.marker);

    this.marker.updateVisibilityFromTime(this.timeControl.value, this.map, this.params);

    this.layersControl.updateLayersContent(this.layersManager);
  }
}