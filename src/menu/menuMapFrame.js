/**
 * Class for map frame
 */
class MenuMapFrame
{
  /**
   * Init the map frame
   * @param {Object}           map                    Map data
   * @param {String}           idHtmlParent           The html id of the element
   * @param {Number}           number                 The number of the element
   * @param {Boolean}          isUserMap              True if is user map
   */
    constructor(map, idHtmlParent, number, isUserMap) {
        if(isUserMap) {
            this.displayUserMap(map, idHtmlParent, number, false);
        }
        else {
            this.displayMap(map, idHtmlParent);
        }
    }

    /**
     * Display maps (public or feactured)
     * @param {Object}           map                    Map data
     * @param {String}           idHtmlParent           The html id of the element
     */
    displayMap(map, idHtmlParent) {
        let me = this;

        let content = "<div class='map-frame'>";
        let categoryText = Dictionary.get('MAP_TYPE_' + map.category.toUpperCase());

        content += `<p>[${map.lang.toUpperCase()}][${categoryText}] <b>${map.name}</b></p>
        <p><i>${Dictionary.get('INDEX_MAP_CREATOR')} <b>${map.userName}</b></i></p>
        <p><a href="histoAtlas.html?mapId=${map.id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>
        <a href="histoAtlasMapbox.html?mapId=${map.id}"><img class="icon-action" src="img/menu/earth-africa-europe.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>`;

        content += `<a href="histoAtlas.html?mapId=${map.id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="${Dictionary.get('INDEX_MAP_EDIT_COPY')}" /></a>`;

        content += `<a><img class="iframe-publicmap" id="iframe-publicmap_${map.id}" src="img/menu/iframe.png" title="${Dictionary.get('INDEX_MAP_EXPORT_MAP')}" /></a>`;
        
        content += `</p></div>`;

        $("#" + idHtmlParent).append(content);

        // Manage iframe
        $(`#iframe-publicmap_${map.id}`).click(function() 
        {
            me.copyIFrame(map.id);
        });
    }

    /**
     * Display user maps
     * @param {Object}           map                    Map data
     * @param {String}           idHtmlParent           The html id of the element
     * @param {Number}           number                 The number of the element
     * @param {Boolean}          update                 True if update (is false for creation)
     */
    displayUserMap(map, idHtmlParent, number, update) {

        let me = this;

        // Create div (map-frame)
        if(!update) {
            let content = `<div class='map-frame' id='map-frame-user_${number}'></div>`;
            $("#" + idHtmlParent).append(content);
        }

        // Create content
        let content = "";
        let categoryText = Dictionary.get('MAP_TYPE_' + map.category.toUpperCase());

        content += `<p>[${map.lang.toUpperCase()}][${categoryText}] <b>${map.name}</b></p>
        <p><i>${Dictionary.get('INDEX_MAP_CREATOR')} <b>${localStorage.getItem('session-id-histoatlas')}</b></i></p>
        <p><a href="histoAtlas.html?mapId=${map.id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>
        <a href="histoAtlasMapbox.html?mapId=${map.id}"><img class="icon-action" src="img/menu/earth-africa-europe.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>`;

        content += `<a href="histoAtlas.html?mapId=${map.id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="${Dictionary.get('INDEX_MAP_EDIT_COPY')}" /></a>`;
        
        content += `</p>`;

        // Admin icons
        content += `<div id="edit-visibility-div">`;
        if(map.public) {
          content += `<img class="icon-action-public" id="change-public-state_${number}" src="img/menu/eye-solid-green.svg" title="${Dictionary.get('INDEX_MAP_VIEW_AVAILABLE')}" />`;

          if(map.publicEditable) {
            content += `<img class="icon-action-editable" id="change-editable-state_${number}" src="img/menu/edit-solid-green.svg" title="${Dictionary.get('INDEX_MAP_EDIT_AVAILABLE')}" />`;
          }
          else {
            content += `<img class="icon-action-editable" id="change-editable-state_${number}" src="img/menu/edit-solid-red.svg" title="${Dictionary.get('INDEX_MAP_EDIT_UNAVAILABLE')}" />`;
          }
        }
        else {
          content += `<img class="icon-action-public" id="change-public-state_${number}" src="img/menu/eye-solid-red.svg" title="${Dictionary.get('INDEX_MAP_VIEW_UNAVAILABLE')}" />`;
        }
        content += `</div>`;

        content += `<img class="icon-action-rename" id="rename_${number}" src="img/menu/rename.png" title="${Dictionary.get('INDEX_MAP_RENAME')}" />`;
        content += `<img class="icon-action-delete" id="delete_${number}" src="img/menu/trash-solid.svg" title="${Dictionary.get('INDEX_MAP_DELETE')}" />`;
        if(map.public)
        {
          content += `<a><img class="iframe-usermap" id="iframe-usermap_${map.id}" src="img/menu/iframe.png" title="${Dictionary.get('INDEX_MAP_EXPORT_MAP')}" /></a>`;
        }

        $(`#map-frame-user_${number}`).html(content);

        // Manage rename action
        $(`#rename_${number}`).click(function() 
        {
            let content = `<input id="map-rename-input_${map.id}" style="width:200px; margin-left: 5px" value="${map.name}"></input>
                           <button id="map-rename-save_${map.id}">${Dictionary.get("INDEX_MAP_RENAME_SAVE")}</button>
                           <button id="map-rename-cancel_${map.id}">${Dictionary.get("INDEX_MAP_RENAME_CANCEL")}</button>`;

            //$(`#map-div_${number}`).html(content);
            $(`#map-frame-user_${number}`).html(content);

            // Cancel rename
            $(`#map-rename-cancel_${map.id}`).click(function()
            {
              //$(`#map-div_${number}`).html(initMapDivContent(map, number));
              me.displayUserMap(map, idHtmlParent, number, true);
            });

            // Save new name ofr the file
            $(`#map-rename-save_${map.id}`).click(function()
            {
              let mapNewName = $(`#map-rename-input_${map.id}`).val();

              var nameRegex = /^[a-zA-Z0-9\s]+$/;
              if(!nameRegex.test(mapNewName))
              {
                toastr.error(Dictionary.get("MAP_SAVEANDLOAD_SAVE_FILENAME_INVALID"), '');
                return;
              }
              let fileName = mapNewName.replaceAll(" ", "_");

              Utils.callServer("map/rename", "POST", {user : localStorage.getItem('session-id-histoatlas'), id : map.id, newName : mapNewName, fileName : fileName}).then((result) => 
              {
                //document.location.href="index.html";
                map.name = mapNewName;
                me.displayUserMap(map, idHtmlParent, number, true);
              }).catch((err) => { 
                if(err.responseJSON) {
                    toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('INDEX_RENAME_UNABLE'));
                }
                else {
                    toastr.error("", Dictionary.get('INDEX_RENAME_UNABLE'));
                }
              });
            });
        });

        // Change public state
        $(`#change-public-state_${number}`).click(function() 
        {
            Utils.callServer("map/changePublicState", "POST", {user : localStorage.getItem('session-id-histoatlas'), id : map.id, public : !map.public}).then((response) => 
            {
              map.public = !map.public;
              me.displayUserMap(map, idHtmlParent, number, true)
            }).catch((err) => { 
                if(err.responseJSON) {
                    toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('INDEX_CHANGE_VISIBILITY_UNABLE'));
                }
                else {
                    toastr.error("", Dictionary.get('INDEX_CHANGE_VISIBILITY_UNABLE'));
                }
            });
        });

        // Change editable state
        $(`#change-editable-state_${number}`).click(function() 
        {
            Utils.callServer("map/changeEditableState", "POST", {user : localStorage.getItem('session-id-histoatlas'), id : map.id, public_editable : !map.publicEditable}).then((result) => 
            {
              map.publicEditable = !map.publicEditable;
              me.displayUserMap(map, idHtmlParent, number, true)
            }).catch((err) => { 
                if(err.responseJSON) {
                    toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('INDEX_CHANGE_VISIBILITY_UNABLE'));
                }
                else {
                    toastr.error("", Dictionary.get('INDEX_CHANGE_VISIBILITY_UNABLE'));
                }
            });
        });

        // Delete map management
        $(`#delete_${number}`).click(function() 
        {
            let mapName = map.name;

            if (window.confirm(`${Dictionary.get("INDEX_MAP_DELETE_CONFIRM")} "${mapName}" ?`))
            {
              Utils.callServer("map/", "DELETE", {user : localStorage.getItem('session-id-histoatlas'), id : map.id}).then((result) => 
              {
                document.location.href="index.html";
              }).catch((err) => { 
                if(err.responseJSON) {
                    toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('INDEX_DELETE_UNABLE'));
                }
                else {
                    toastr.error("", Dictionary.get('INDEX_DELETE_UNABLE'));
                }
              });
            }
        });

        // Manage iframe
        $(`#iframe-usermap_${map.id}`).click(function() 
        {
            me.copyIFrame(map.id);
        });
    }

    /**
     * Copy in IFrame 
     * @param {Number}           number                 The number of the element
     */
    copyIFrame(number) {
        let urlArray = window.location.href.split("/");
        urlArray.pop();
        const websiteUrl = urlArray.join("/");
        let urlIFrame = `<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?mapId=${number}&edit=false&defaultFullScreen=true&lang=${Dictionary.lang}"> </iframe>`;
        navigator.clipboard.writeText(urlIFrame);

        toastr.success("", Dictionary.get("INDEX_MAP_COPY_IFRAME"));
    }
}