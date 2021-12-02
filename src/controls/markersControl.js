
class MarkersControl
{
  /**
   * Manage UI of markers
   * @property {Params}                  params                  The params 
   * @property {Params}                  paintParams             The paint params 
   * @property {TimeControl}             timeControl             The time control 
   * @property {LayersControl}           layersControl           The layer control
   * @property {ActionsList}             actionsList             The actions list
   */
  constructor(params, paintParams, timeControl, layersControl, actionsList)
  {
    this.params = params;
    this.map = null;
    this.layersManager = null;
    this.paintParams = paintParams;
    this.timeControl = timeControl;
    this.actionsList = actionsList;
    this.layersControl = layersControl;

    this.lineContentDiv = [];

    this.contentDiv = null;

    this.initForm();
  }

  /**
   * Init the form of creation and edition
   */
  initForm()
  {
    let me = this;

    this.iconsList = {
      "banner" : "img/markers/banner.png",
      "battle" : "img/markers/battle.png",
      "crossed-swords" : "img/markers/crossed-swords.png",
      "revolt" : "img/markers/revolt.png",
      "bomb" : "img/markers/bombing-run.svg",
      "anchor-solid" : "img/markers/anchor-solid.svg",
      "book" : "img/markers/book.svg",
      "building" : "img/markers/building-solid.svg",
      "caravel" : "img/markers/caravel.svg",
      "castle" : "img/markers/castle.svg",
      "crown" : "img/markers/crown-solid.svg",
      "marker" : "img/markers/map-marker-solid.svg",
      "scroll" : "img/markers/scroll-unfurled.svg",
      "siege" : "img/markers/siege-tower.svg",
      "skull" : "img/markers/skull-crossbones-solid.svg",
      "users" : "img/markers/users-solid.svg"
    }

    let content = "";

    let first = true;
    for (const prop in this.iconsList)
    {
      if(first)
      {
        content += `<input type="radio" id="dialog-marker-icon-${prop}" name="dialog-marker-icon" value="${prop}" checked /><img src="${this.iconsList[prop]}" width="25px" height="25px" style="margin-right:10px" />`;
        first = false;
      }
      else
      {
        content += `<input type="radio" id="dialog-marker-icon-${prop}" name="dialog-marker-icon" value="${prop}"/><img src="${this.iconsList[prop]}" width="25px" height="25px" style="margin-right:10px" />`;
      }
    }

    content += `<br/><br/><label for="dialog-marker-label">Label : </label><input id="dialog-marker-label" type="text" style="width: 250px;"><br/><br/>
                    <div id="dialog-marker-start-div"><label for="dialog-marker-start">Date de début : </label><input id="dialog-marker-start" type="text" style="width: 200px;"><br/><br/></div>
                    <div id="dialog-marker-end-div"><label for="dialog-marker-end">Date de fin : </label><input id="dialog-marker-end" type="text" style="width: 200px;"><br/><br/></div>
                    <label for="dialog-marker-position-lng">Position : </label><input id="dialog-marker-position-lng" type="text" style="width: 90px;"><input id="dialog-marker-position-lat" type="text" style="width: 90px;margin-left: 3px;"><img id="dialog-marker-position-select" src="img/menu/bullseye-solid.svg"><br/><br/>
                    <label for="dialog-marker-color">Couleur : </label><input id="dialog-marker-color" type="color"><br/><br/>
                    <label for="dialog-marker-size">Taille : </label><input id="dialog-marker-size" type="number" value="30" style="width: 90px;"><br/><br/>
                    <label for="dialog-marker-popup">Pop-up : </label><textarea id="dialog-marker-popup" name="dialog-marker-popup" style="width: 300px;height : 80px;"></textarea>`;

    $("#dialog-marker").html(content);

    $("#dialog-marker-position-select").click(function() 
    {
      me.dialogEdition.dialog( "close" );
      me.paintParams.moveMarker = true;
      me.map.dragging.disable();
    });

    this.dialogEdition = $("#dialog-marker").dialog({
      autoOpen: false,
      height: 550,
      width: 500,
      modal: true,
      buttons: {
        Cancel: function() {
          me.dialogEdition.dialog( "close" );
        },
        OK: function() {
          me.savAddMarker();
          
        }
      },
      close: function() {
        me.dialogEdition.dialog( "close" );
      }
    });
  }

  /**
   * Init the UI content
   * @param {L.DomUtil}                  div                  The layer control div
   * @param {L.Map}                      map                  The map 
   * @param {LayersManager}              layersManager        The layers manager 
   */
  initContent(div, map, layersManager)
  {
    if(this.titleDiv)
    {
      L.DomUtil.remove(this.titleDiv);
      L.DomUtil.remove(this.contentDiv);
      L.DomUtil.remove(this.divAddMarker);
    }

    this.layersManager = layersManager;
    this.map = map;

    this.div = L.DomUtil.create('div', '', div)

    this.titleDiv = L.DomUtil.create('div', 'layers-list-title', this.div);
    let title = L.DomUtil.create('b', '', this.titleDiv);
    title.innerHTML = "Marqueurs :";

    this.contentDiv = L.DomUtil.create('div', '', this.div);

    if(this.params.editMode)
    {
      this.divAddMarker = L.DomUtil.create('div', 'layers-list-line-add-parent-layer', this.div);
      this.divAddMarker.style = `border: 2px solid black`;

      let nameCmp = L.DomUtil.create('p', 'layers-list-text', this.divAddMarker);
      nameCmp.innerHTML = "Ajout d'une marqueur";

      L.DomEvent.on(this.divAddMarker, 'click', function(e) { this.addMarker() } , this);
    }

    this.updateContent();
  }

  /**
   * Update the markers content
   */
  updateContent()
  {
    // Remove content
    for(let i = 0; i < this.lineContentDiv.length; i++)
    {
      L.DomUtil.remove(this.lineContentDiv[i]);
    }

    // Update content
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      let lineDiv = L.DomUtil.create('div', 'layers-marker-line', this.contentDiv);
      lineDiv.innerHTML = this.layersManager.markers[i].label;

      let imageIcon = L.DomUtil.create('img', '', lineDiv);
      imageIcon.src = this.layersManager.markers[i].img;
      imageIcon.style = `width:16px;margin-right:2px;float:left;${this.layersManager.markers[i].icon.options.filter}`;

      if(this.params.editMode)
      {
        let imageEdit = L.DomUtil.create('img', 'layers-list-zone-icon', lineDiv);
        imageEdit.src = "img/menu/edit-solid.svg";
        imageEdit.title = "Editer le marqueur";
        L.DomEvent.on(imageEdit, 'click', function(e) { this.editMarker(this.layersManager.markers[i]); } , this);

        let imageDelete = L.DomUtil.create('img', 'layers-list-zone-icon', lineDiv);
        imageDelete.src = "img/menu/trash-solid.svg";
        imageDelete.title = "Supprimer le marqueur";
        L.DomEvent.on(imageDelete, 'click', function(e) { this.deleteMarker(i); } , this);
      }

      if(this.params.timeEnable)
      {
        lineDiv.title = DateConverter.numberToDate(this.layersManager.markers[i].startDate, this.params)  + " - " + DateConverter.numberToDate(this.layersManager.markers[i].endDate, this.params);
      }

      this.lineContentDiv.push(lineDiv);

      L.DomEvent.on(lineDiv, 'dblclick', function(e) { this.zoomInMarker(this.layersManager.markers[i]); } , this);
    }
  }

  /**
   * Delete the marker
   * @param {Number}                  indexToDelete                  The index of element to delete
   */
  deleteMarker(indexToDelete)
  {
    if(confirm(`Etes-vous sur de vouloir supprimer la marqueur "${this.layersManager.markers[indexToDelete].label}" `))
    {
      this.actionsList.addActionMarker("delete", this.layersManager.markers[indexToDelete], this.layersManager, this.layersControl, this.timeControl, this.map, this.params);

      this.layersManager.markers[indexToDelete].clear();

      this.layersManager.markers.splice(indexToDelete, 1);

      this.updateContent();
    }
  }

  /**
   * Action of add a new marker, display form
   */
  addMarker()
  {
    let me = this;

    $("#dialog-marker").prop("title", "Ajout d'un Marqueur");

    $("#dialog-marker-label").val("");
    $("#dialog-marker-start").val("");
    $("#dialog-marker-end").val("");
    $("#dialog-marker-popup").val("");
    $("#dialog-marker-color").val("#000000");

    $("#dialog-marker-position-lng").val(this.map.getCenter().lng);
    $("#dialog-marker-position-lat").val(this.map.getCenter().lat); 

    if(this.params.timeEnable)
    {
      $("#dialog-marker-start-div").css("display", "inline");
      $("#dialog-marker-end-div").css("display", "inline");
    }
    else
    {
      $("#dialog-marker-start-div").css("display", "none");
      $("#dialog-marker-end-div").css("display", "none");
    }

    this.dialogEdition = $("#dialog-marker").dialog({
      autoOpen: false,
      height: 550,
      width: 500,
      modal: true,
      buttons: {
        Cancel: function() {
          me.dialogEdition.dialog( "close" );
        },
        OK: function() {
          me.savAddMarker();
          
        }
      },
      close: function() {
        me.dialogEdition.dialog( "close" );
      }
    });

    me.dialogEdition.dialog( "open" );
  }

  /**
   * Sav a new marker
   */
  savAddMarker()
  {
    let me = this;

    let label = $("#dialog-marker-label").val();
    if(label.length > 0)
    {
      let startDateStr = $("#dialog-marker-start").val();
      let endDateStr = $("#dialog-marker-end").val();
      let popUpContent = $("#dialog-marker-popup").val();
      let position = [$("#dialog-marker-position-lat").val(), $("#dialog-marker-position-lng").val()];
      let color = $("#dialog-marker-color").val();
      let size = $("#dialog-marker-size").val();
      let img = "";
      let imgKey = "";
      $('input[name="dialog-marker-icon"]').each(function() {
        if(this.checked)
        {
          img = me.iconsList[this.value];
          imgKey = this.value;
        }
      });

      let startDate = this.getDate(startDateStr, false);
      let endDate = this.getDate(endDateStr, true);

      let numberMaker = 1;
      for(let i = 0; i < this.layersManager.markers.length; i++)
      {
        if(this.layersManager.markers[i].number >= numberMaker)
        {
          numberMaker = this.layersManager.markers[i].number + 1;
        }
      }

      this.layersManager.markers.push(new Marker(this.paintParams, numberMaker, label, startDate, endDate, popUpContent, position, img, imgKey, color, size));

      this.layersManager.markers[this.layersManager.markers.length - 1].updateVisibilityFromTime(this.timeControl.value, this.map, this.params);

      this.updateContent();

      this.dialogEdition.dialog("close");

      this.actionsList.addActionMarker("add", this.layersManager.markers[this.layersManager.markers.length - 1], this.layersManager, this.layersControl, this.timeControl, this.map, this.params);
    }
    else
    {
      alert("Votre marqueur doit obligatoirement posséder un label");
    }
  }

  /**
   * Transform a date string to date value
   * @param {String}                  dateStr                  The date string
   * @param {Boolean}                 isEndDate                True if is end date
   * @return {Number}                                          The date number
   */
  getDate(dateStr, isEndDate)
  { 
    let date = 0;

    if(!dateStr)
    {
      if(isEndDate)
      {
        dateStr = this.params.timeMax;
      }
      else
      {
        dateStr = this.params.timeMin;
      }
    }

    if(DateConverter.checkDateValid(dateStr))
    {
      date = DateConverter.dateToNumber(dateStr, isEndDate, this.params);
    }
    else
    {
      if(isEndDate)
      {
        alert("La date de fin n'est pas valide");
        date = DateConverter.dateToNumber(this.params.timeMax, isEndDate, this.params);
      }
      else
      {
        alert("La date de début n'est pas valide")
        date = DateConverter.dateToNumber(this.params.timeMin, isEndDate, this.params);
      }
    }

    return date;
  }

  /**
   * Action of edit a marker, display form
   * @params {Marker}                  marker                  The marker to edit
   */
  editMarker(marker)
  {
    let me = this;

    $("#dialog-marker").prop("title", "Ajout d'un Marqueur");

    $("#dialog-marker-label").val(marker.label);
    $("#dialog-marker-start").val(DateConverter.numberToDate(marker.startDate, this.params));
    $("#dialog-marker-end").val(DateConverter.numberToDate(marker.endDate, this.params));
    $("#dialog-marker-popup").val(marker.popUpContent);
    $("#dialog-marker-color").val(marker.color);
    $("#dialog-marker-size").val(marker.size);

    $('#dialog-marker-icon-' + marker.imgKey).prop("checked", true);

    $("#dialog-marker-position-lng").val(marker.position[1]);
    $("#dialog-marker-position-lat").val(marker.position[0]);  

    this.dialogEdition = $("#dialog-marker").dialog({
      autoOpen: false,
      height: 550,
      width: 500,
      modal: true,
      buttons: {
        Cancel: function() {
          me.dialogEdition.dialog( "close" );
        },
        OK: function() {
          me.savEditMarker(marker);
        }
      },
      close: function() {
        me.dialogEdition.dialog( "close" );
      }
    });

    me.dialogEdition.dialog( "open" );
  }

  /**
   * Sav a edition of marker
   * @params {Marker}                  marker                  The marker to edit
   */
  savEditMarker(marker)
  {
    let me = this;

    let label = $("#dialog-marker-label").val();
    if(label.length > 0)
    {
      this.actionsList.addActionMarker("edit", marker, this.layersManager, this.layersControl, this.timeControl, this.map, this.params);

      let startDateStr = $("#dialog-marker-start").val();
      let endDateStr = $("#dialog-marker-end").val();
      let popUpContent = $("#dialog-marker-popup").val();
      let position = [$("#dialog-marker-position-lat").val(), $("#dialog-marker-position-lng").val()];
      let color = $("#dialog-marker-color").val();
      let size = $("#dialog-marker-size").val();
      let img = "";
      let imgKey = "";
      $('input[name="dialog-marker-icon"]').each(function() {
        if(this.checked)
        {
          img = me.iconsList[this.value];
          imgKey = this.value;
        }
      });

      let startDate = this.getDate(startDateStr, false);
      let endDate = this.getDate(endDateStr, true);

      marker.edit(label, startDate, endDate, popUpContent, position, img, imgKey, color, size);

      marker.clear();

      marker.updateVisibilityFromTime(this.timeControl.value, this.map, this.params);

      this.updateContent();

      this.dialogEdition.dialog("close");
    }
    else
    {
      alert("Votre marqueur doit obligatoirement posséder un label");
    }
  }

  /**
   * Set the position
   * @param {Event}               e                    The event with position value
   */
  setPosition(e)
  {
    this.dialogEdition.dialog("open");

    $("#dialog-marker-position-lng").val(e.latlng.lng);
    $("#dialog-marker-position-lat").val(e.latlng.lat);  
  }

  /**
   * Zoom to the selected marker
   * @params {Marker}                  marker                  The target marker
   */
  zoomInMarker(marker)
  {
    this.map.setView(new L.LatLng(marker.position[0], marker.position[1]));

    if(this.layersControl.timeControl.value <= marker.startDate || this.layersControl.timeControl.value >= marker.endDate)
    {
      this.layersControl.timeControl.setValue(marker.startDate);
    }
  }
}