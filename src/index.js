 
/* Load maps file and display all */
let lang = "en";

if(Config.getCookie("lang"))
{
  lang = Config.getCookie("lang");
}
let params = Config.getUrlParams();
if(params["lang"])
{
  lang = params["lang"];
}

// If HTTPS -> reload to http
if(window.location.protocol == "https:")
{
  location.href = "http://" + window.location.host + window.location.pathname + window.location.search
}

Config.load().then((config) =>
{
  Dictionary.load(lang, "", function()
  {
    Menu.init(lang);

    let urlArray = window.location.href.split("/");
    urlArray.pop();
    const websiteUrl = urlArray.join("/");

    /* Check if user is connected */
    if(localStorage.getItem('session-id-histoatlas'))
    {
      let urlServer = config.serverUrl + "/api/user/checkValidUser";
      $.ajax({
        url: urlServer,
        method: "GET",
        contentType: "application/json",
        headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') },
        success: (response) => {

          let user = localStorage.getItem('session-id-histoatlas');
          getUserMap(user);
          getServerMaps(user);
          displayUser(user);
        },
        error: (err) => {
          localStorage.removeItem('session-id-histoatlas');
          localStorage.removeItem('session-token-histoatlas');
          
          getServerMaps(null);
        }
      });
    }
    else
    {
      getServerMaps(null);
    }

    /* 
     * Get all visible maps for user on server (all if not connected)
     * @property {String}                      user                       The user name
     */
    function getServerMaps(user)
    {
      $.ajax({
        url: config.serverUrl + "/api/map/getVisibleMaps/" + user,
        method: "GET",
        contentType: "application/json",
        success: (response) => 
        {
          let publicMaps = [];
          for(let i = 0; i < response.publicMaps.length; i++)
          {
            publicMaps.push(new MapData());
            publicMaps[i].fromJson(response.publicMaps[i]);
          }
          displayPublicMap(publicMaps);
        },
        error: (err) => {
          alert(Dictionary.get('MENU_MAP_RECOVER_FAIL') + Dictionary.get(err.responseJSON.error));
        }})
    }

    /* 
     * Get users map on server 
     * @property {String}                      user                       The user name
     */
    function getUserMap(user)
    {
      $.ajax({
        url: config.serverUrl + "/api/map/getVisibleMapsOfUser/" + user,
        method: "GET",
        contentType: "application/json",
        success: (response) => 
        {
          let userMaps = [];
          for(let i = 0; i < response.userMaps.length; i++)
          {
            userMaps.push(new MapData());
            userMaps[i].fromJson(response.userMaps[i]);
          }
          displayUserMap(userMaps);
        },
        error: (err) => {
          alert(Dictionary.get('MENU_MAP_RECOVER_FAIL') + Dictionary.get(err.responseJSON.error));
        }
      });
    }

    /* 
     * Display maps of user with visibility editions button
     * @property {MapData[]}                      userMaps                       The users maps data
     */
    function displayUserMap(userMaps)
    {
      let content = "";

      function initMapDivContent(userMap, num)
      {
        let content = `<div class="map-div" id="map-div_${num}">${userMap.name}
        <a href="histoAtlas.html?mapId=${userMap.id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>
        <a href="histoAtlas.html?mapId=${userMap.id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="${Dictionary.get('INDEX_MAP_EDIT')}" /></a></div>`;

        return content;
      }

      for(let i = 0; i < userMaps.length; i++)
      {
        content += "<p>";

        content += initMapDivContent(userMaps[i], i);

        content += `<div id="edit-visibility-div">`;
        if(userMaps[i].public)
        {
          content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/menu/eye-solid-green.svg" title="${Dictionary.get('INDEX_MAP_VIEW_AVAILABLE')}" />`;

          if(userMaps[i].publicEditable)
          {
            content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/menu/edit-solid-green.svg" title="${Dictionary.get('INDEX_MAP_EDIT_AVAILABLE')}" />`;
          }
          else
          {
            content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/menu/edit-solid-red.svg" title="${Dictionary.get('INDEX_MAP_EDIT_UNAVAILABLE')}" />`;
          }
        }
        else
        {
          content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/menu/eye-solid-red.svg" title="${Dictionary.get('INDEX_MAP_VIEW_UNAVAILABLE')}" />`;
        }

        content += `</div>`;

        content += `<img class="icon-action-rename" id="rename_${i}" src="img/menu/rename.png" title="${Dictionary.get('INDEX_MAP_RENAME')}" />`;

        content += `<img class="icon-action-delete" id="delete_${i}" src="img/menu/trash-solid.svg" title="${Dictionary.get('INDEX_MAP_DELETE')}" />`;

        if(userMaps[i].public)
        {
          content += `<a><img class="iframe-usermap" id="iframeContent_${userMaps[i].id}" src="img/menu/iframe.png" title="${Dictionary.get('INDEX_MAP_EXPORT_MAP')}" /></a>
          <input id="iframeContent-${userMaps[i].id}" style="display:none; width:1150px; margin-left: 5px"></input>`;
        }

        content += `</p>`;
      }

      $("#user-maps").html(content);

      // Manage rename action
      $(".icon-action-rename").click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);

        let content = `<input id="map-rename-input_${userMaps[mapNumber].id}" style="width:200px; margin-left: 5px" value="${userMaps[mapNumber].name}"></input>
                       <button id="map-rename-save_${userMaps[mapNumber].id}">${Dictionary.get("INDEX_MAP_RENAME_SAVE")}</button>
                       <button id="map-rename-cancel_${userMaps[mapNumber].id}">${Dictionary.get("INDEX_MAP_RENAME_CANCEL")}</button>`;

        $(`#map-div_${mapNumber}`).html(content);

        // Cancel rename
        $(`#map-rename-cancel_${userMaps[mapNumber].id}`).click(function()
        {
          $(`#map-div_${mapNumber}`).html(initMapDivContent(userMaps[mapNumber], mapNumber));
        });

        // Save new name ofr the file
        $(`#map-rename-save_${userMaps[mapNumber].id}`).click(function()
        {
          let mapNewName = $(`#map-rename-input_${userMaps[mapNumber].id}`).val();

          var nameRegex = /^[a-zA-Z0-9\s]+$/;
          if(!nameRegex.test(mapNewName))
          {
            alert(Dictionary.get("MAP_SAVEANDLOAD_SAVE_FILENAME_INVALID"));
            return;
          }
          let fileName = mapNewName.replaceAll(" ", "_");

          let urlServer = config.serverUrl + "/api/map/rename";
          $.ajax({
            url: urlServer,
            method: "POST",
            contentType: "application/json",
            headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
            data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id, newName : mapNewName, fileName : fileName}),
            success: (response) => {
              document.location.href="index.html";
            },
            error: (err) => {
              alert(`${Dictionary.get(err.responseJSON.error)}`);
            }
          });
        });
      });

      // Change public state
      $(".icon-action-public").click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);

        let urlServer = config.serverUrl + "/api/map/changePublicState";
        $.ajax({
          url: urlServer,
          method: "POST",
          contentType: "application/json",
          headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
          data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id, public : !userMaps[mapNumber].public}),
          success: (response) => {
            userMaps[mapNumber].public = !userMaps[mapNumber].public;
            displayUserMap(userMaps);
          },
          error: (err) => {
            alert(`${Dictionary.get(INDEX_LOGIN_UNABLE)} ${Dictionary.get(err.responseJSON.error)}`);
          }
        });
      });

      // Change editable state
      $(".icon-action-editable").click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);

        let urlServer = config.serverUrl + "/api/map/changeEditableState";
        $.ajax({
          url: urlServer,
          method: "POST",
          contentType: "application/json",
          headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
          data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id, public_editable : !userMaps[mapNumber].publicEditable}),
          success: (response) => {
            userMaps[mapNumber].publicEditable = !userMaps[mapNumber].publicEditable;
            displayUserMap(userMaps);
          },
          error: (err) => {
            alert(`${Dictionary.get(INDEX_LOGIN_UNABLE)} ${Dictionary.get(err.responseJSON.error)}`);
          }
        });
      });

      // Delete map management
      $(".icon-action-delete").click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);
        let mapName = userMaps[mapNumber].name;

        if (window.confirm(`Etes vous sur de vouloir supprimer la carte "${mapName}" ?`))
        {
          $.ajax({
          url: config.serverUrl + "/api/map/",
          method: "DELETE",
          contentType: "application/json",
          headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
          data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id}),
          success: (response) => {
            document.location.href="index.html";
          },
          error: (err) => {
            alert(`${Dictionary.get(INDEX_DELETE_UNABLE)} ${Dictionary.get(err.responseJSON.error)}`);
          }
        });
        }
      });

      // Manage iframe
      $('.iframe-usermap').click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);

        if($(`#iframeContent-${mapNumber}`).css("display") == "none")
        {
          $(`#iframeContent-${mapNumber}`).css("display", "inline");
          $(`#iframeContent-${mapNumber}`).val(`<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?mapId=${mapNumber}&edit=false&defaultFullScreen=true&lang=${Dictionary.lang}"> </iframe>`);
        }
        else
        {
          $(`#iframeContent-${mapNumber}`).css("display", "none");
        }
      });
    }

    /* 
     * Display public maps of other users
     * @property {MapData[]}                      publicMaps                       The maps data
     */
    function displayPublicMap(publicMaps)
    {
      let contentPublic = "";
      let contentFeatured = "";

      for(let i = 0; i < publicMaps.length; i++)
      {
        let contentLine = "";
        let categoryText = Dictionary.get('MAP_TYPE_' + publicMaps[i].category.toUpperCase());
        contentLine += `<p>[${publicMaps[i].lang.toUpperCase()}][${categoryText}] ${publicMaps[i].name} - <i>${Dictionary.get('INDEX_MAP_CREATOR')} <b>${publicMaps[i].userName}</b></i>
        <a href="histoAtlas.html?mapId=${publicMaps[i].id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="${Dictionary.get('INDEX_MAP_VIEW')}" /></a>`;

        if(publicMaps[i].publicEditable)
        {
          contentLine += `<a href="histoAtlas.html?mapId=${publicMaps[i].id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="${Dictionary.get('INDEX_MAP_EDIT_COPY')}" /></a>`;
        }

        contentLine += `<a><img class="iframe-publicmap" id="iframeContent_${publicMaps[i].id}" src="img/menu/iframe.png" title="${Dictionary.get('INDEX_MAP_EXPORT_MAP')}" /></a>
        <input id="iframeContent-${publicMaps[i].id}" style="display:none; width:1150px; margin-left: 5px"></input>`;
        
        contentLine += `</p>`;

        if(publicMaps[i].topVisibility)
        {
          contentFeatured += contentLine;
        }
        else
        {
          contentPublic += contentLine;
        }
      }

      $("#public-maps").html(contentPublic);
      $("#featured-maps").html(contentFeatured);

      // Manage iframe
      $(".iframe-publicmap").click(function() 
      {
        let mapNumber = parseInt($(this).prop("id").split("_")[1]);

        if($(`#iframeContent-${mapNumber}`).css("display") == "none")
        {
          $(`#iframeContent-${mapNumber}`).css("display", "inline");
          $(`#iframeContent-${mapNumber}`).val(`<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?mapId=${mapNumber}&edit=false&defaultFullScreen=true&lang=${Dictionary.lang}"> </iframe>`);
        }
        else
        {
          $(`#iframeContent-${mapNumber}`).css("display", "none");
        }
      });
    }

    /*
     * Display user, if connected
     * @property {String}                      user                       The user name
     */ 
    function displayUser(user)
    {
      $("#connexion-div").html(`<h3 id="user-name-logged-in">${user}</h3><button id="logout" class="button-loggin">${Dictionary.get('INDEX_LOGOUT')}</button><br/><br/><a href="pages/profile.html"><button id="profile" class="button-loggin">${Dictionary.get('INDEX_PROFIL')}</button></a>`);
      $("#registration-button").css("display", "none");

      $("#logout").click(function() 
      {
        localStorage.removeItem('session-token-histoatlas');
        localStorage.removeItem('session-id-histoatlas');

        document.location.href="index.html";
      });
    }

    /*
     * Manage connexion button, display form 
     */
    $("#connexion-button").click(function() 
    {
      let content = "";
      content += `<label for="user-name">${Dictionary.get('INDEX_USER_NAME')}</label><input id="user-name" type="text"></input><br/>
      <label for="user-password">${Dictionary.get('INDEX_USER_PASSWORD')}</label><input id="user-password" type="password"></input><br/>
      <button id="cancel-login" class="button-loggin">${Dictionary.get('INDEX_CANCEL')}</button><button id="login" class="button-loggin">${Dictionary.get('INDEX_USER_CONNEXION')}</button>
      <br/><a href="pages/forgotPassword.html">${Dictionary.get('INDEX_FORGOT_PASSWORD')}</a>`;

      $("#connexion-div").html(content);

      // Cancel login action
      $("#cancel-login").click(function() 
      {
        document.location.href="index.html";
      });

      /*
       * Call API
       */
      function login()
      {
        let urlServer = config.serverUrl + "/api/user/login";

        let name = $("#user-name").val();
        let password = $("#user-password").val();

        $.ajax({
          url: urlServer,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({name : name, password : password}),
          success: (response) => {
            localStorage.setItem('session-token-histoatlas', response.token);
            localStorage.setItem('session-id-histoatlas', response.userId);

            document.location.href="index.html";
          },
          error: (err) => {
            alert(`${Dictionary.get('INDEX_LOGIN_UNABLE')} ${Dictionary.get(err.responseJSON.error)}`);
          }
        });
      }

      // Login on enter il focus
      $(window).keypress(function (e) {
        if(e.which == 13) {
          e.preventDefault()
          if (document.activeElement.id == "user-password" || document.activeElement.id == "user-name") {
            login();
          }
        }
      })

      /*
       * Clic login button
       */
      $("#login").click(function() 
      {
        login();
      });
    });

    // Init text from Dictionnary
    $("#exemple-maps-title").html(Dictionary.get('INDEX_EXEMPLE_MAPS_TITLE'));
    $("#user-maps-title").html(Dictionary.get('INDEX_USER_MAPS_TITLE'));
    $("#public-maps-title").html(Dictionary.get('INDEX_PUBLIC_MAPS_TITLE'));
    $("#description").html(Dictionary.get('INDEX_DESCRIPTION'));
    $("#help-menu-link-text").html(Dictionary.get('INDEX_HELP_MENU'));
    $("#video-link-text").html(Dictionary.get('INDEX_VIDEO_LINK_TEXT'));
    $("#version-link-text").html(Dictionary.get('INDEX_VERSION_LINK_TEXT') + "8");
    $("#contact-link-text").html(Dictionary.get('INDEX_CONTACT_LINK_TEXT'));
    $("#support-link-text").html(Dictionary.get('INDEX_SUPPORT_LINK_TEXT'));
    $("#source-code-link-text").html(Dictionary.get('INDEX_SOURCE_CODE_LINK_TEXT'));
    $("#twitter-link-text").html(Dictionary.get('INDEX_TWITTER_LINK_TEXT'));
    $("#creator-link-text").html(Dictionary.get('INDEX_CREATOR_LINK_TEXT'));
    $("#create_empty_map").html(Dictionary.get('INDEX_BOUTON_CREATE_NEW_MAP'));
    $("#featured-maps-title").html(Dictionary.get('INDEX_FEACTURED_MAPS_TITLE'));

    $("#connexion-button").html(Dictionary.get('INDEX_CONNEXION'));
    $("#registration-button").html(Dictionary.get('INDEX_REGISTRATION'));
    $("#cancel-button").html(Dictionary.get('INDEX_CANCEL'));

    $("#help-menu-link").prop("href", `files/HistoAtlas_Help_${Dictionary.lang}.pdf`);

    if(Dictionary.lang == "fr")
    {
      $("#version-link").prop("href", "pages/version8.html");
    }
    else if(Dictionary.lang == "en")
    {
      $("#version-link").prop("href", "pages/version8_en.html");
      $("#creator-link").prop("href", "http://dataexplorer.hd.free.fr/Presentation/index_en.html");
    }
  });
});