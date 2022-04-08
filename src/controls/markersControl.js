
class MarkersControl
{
  /**
   * Manage UI of markers
   * @property {Params}                  params                  The params 
   * @property {Params}                  paintParams             The paint params 
   * @property {TimeControl}             timeControl             The time control 
   * @property {LayersControl}           layersControl           The layer control
   * @property {ActionsList}             actionsList             The actions list
   * @property {Number}                  selectedNumber          The number of the selected marker
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
    this.selectedNumber = -1;

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
      "siege" : "img/markers/siege-tower.png",
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

    /*
    content += `<div id="dialog-marker-perso-icons-div"></div>`;

    if(localStorage.getItem('session-id-histoatlas'))
    {
      Utils.callServer("iconMarker/get/" + localStorage.getItem('session-id-histoatlas'), "GET", {}).then((result) => 
      {
        console.log(result);

        let iconsMarkersPerso = result.iconsMarkers;

        let content = "";
        for(let i = 0; i < iconsMarkersPerso.length; i++)
        {
          $("#dialog-marker-perso-icons-div").append(`<input type="radio" id="dialog-marker-perso-icon-${iconsMarkersPerso[i]['id']}" name="dialog-marker-icon" value="${iconsMarkersPerso[i]['id']}"/><img src="${iconsMarkersPerso[i]['url']}" id="dialog-marker-perso-icon-${iconsMarkersPerso[i]['id']}-img" width="25px" height="25px" style="margin-right:10px" />`);

          Utils.callServer("iconMarker/getImage/" + iconsMarkersPerso[i]['id'], "GET", {}).then((resultImg) => 
          {
            $(`#dialog-marker-perso-icon-${iconsMarkersPerso[i]['id']}-img`).prop("src", resultImg);
          });
        }
      });
    }
    
    content += `<br/><button id='dialog-marker-add-icon'>${Dictionary.get("MAP_MARKERS_ADD_ICON")}</button><div id="dialog-marker-load-icon-div"></div>`;
    */

    content += `<br/><br/><label for="dialog-marker-label">${Dictionary.get("MAP_MARKERS_LABEL")}</label><input id="dialog-marker-label" type="text" style="width: 320px;"><br/><br/>
                    <div id="dialog-marker-start-div"><label for="dialog-marker-start">${Dictionary.get("MAP_MARKERS_START_DATE")}</label><input id="dialog-marker-start" type="text" style="width: 200px;"><br/><br/></div>
                    <div id="dialog-marker-end-div"><label for="dialog-marker-end">${Dictionary.get("MAP_MARKERS_END_DATE")}</label><input id="dialog-marker-end" type="text" style="width: 200px;"><br/><br/></div>
                    <label for="dialog-marker-position-lng">${Dictionary.get("MAP_MARKERS_POSITION")}</label><input id="dialog-marker-position-lng" type="text" style="width: 120px;"><input id="dialog-marker-position-lat" type="text" style="width: 120px;margin-left: 3px;"><img id="dialog-marker-position-select" src="img/menu/bullseye-solid.svg"><br/><br/>
                    <label for="dialog-marker-color">${Dictionary.get("MAP_MARKERS_COLOR")}</label><input id="dialog-marker-color" type="color"><br/><br/>
                    <label for="dialog-marker-size">${Dictionary.get("MAP_MARKERS_SIZE")}</label><input id="dialog-marker-size" type="number" value="30" style="width: 90px;"><br/><br/>
                    <label for="dialog-marker-popup">${Dictionary.get("MAP_MARKERS_POPUP")}</label><br/><textarea id="dialog-marker-popup" name="dialog-marker-popup" style="width: 700px;height: 160px;"></textarea>`;

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
      width: 660,
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

    /*
    $("#dialog-marker-add-icon").click(function()
    {
      $("#dialog-marker-add-icon").css("display", "none");
      $("#dialog-marker-load-icon-div").html(`<input id="dialog-marker-load-icon-input" type="file" accept="image/*" />`);

      var fileInput = document.getElementById("dialog-marker-load-icon-input"),
      readFile = function () {
        var reader = new FileReader();
        reader.fileName = document.getElementById("dialog-marker-load-icon-input").files[0];
        reader.onload = function (readerEvt) 
        {
          let content = {fileName : reader.fileName.name, fileContent : reader.result, user : localStorage.getItem('session-id-histoatlas')};
        
          Utils.callServer("iconMarker/add", "POST", content).then((result) => {

          });
        }

        reader.readAsText(fileInput.files[0]);
        $("#dialog-marker-load-icon-input")[0].value = "";
      }
      fileInput.addEventListener('change', readFile);
    });
    */
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
    this.title = L.DomUtil.create('b', '', this.titleDiv);
    this.title.innerHTML = Dictionary.get("MAP_MARKERS_TITLE");

    this.contentDiv = L.DomUtil.create('div', '', this.div);

    if(this.params.editMode)
    {
      this.divAddMarker = L.DomUtil.create('div', 'layers-list-line-add-parent-layer', this.div);
      this.divAddMarker.style = `border: 2px solid black`;

      this.nameAddCmp = L.DomUtil.create('p', 'layers-list-text', this.divAddMarker);
      this.nameAddCmp.innerHTML = Dictionary.get("MAP_MARKERS_ADD");

      L.DomEvent.on(this.divAddMarker, 'click', function(e) { this.addMarker() } , this);
    }

    // Event of select a marker in a map
    let me = this;
    document.addEventListener('selectMakerInMap', function (e) 
    {
      let number = e.detail.markerNumber;

      if(me.selectedNumber >= 0)
      {
        $(`#layers-marker-select-${me.selectedNumber}`).css("background-color", "#ffffff");
      }
      me.selectedNumber = number;
      $(`#layers-marker-select-${number}`).css("background-color", "#c7e0f0");
    });

    this.updateContent();
  }

  /*
   * Redraw for lang change
   */
  redraw()
  {
    this.initForm();
    this.updateContent();

    this.title.innerHTML = Dictionary.get("MAP_MARKERS_TITLE");

    if(this.params.editMode)
    {
      this.nameAddCmp.innerHTML = Dictionary.get("MAP_MARKERS_ADD");
    }
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

    this.contentDiv.innerHTML = "";

    // Add buton for add markers
    if(this.layersManager.markers.length >= 2 && this.params.timeEnable)
    {
      this.reorderButton = L.DomUtil.create('button', '', this.contentDiv);
      this.reorderButton.innerHTML = Dictionary.get("MAP_MARKERS_REORDER_BY_DATE");
      this.reorderButton.style = "display: block; position: relative; margin-left: auto; margin-right: auto;";

      L.DomEvent.on(this.reorderButton, 'click', function(e) { this.layersManager.markers.sort((a, b) => a.startDate - b.startDate); this.updateContent() } , this);
    }

    // Update content
    for(let i = 0; i < this.layersManager.markers.length; i++)
    {
      let lineDiv = L.DomUtil.create('div', 'layers-marker-line', this.contentDiv);
      //lineDiv.innerHTML = this.layersManager.markers[i].label;

      let selectDiv = L.DomUtil.create('div', 'layers-marker-select', lineDiv);
      selectDiv.id = 'layers-marker-select-' + this.layersManager.markers[i].number;
      //selectDiv.innerHTML = this.layersManager.markers[i].label;

      let imageIcon = L.DomUtil.create('img', '', selectDiv);
      imageIcon.src = this.layersManager.markers[i].img;
      imageIcon.style = `width:16px;margin-right:2px;float:left;${this.layersManager.markers[i].icon.options.filter}`;

      let nameCmp = L.DomUtil.create('p', 'layers-list-text', selectDiv);
      if(this.layersManager.markers[i].label.length > 35)
      {
        nameCmp.innerHTML = this.layersManager.markers[i].label.slice(0,33) + "...";
      }
      else
      {
        nameCmp.innerHTML = this.layersManager.markers[i].label;
      }
      
      if(this.params.editMode)
      {
        let imageEdit = L.DomUtil.create('img', 'layers-list-zone-icon', lineDiv);
        imageEdit.src = "img/menu/edit-solid.svg";
        imageEdit.title = Dictionary.get("MAP_MARKERS_EDIT");
        L.DomEvent.on(imageEdit, 'click', function(e) { this.editMarker(this.layersManager.markers[i]); } , this);

        let imageDelete = L.DomUtil.create('img', 'layers-list-zone-icon', lineDiv);
        imageDelete.src = "img/menu/trash-solid.svg";
        imageDelete.title = Dictionary.get("MAP_MARKER_DELETE");
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
    if(confirm(`${Dictionary.get("MAP_MARKER_DELETE_VALIDATION")} "${this.layersManager.markers[indexToDelete].label}" `))
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

    $("#dialog-marker").prop("title", Dictionary.get("MAP_MARKERS_ADD_WINDOW_TITLE"));

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
      height: 640,
      width: 740,
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
      let popUpContent = $("#dialog-marker-popup").val().replaceAll("\n", "<br/>\n");
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
      alert(Dictionary.get("MAP_MARKER_LABEL_REQUIRED"));
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
        alert(Dictionary.get("MAP_MARKER_END_DATE_INVALID"));
      }
      else
      {
        alert(Dictionary.get("MAP_MARKER_START_DATE_INVALID"))
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

    $("#dialog-marker").prop("title", Dictionary.get("MAP_MARKERS_EDIT_WINDOW_TITLE"));

    $("#dialog-marker-label").val(marker.label);
    $("#dialog-marker-start").val(DateConverter.numberToDate(marker.startDate, this.params));
    $("#dialog-marker-end").val(DateConverter.numberToDate(marker.endDate, this.params));
    $("#dialog-marker-popup").val(marker.popUpContent.replaceAll("<br/>\n", "\n"));
    $("#dialog-marker-color").val(marker.color);
    $("#dialog-marker-size").val(marker.size);

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

    $('#dialog-marker-icon-' + marker.imgKey).prop("checked", true);

    $("#dialog-marker-position-lng").val(marker.position[1]);
    $("#dialog-marker-position-lat").val(marker.position[0]);  

    this.dialogEdition = $("#dialog-marker").dialog({
      autoOpen: false,
      height: 640,
      width: 740,
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
      let popUpContent = $("#dialog-marker-popup").val().replaceAll("\n", "<br/>\n");
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
      alert(Dictionary.get("MAP_MARKER_LABEL_REQUIRED"));
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

    marker.marker.openPopup(); 
    if(this.selectedNumber >= 0)
    {
      $(`#layers-marker-select-${this.selectedNumber}`).css("background-color", "#ffffff");
    }
    this.selectedNumber = marker.number;
    $(`#layers-marker-select-${marker.number}`).css("background-color", "#c7e0f0");
  }
}